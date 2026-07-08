use std::sync::{Arc, RwLock};

use crate::monitoring::MonitoringEngine;
use crate::alerts::AlertEngine;
use crate::remote::RemoteServer;
use crate::overlay::OverlayController;

pub struct AppState {
    pub monitoring: Arc<MonitoringEngine>,
    pub alerts: Arc<AlertEngine>,
    pub remote: RwLock<Option<RemoteServer>>,
    pub overlay: RwLock<Option<OverlayController>>,
}

impl AppState {
    pub fn new() -> Self {
        let provider = Box::new(crate::hardware::SimulatedGpuProvider::new());
        let monitoring = Arc::new(MonitoringEngine::new(provider));
        let alerts = Arc::new(AlertEngine::new(1000));

        for gpu in monitoring.gpus() {
            alerts.create_default_rules(&gpu.id);
        }

        let overlay = OverlayController::new(monitoring.clone());

        Self {
            monitoring,
            alerts,
            remote: RwLock::new(None),
            overlay: RwLock::new(Some(overlay)),
        }
    }
}

pub type SharedState = Arc<AppState>;
