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

impl Default for EventBus {
    fn default() -> Self {
        Self::new()
    }
}

impl EventBus {
    pub fn new() -> Self {
        Self
    }
}
