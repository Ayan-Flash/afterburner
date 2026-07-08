use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum AutomationEvent {
    AlertFired(String),
    TemperatureSpike(String, f64),
    FanFailure(String),
    PowerSurge(String, f64),
    GpuDisconnected(String),
    GpuConnected(String),
    Startup,
}

pub struct EventBus;

impl EventBus {
    pub fn new() -> Self {
        Self
    }
}
