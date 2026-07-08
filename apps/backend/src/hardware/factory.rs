use tracing::{info, warn};

use super::provider::GpuProvider;
use super::simulated::SimulatedGpuProvider;

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
    }

    #[cfg(not(target_os = "windows"))]
    info!("Non-Windows platform, falling back to simulated provider");

    info!("Falling back to simulated GPU provider");
    Box::new(SimulatedGpuProvider::new())
}
