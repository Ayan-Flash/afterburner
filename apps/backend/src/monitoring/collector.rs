use crate::hardware::{GpuProvider, GpuSample};
use tracing::{error, info};

pub struct Collector {
    provider: Box<dyn GpuProvider>,
}

impl Collector {
    pub fn new(provider: Box<dyn GpuProvider>) -> Self {
        Self { provider }
    }

    pub fn provider_name(&self) -> &str {
        self.provider.name()
    }

    pub fn enumerate_gpus(&self) -> Vec<crate::hardware::GpuIdentity> {
        match self.provider.enumerate() {
            Ok(gpus) => gpus,
            Err(e) => {
                error!("Failed to enumerate GPUs: {}", e);
                vec![]
            }
        }
    }

    pub fn collect_sample(&self, gpu_id: &str) -> Option<GpuSample> {
        match self.provider.read_sample(gpu_id) {
            Ok(sample) => {
                info!(gpu_id, "Collected sample");
                Some(sample)
            }
            Err(e) => {
                error!(gpu_id, error = %e, "Failed to collect sample");
                None
            }
        }
    }

    pub fn provider_ref(&self) -> &dyn GpuProvider {
        self.provider.as_ref()
    }
}
