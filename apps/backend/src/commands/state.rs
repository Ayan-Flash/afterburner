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
    pub obs_source: crate::integrations::obs::ObsSource,
    pub sync_server: crate::sync::SyncServer,
    pub smart_alerts: Arc<crate::ai::SmartAlertManager>,
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

        let smart_alerts = Arc::new(crate::ai::SmartAlertManager::new());
        let sa = smart_alerts.clone();
        monitoring.add_sample_hook(move |sample| {
            sa.feed_sample(sample);
        });

        Self {
            monitoring,
            alerts,
            remote: RwLock::new(None),
            overlay: RwLock::new(Some(overlay)),
            obs_source: crate::integrations::obs::ObsSource::new(9877),
            sync_server: crate::sync::SyncServer::new(9878),
            smart_alerts: crate::ai::SmartAlertManager::new(),
        }
    }
}

pub type SharedState = Arc<AppState>;
