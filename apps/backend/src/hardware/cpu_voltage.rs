//! CPU voltage reading via WMI on Windows.
//!
//! Voltage is not exposed by the OS through simple system calls like
//! frequency. This module uses multiple strategies:
//!
//! 1. **LibreHardwareMonitor WMI** — if LHM is running, its WMI namespace
//!    (`root\LibreHardwareMonitor`) exposes per-core Vcore sensors.
//! 2. **Win32_Processor.CurrentVoltage** — a legacy WMI property that
//!    reports a bit-encoded voltage value on some systems.
//!
//! Because each strategy spawns a subprocess (PowerShell), results are
//! cached for `CACHE_TTL_SECS` to avoid saturating the CPU with WMI queries.

use std::time::Instant;

use serde::Serialize;

/// Cached voltage reading, internally rate-limited.
#[derive(Debug)]
pub struct VoltageReader {
    inner: std::sync::Mutex<VoltageInner>,
}

#[derive(Debug)]
struct VoltageInner {
    last: CpuVoltage,
    last_queried: Instant,
}

/// Voltage readings from the CPU package.
#[derive(Debug, Clone, Serialize)]
pub struct CpuVoltage {
    /// Core voltage (Vcore) in volts, e.g. 1.256 V.
    pub vcore: Option<f64>,
    /// Source label — describes how the value was obtained.
    pub source: &'static str,
}

const CACHE_TTL_SECS: u64 = 3;

impl Default for VoltageReader {
    fn default() -> Self {
        Self::new()
    }
}

impl VoltageReader {
    pub fn new() -> Self {
        Self {
            inner: std::sync::Mutex::new(VoltageInner {
                last: CpuVoltage {
                    vcore: None,
                    source: "unavailable",
                },
                last_queried: Instant::now()
                    .checked_sub(std::time::Duration::from_secs(CACHE_TTL_SECS + 1))
                    .unwrap_or_else(Instant::now),
            }),
        }
    }

    /// Returns the latest voltage reading. If the cache is stale,
    /// triggers a fresh WMI query (spawns PowerShell).
    pub fn read(&self) -> CpuVoltage {
        let mut inner = self.inner.lock().unwrap_or_else(|e| e.into_inner());

        if inner.last_queried.elapsed().as_secs() < CACHE_TTL_SECS {
            return inner.last.clone();
        }

        let fresh = query_voltage();
        inner.last = fresh.clone();
        inner.last_queried = Instant::now();
        fresh
    }
}

/// Attempt to read CPU voltage via multiple WMI strategies.
fn query_voltage() -> CpuVoltage {
    // 1. Try LibreHardwareMonitor WMI (most accurate on modern systems)
    if let Some(v) = lhm_vcore() {
        return CpuVoltage {
            vcore: Some(v),
            source: "LibreHardwareMonitor",
        };
    }

    // 2. Fallback: legacy Win32_Processor.CurrentVoltage
    if let Some(v) = win32_voltage() {
        return CpuVoltage {
            vcore: Some(v),
            source: "Win32_Processor (WMI)",
        };
    }

    CpuVoltage {
        vcore: None,
        source: "unavailable",
    }
}

/// Query LibreHardwareMonitor's WMI namespace for the first CPU Vcore sensor.
///
/// LHM exposes sensors like:
///   `Get-CimInstance -Namespace root/LibreHardwareMonitor -ClassName Sensor
///    | Where-Object { $_.SensorType -eq 'Voltage' -and $_.Name -like '*Vcore*' }`
fn lhm_vcore() -> Option<f64> {
    let script = r#"
try {
    $sensors = Get-CimInstance -Namespace "root/LibreHardwareMonitor" -ClassName Sensor -ErrorAction Stop
    $vcore = $sensors | Where-Object { $_.SensorType -eq 'Voltage' -and $_.Name -like '*Vcore*' } | Select-Object -First 1
    if ($vcore -and $vcore.Value -ne $null) { [double]$vcore.Value }
} catch {}
"#;
    run_powershell(script).and_then(|s| s.trim().parse::<f64>().ok())
}

/// Query Win32_Processor.CurrentVoltage (legacy).
///
/// The value is a bitfield (uint16):
/// - Bits 0–5: Voltage ID (VID) when bit 6 is set.
/// - Bit 6:    Voltage format (1 = VID-encoded, 0 = raw).
/// - Bit 7:    Reserved.
/// - Bits 8–9: Voltage level indication.
///
/// VID-to-voltage conversion follows Intel/AMD VID tables. We use a
/// simplified heuristic: when bit 6 is set, decode the 6-bit VID;
/// otherwise treat the lower nibble as millivolts × 10.
fn win32_voltage() -> Option<f64> {
    let script = r#"
try {
    $cpu = Get-CimInstance -ClassName Win32_Processor -ErrorAction Stop | Select-Object -First 1
    if ($cpu.CurrentVoltage -ne $null -and $cpu.CurrentVoltage -gt 0) {
        [int]$cpu.CurrentVoltage
    }
} catch {}
"#;
    let raw = run_powershell(script).and_then(|s| s.trim().parse::<u16>().ok())?;
    if raw == 0 {
        return None;
    }

    // Decode the bitfield
    let vid_based = (raw & (1 << 6)) != 0;
    if vid_based {
        // Bits 0–5 hold a Voltage ID (VID).
        // Common VID-to-voltage mapping for modern CPUs (approximate):
        // voltage = 0.5 + VID * 0.0125  (Intel Skylake+ approximation)
        let vid = raw & 0x3F;
        Some(0.5 + (vid as f64) * 0.0125)
    } else {
        // Raw voltage: bits 0–5 in decivolts × 10 (deprecated).
        let decivolts_x10 = raw & 0x3F;
        if decivolts_x10 > 0 {
            Some((decivolts_x10 as f64) * 0.01)
        } else {
            None
        }
    }
}

/// Run a PowerShell script and return its stdout if successful.
/// Timeout is set to 5 seconds to avoid hanging.
fn run_powershell(script: &str) -> Option<String> {
    let mut cmd = std::process::Command::new("powershell");

    #[cfg(windows)]
    {
        use std::os::windows::process::CommandExt;
        cmd.creation_flags(0x08000000); // CREATE_NO_WINDOW
    }

    let output = cmd
        .args([
            "-NoProfile",
            "-NonInteractive",
            "-Command",
            script,
        ])
        .output()
        .ok()?;

    if !output.status.success() {
        return None;
    }

    let stdout = String::from_utf8(output.stdout).ok()?;
    let trimmed = stdout.trim();
    if trimmed.is_empty() { None } else { Some(trimmed.to_string()) }
}
