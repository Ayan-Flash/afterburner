use tracing::{info, warn};

use super::provider::{
    GpuControlState, GpuIdentity, GpuProvider, GpuProviderError, GpuSample,
};
#[cfg(not(target_os = "windows"))]
use super::simulated::SimulatedGpuProvider;

struct UnavailableGpuProvider {
    reason: String,
}

impl UnavailableGpuProvider {
    fn new(reason: impl Into<String>) -> Self {
        Self {
            reason: reason.into(),
        }
    }
}

impl GpuProvider for UnavailableGpuProvider {
    fn name(&self) -> &str {
        "unavailable"
    }

    fn enumerate(&self) -> Result<Vec<GpuIdentity>, GpuProviderError> {
        Ok(vec![])
    }

    fn read_sample(&self, gpu_id: &str) -> Result<GpuSample, GpuProviderError> {
        Err(GpuProviderError::NotAvailable(format!(
            "{}; cannot read sample for {}",
            self.reason, gpu_id
        )))
    }

    fn read_control_state(&self, gpu_id: &str) -> Result<GpuControlState, GpuProviderError> {
        Err(GpuProviderError::NotAvailable(format!(
            "{}; cannot read control state for {}",
            self.reason, gpu_id
        )))
    }

    fn set_fan_speed(&self, _gpu_id: &str, _percent: f64) -> Result<(), GpuProviderError> {
        Err(GpuProviderError::NotAvailable(self.reason.clone()))
    }

    fn set_core_clock_offset(&self, _gpu_id: &str, _offset_mhz: i32) -> Result<(), GpuProviderError> {
        Err(GpuProviderError::NotAvailable(self.reason.clone()))
    }

    fn set_memory_clock_offset(&self, _gpu_id: &str, _offset_mhz: i32) -> Result<(), GpuProviderError> {
        Err(GpuProviderError::NotAvailable(self.reason.clone()))
    }

    fn set_power_limit(&self, _gpu_id: &str, _percent: f64) -> Result<(), GpuProviderError> {
        Err(GpuProviderError::NotAvailable(self.reason.clone()))
    }

    fn set_voltage_offset(&self, _gpu_id: &str, _offset_mv: i32) -> Result<(), GpuProviderError> {
        Err(GpuProviderError::NotAvailable(self.reason.clone()))
    }
}

pub fn create_provider() -> Box<dyn GpuProvider> {
    #[cfg(target_os = "windows")]
    {
        info!("Attempting to initialize NVIDIA NVML provider...");
        match crate::hardware::nvidia::NvidiaProvider::try_new() {
            Ok(provider) => {
                info!("NVIDIA NVML provider initialized successfully");
                return Box::new(provider);
            }
            Err(e) => {
                warn!("NVIDIA NVML provider failed: {}", e);
            }
        }

        info!("Attempting to initialize WMI GPU provider...");
        match crate::hardware::wmi_provider::WmiGpuProvider::try_new() {
            Ok(provider) => {
                info!("WMI GPU provider initialized successfully");
                return Box::new(provider);
            }
            Err(e) => {
                warn!("WMI GPU provider failed: {}", e);
            }
        }

        warn!("No real Windows GPU telemetry provider is available");
        return Box::new(UnavailableGpuProvider::new(
            "No real Windows GPU telemetry provider is available",
        ));
    }

    #[cfg(not(target_os = "windows"))]
    {
        info!("Non-Windows platform, falling back to simulated provider");
        Box::new(SimulatedGpuProvider::new())
    }
}
