//! Real CPU telemetry via the `sysinfo` crate.
//!
//! Provides live, accurate readings for the Armoury-Crate-style dashboard:
//! CPU model/vendor, physical & logical core counts, per-core current
//! frequency (MHz), per-core & package utilization, and — where the OS
//! exposes a thermal sensor — package temperature.
//!
//! Notes on accuracy:
//! - **Frequency** is the real per-core *current* clock. On Windows it is read
//!   directly from `CallNtPowerInformation(ProcessorInformation)` — the same
//!   native power API Task Manager uses — which reports live boost/idle clocks
//!   per logical processor. `sysinfo`'s frequency on Windows is unreliable (it
//!   returns the static registry base clock), so we only fall back to it when
//!   the native call is unavailable (e.g. non-Windows builds).
//! - **Temperature** depends on the OS surfacing an ACPI/CPU thermal zone; when
//!   none is available it is reported as `None` (UI shows "N/A") rather than a
//!   fabricated number.
//! - **Voltage** is not exposed by the OS without a kernel-mode sensor driver
//!   (e.g. LibreHardwareMonitor / WinRing0), so it is reported as `None`.

use std::sync::Mutex;

use serde::{Deserialize, Serialize};
use sysinfo::{Components, System};

/// Static CPU identity — queried once at startup.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CpuInfo {
    pub model: String,
    pub vendor: String,
    pub physical_cores: usize,
    pub logical_cores: usize,
}

/// Per-core live reading.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CpuCoreSample {
    pub core_index: usize,
    pub frequency_mhz: u64,
    pub usage_percent: f32,
}

/// Aggregate live reading for the whole package.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CpuSample {
    pub timestamp: i64,
    /// Package frequency shown in the big gauge (MHz) — the busiest core's clock.
    pub frequency_mhz: u64,
    /// Gauge scale ceiling (MHz).
    pub max_frequency_mhz: u64,
    pub usage_percent: f32,
    pub temperature_celsius: Option<f64>,
    pub voltage_volts: Option<f64>,
    pub cores: Vec<CpuCoreSample>,
}

pub struct CpuMonitor {
    inner: Mutex<Inner>,
    info: CpuInfo,
}

struct Inner {
    sys: System,
    components: Components,
    /// Highest package frequency observed so far — used to derive a stable
    /// gauge scale when the OS does not report a turbo ceiling directly.
    max_freq_seen: u64,
    /// Live per-logical-processor clocks read from the native Windows power
    /// API. `None` when that API is unavailable (non-Windows / load failure),
    /// in which case we fall back to `sysinfo`'s frequency.
    #[cfg(windows)]
    power: Option<win_power::ProcessorPower>,
}

impl Default for CpuMonitor {
    fn default() -> Self {
        Self::new()
    }
}

impl CpuMonitor {
    pub fn new() -> Self {
        let mut sys = System::new();
        sys.refresh_cpu_all();

        let cpus = sys.cpus();
        let model = cpus
            .first()
            .map(|c| c.brand().trim().to_string())
            .filter(|s| !s.is_empty())
            .unwrap_or_else(|| "Unknown CPU".to_string());
        let vendor = cpus
            .first()
            .map(|c| c.vendor_id().trim().to_string())
            .unwrap_or_default();
        let logical_cores = cpus.len();
        let physical_cores = sys.physical_core_count().unwrap_or(logical_cores);

        tracing::info!(
            "CpuMonitor: {} ({} physical / {} logical cores)",
            model,
            physical_cores,
            logical_cores
        );

        let info = CpuInfo {
            model,
            vendor,
            physical_cores,
            logical_cores,
        };

        Self {
            inner: Mutex::new(Inner {
                sys,
                components: Components::new_with_refreshed_list(),
                max_freq_seen: 0,
                #[cfg(windows)]
                power: win_power::ProcessorPower::new(logical_cores),
            }),
            info,
        }
    }

    /// Static CPU identity (cheap — cloned from cached values).
    pub fn info(&self) -> CpuInfo {
        self.info.clone()
    }

    /// Take a fresh live sample. Expected to be polled ~once per second; the
    /// interval between calls is what CPU usage percentages are computed over.
    pub fn sample(&self) -> CpuSample {
        let mut inner = self.inner.lock().unwrap_or_else(|e| e.into_inner());
        inner.sys.refresh_cpu_all();

        // Read live per-core clocks from the native Windows power API. This is
        // the reliable source on Windows; `sysinfo`'s frequency is only used as
        // a fallback when the native reading is unavailable.
        #[cfg(windows)]
        let native = inner.power.as_ref().and_then(|p| p.read());
        #[cfg(not(windows))]
        let native: Option<Vec<win_power::CoreClock>> = None;

        let cores: Vec<CpuCoreSample> = inner
            .sys
            .cpus()
            .iter()
            .enumerate()
            .map(|(i, c)| {
                let frequency_mhz = native
                    .as_ref()
                    .and_then(|n| n.get(i))
                    .map(|clock| clock.current_mhz as u64)
                    .filter(|mhz| *mhz > 0)
                    .unwrap_or_else(|| c.frequency());
                CpuCoreSample {
                    core_index: i,
                    frequency_mhz,
                    usage_percent: c.cpu_usage(),
                }
            })
            .collect();

        // The busiest core's clock is the most representative "current speed"
        // for the package (this matches how Armoury Crate reports the big number).
        let package_freq = cores.iter().map(|c| c.frequency_mhz).max().unwrap_or(0);
        let usage_percent = inner.sys.global_cpu_usage();

        if package_freq > inner.max_freq_seen {
            inner.max_freq_seen = package_freq;
        }
        // Gauge scale: prefer the true max clock the OS advertises (native API);
        // otherwise use the observed peak rounded up to the next 100 MHz with a
        // little headroom. Floored at 3000 MHz so the needle isn't pinned before
        // boost kicks in.
        let advertised_max = native
            .as_ref()
            .and_then(|n| n.iter().map(|c| c.max_mhz).max())
            .filter(|m| *m > 0)
            .map(|m| m as u64)
            .unwrap_or(0);
        let max_frequency_mhz = advertised_max
            .max(((((inner.max_freq_seen as f64) * 1.05) / 100.0).ceil() as u64 * 100))
            .max(3000);

        let temperature_celsius = read_cpu_temperature(&mut inner.components);

        CpuSample {
            timestamp: chrono::Utc::now().timestamp_millis(),
            frequency_mhz: package_freq,
            max_frequency_mhz,
            usage_percent,
            temperature_celsius,
            // Not available without a kernel-mode sensor driver — see module docs.
            voltage_volts: None,
            cores,
        }
    }
}

/// Find a CPU/package temperature among the system's thermal components,
/// falling back to the first plausible reading. Returns `None` when the OS
/// exposes no usable thermal sensor.
fn read_cpu_temperature(components: &mut Components) -> Option<f64> {
    components.refresh_list();

    let mut fallback: Option<f64> = None;
    for component in components.iter() {
        let temp = component.temperature() as f64;
        if !temp.is_finite() || temp <= 0.0 {
            continue;
        }
        let label = component.label().to_lowercase();
        if label.contains("cpu")
            || label.contains("core")
            || label.contains("package")
            || label.contains("tctl")
            || label.contains("tdie")
        {
            return Some(temp);
        }
        if fallback.is_none() {
            fallback = Some(temp);
        }
    }
    fallback
}

/// A single logical processor's live clocks, as reported by the OS.
#[derive(Debug, Clone, Copy)]
pub struct CoreClock {
    /// Live current clock (MHz).
    pub current_mhz: u32,
    /// Advertised maximum clock (MHz) — the turbo ceiling.
    pub max_mhz: u32,
}

/// Native Windows per-core frequency via `CallNtPowerInformation`.
///
/// `sysinfo` on Windows reports the static registry base clock, so for an
/// accurate live gauge we go straight to `powrprof.dll!CallNtPowerInformation`
/// with `ProcessorInformation`, which fills one `PROCESSOR_POWER_INFORMATION`
/// per logical processor — exactly what Task Manager reads.
#[cfg(windows)]
pub mod win_power {
    use std::ffi::c_void;

    use libloading::{Library, Symbol};

    pub use super::CoreClock;

    /// Mirror of the Win32 `PROCESSOR_POWER_INFORMATION` struct.
    #[repr(C)]
    #[derive(Clone, Copy, Default)]
    struct ProcessorPowerInformation {
        number: u32,
        max_mhz: u32,
        current_mhz: u32,
        mhz_limit: u32,
        max_idle_state: u32,
        current_idle_state: u32,
    }

    /// `POWER_INFORMATION_LEVEL::ProcessorInformation`.
    const PROCESSOR_INFORMATION: i32 = 11;
    /// `STATUS_SUCCESS`.
    const STATUS_SUCCESS: i32 = 0;

    type CallNtPowerInformationFn =
        unsafe extern "system" fn(i32, *mut c_void, u32, *mut c_void, u32) -> i32;

    pub struct ProcessorPower {
        // Keep the library loaded for the lifetime of the monitor so the
        // resolved symbol stays valid.
        _lib: Library,
        call: CallNtPowerInformationFn,
        cores: usize,
    }

    // The resolved function pointer is a plain `extern "system"` fn into a DLL
    // that stays loaded for the struct's lifetime; sharing it across threads is
    // sound (the underlying API is stateless and reentrant).
    unsafe impl Send for ProcessorPower {}
    unsafe impl Sync for ProcessorPower {}

    impl ProcessorPower {
        pub fn new(cores: usize) -> Option<Self> {
            if cores == 0 {
                return None;
            }
            let lib = unsafe { Library::new("powrprof.dll") }.ok()?;
            let call: CallNtPowerInformationFn = {
                let sym: Symbol<CallNtPowerInformationFn> =
                    unsafe { lib.get(b"CallNtPowerInformation").ok()? };
                *sym
            };
            tracing::info!("CpuMonitor: using native CallNtPowerInformation for CPU clocks");
            Some(Self {
                _lib: lib,
                call,
                cores,
            })
        }

        /// Read live per-core clocks. Returns `None` if the call fails so the
        /// caller can fall back to `sysinfo`.
        pub fn read(&self) -> Option<Vec<CoreClock>> {
            let mut buf = vec![ProcessorPowerInformation::default(); self.cores];
            let size = std::mem::size_of_val(buf.as_slice()) as u32;
            let status = unsafe {
                (self.call)(
                    PROCESSOR_INFORMATION,
                    std::ptr::null_mut(),
                    0,
                    buf.as_mut_ptr() as *mut c_void,
                    size,
                )
            };
            if status != STATUS_SUCCESS {
                return None;
            }
            Some(
                buf.iter()
                    .map(|p| CoreClock {
                        current_mhz: p.current_mhz,
                        max_mhz: p.max_mhz,
                    })
                    .collect(),
            )
        }
    }
}

#[cfg(not(windows))]
pub mod win_power {
    pub use super::CoreClock;
}
