use crate::monitoring::MonitoringEngine;
use crate::alerts::AlertEngine;
use std::sync::Arc;

pub struct AppState {
    pub monitoring: MonitoringEngine,
    pub alerts: AlertEngine,
}

impl AppState {
    pub fn new() -> Self {
        let provider = Box::new(crate::hardware::SimulatedGpuProvider::new());
        let monitoring = MonitoringEngine::new(provider);
        let alerts = AlertEngine::new(1000);

        for gpu in monitoring.gpus() {
            alerts.create_default_rules(&gpu.id);
        }

        Self { monitoring, alerts }
    }
}

pub type SharedState = Arc<AppState>;
