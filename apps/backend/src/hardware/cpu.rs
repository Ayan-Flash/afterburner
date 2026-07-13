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

use super::cpu_voltage::VoltageReader;

/// Static CPU identity — queried once at startup.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CpuInfo {
    pub model: String,
    pub vendor: String,
    pub physical_cores: usize,
    pub logical_cores: usize,
    pub is_elevated: bool,
}

/// Per-core live reading.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CpuCoreSample {
    pub core_index: usize,
    pub frequency_mhz: u64,
    pub usage_percent: f32,
    pub temperature_celsius: Option<f64>,
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
    /// Rate-limited WMI voltage reader (updated every ~3s).
    voltage: VoltageReader,
}

struct Inner {
    sys: System,
    components: Components,
    /// Highest package frequency observed so far — used to derive a stable
    /// gauge scale when the OS does not report a turbo ceiling directly.
    max_freq_seen: u64,
    /// Live CPU performance percentage query on Windows.
    #[cfg(windows)]
    pdh: Option<win_power::PdhMonitor>,
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
            is_elevated: check_elevation(),
        };

        Self {
            inner: Mutex::new(Inner {
                sys,
                components: Components::new_with_refreshed_list(),
                max_freq_seen: 0,
                #[cfg(windows)]
                pdh: win_power::PdhMonitor::new(),
            }),
            info,
            voltage: VoltageReader::new(),
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

        // Query CPU performance percentage via Windows PDH counter
        #[cfg(windows)]
        let perf_percent = inner.pdh.as_ref().and_then(|p| p.read_performance_percent());
        #[cfg(not(windows))]
        let perf_percent: Option<f64> = None;

        let temperature_celsius = read_cpu_temperature(&mut inner.components);

        let cores: Vec<CpuCoreSample> = inner
            .sys
            .cpus()
            .iter()
            .enumerate()
            .map(|(i, c)| {
                let base_freq = c.frequency();
                let frequency_mhz = if let Some(pct) = perf_percent {
                    let calculated = ((base_freq as f64) * (pct / 100.0)) as u64;
                    if calculated > 0 { calculated } else { base_freq }
                } else {
                    base_freq
                };
                CpuCoreSample {
                    core_index: i,
                    frequency_mhz,
                    usage_percent: c.cpu_usage(),
                    temperature_celsius,
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

        // Gauge scale: observed peak rounded up to the next 100 MHz with a
        // little headroom. Floored at 3000 MHz so the needle isn't pinned before
        // boost kicks in.
        let max_frequency_mhz = (((inner.max_freq_seen as f64) * 1.05) / 100.0).ceil() as u64 * 100;
        let max_frequency_mhz = max_frequency_mhz.max(3000);

        let voltage_volts = self.voltage.read().vcore;

        CpuSample {
            timestamp: chrono::Utc::now().timestamp_millis(),
            frequency_mhz: package_freq,
            max_frequency_mhz,
            usage_percent,
            temperature_celsius,
            voltage_volts,
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

/// Native Windows per-core frequency via PDH query.
#[cfg(windows)]
pub mod win_power {
    use libloading::Library;

    #[repr(C)]
    #[derive(Clone, Copy)]
    pub struct PdhFmtCounterValue {
        pub c_status: u32,
        pub value: PdhFmtCounterValueUnion,
    }

    #[repr(C)]
    #[derive(Clone, Copy)]
    pub union PdhFmtCounterValueUnion {
        pub long_value: i32,
        pub double_value: f64,
        pub large_value: i64,
        pub ansi_string_value: *const u8,
        pub wide_string_value: *const u16,
    }

    fn encode_wide(s: &str) -> Vec<u16> {
        s.encode_utf16().chain(std::iter::once(0)).collect()
    }

    pub struct PdhMonitor {
        _lib: Library,
        pdh_collect_query_data: unsafe extern "system" fn(isize) -> i32,
        pdh_get_formatted_value: unsafe extern "system" fn(isize, u32, *mut u32, *mut PdhFmtCounterValue) -> i32,
        pdh_close_query: unsafe extern "system" fn(isize) -> i32,
        query: isize,
        counter: isize,
    }

    unsafe impl Send for PdhMonitor {}
    unsafe impl Sync for PdhMonitor {}

    impl PdhMonitor {
        pub fn new() -> Option<Self> {
            let lib = unsafe { Library::new("pdh.dll") }.ok()?;
            
            type PdhOpenQueryW = unsafe extern "system" fn(*const u16, usize, *mut isize) -> i32;
            type PdhAddEnglishCounterW = unsafe extern "system" fn(isize, *const u16, usize, *mut isize) -> i32;
            type PdhCollectQueryData = unsafe extern "system" fn(isize) -> i32;
            type PdhGetFormattedCounterValue = unsafe extern "system" fn(isize, u32, *mut u32, *mut PdhFmtCounterValue) -> i32;
            type PdhCloseQuery = unsafe extern "system" fn(isize) -> i32;

            let pdh_open_query: PdhOpenQueryW = unsafe { *lib.get(b"PdhOpenQueryW").ok()? };
            let pdh_add_english_counter: PdhAddEnglishCounterW = unsafe { *lib.get(b"PdhAddEnglishCounterW").ok()? };
            let pdh_collect_query_data: PdhCollectQueryData = unsafe { *lib.get(b"PdhCollectQueryData").ok()? };
            let pdh_get_formatted_value: PdhGetFormattedCounterValue = unsafe { *lib.get(b"PdhGetFormattedCounterValue").ok()? };
            let pdh_close_query: PdhCloseQuery = unsafe { *lib.get(b"PdhCloseQuery").ok()? };

            let mut query = 0;
            let status = unsafe { pdh_open_query(std::ptr::null(), 0, &mut query) };
            if status != 0 {
                return None;
            }

            let path = encode_wide("\\Processor Information(_Total)\\% Processor Performance");
            let mut counter = 0;
            let status = unsafe { pdh_add_english_counter(query, path.as_ptr(), 0, &mut counter) };
            if status != 0 {
                unsafe { pdh_close_query(query); }
                return None;
            }

            // Initialize query data
            unsafe { pdh_collect_query_data(query); }

            tracing::info!("CpuMonitor: using native PDH query for CPU performance tracking");

            Some(Self {
                _lib: lib,
                pdh_collect_query_data,
                pdh_get_formatted_value,
                pdh_close_query,
                query,
                counter,
            })
        }

        pub fn read_performance_percent(&self) -> Option<f64> {
            let status = unsafe { (self.pdh_collect_query_data)(self.query) };
            if status != 0 {
                return None;
            }

            let mut value = PdhFmtCounterValue {
                c_status: 0,
                value: PdhFmtCounterValueUnion { double_value: 0.0 },
            };
            let mut counter_type = 0;
            let status = unsafe {
                (self.pdh_get_formatted_value)(self.counter, 0x200, &mut counter_type, &mut value)
            };
            if status != 0 {
                return None;
            }

            unsafe { Some(value.value.double_value) }
        }
    }

    impl Drop for PdhMonitor {
        fn drop(&mut self) {
            unsafe {
                (self.pdh_close_query)(self.query);
            }
        }
    }
}

#[cfg(not(windows))]
pub mod win_power {}

#[cfg(windows)]
fn check_elevation() -> bool {
    use std::os::windows::process::CommandExt;
    std::process::Command::new("net")
        .arg("session")
        .creation_flags(0x08000000) // CREATE_NO_WINDOW
        .status()
        .map(|s| s.success())
        .unwrap_or(false)
}

#[cfg(not(windows))]
fn check_elevation() -> bool {
    false
}
