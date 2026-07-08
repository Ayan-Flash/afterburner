use tracing::info;

use super::provider::*;

/// WMI-based GPU provider for AMD/Intel GPUs on Windows.
///
/// This provider uses Windows Management Instrumentation (WMI) to query
/// GPU information via the Win32_VideoController class. It is used as a
/// fallback when the NVIDIA NVML provider is not available.
///
/// Note: Full implementation requires the `wmi` crate and COM initialization.
/// Currently provides placeholder responses — extend with real WMI queries
/// for production use.
pub struct WmiGpuProvider;

impl WmiGpuProvider {
    pub fn try_new() -> Result<Self, String> {
        info!("WMI GPU provider: Windows-native provider for AMD/Intel GPUs");
        info!("WMI provider requires the `wmi` crate for full implementation");
        Err("WMI provider requires the `wmi` crate (add to Cargo.toml)".into())
    }
}

impl GpuProvider for WmiGpuProvider {
    fn name(&self) -> &str {
        "Windows WMI (placeholder)"
    }

    fn enumerate(&self) -> Result<Vec<GpuIdentity>, GpuProviderError> {
        Err(GpuProviderError::NotAvailable(
            "WMI provider not fully implemented — add `wmi` crate and implement WMI queries".into(),
        ))
    }

    fn read_sample(&self, _gpu_id: &str) -> Result<GpuSample, GpuProviderError> {
        Err(GpuProviderError::NotAvailable(
            "WMI provider not fully implemented".into(),
        ))
    }

    fn read_control_state(&self, _gpu_id: &str) -> Result<GpuControlState, GpuProviderError> {
        Err(GpuProviderError::NotAvailable(
            "WMI provider not fully implemented".into(),
        ))
    }

    fn set_fan_speed(&self, _gpu_id: &str, _percent: f64) -> Result<(), GpuProviderError> {
        Err(GpuProviderError::NotAvailable(
            "Fan control not available via WMI".into(),
        ))
    }

    fn set_core_clock_offset(&self, _gpu_id: &str, _offset_mhz: i32) -> Result<(), GpuProviderError> {
        Err(GpuProviderError::NotAvailable(
            "Clock control not available via WMI".into(),
        ))
    }

    fn set_memory_clock_offset(&self, _gpu_id: &str, _offset_mhz: i32) -> Result<(), GpuProviderError> {
        Err(GpuProviderError::NotAvailable(
            "Memory clock control not available via WMI".into(),
        ))
    }

    fn set_power_limit(&self, _gpu_id: &str, _percent: f64) -> Result<(), GpuProviderError> {
        Err(GpuProviderError::NotAvailable(
            "Power limit control not available via WMI".into(),
        ))
    }

    fn set_voltage_offset(&self, _gpu_id: &str, _offset_mv: i32) -> Result<(), GpuProviderError> {
        Err(GpuProviderError::NotAvailable(
            "Voltage control not available via WMI".into(),
        ))
    }
}
