use std::sync::{Arc, RwLock};

use crate::database::Database;
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
    pub db: Arc<Database>,
}

impl AppState {
    pub fn new() -> Self {
        let db = Arc::new(
            Database::open().expect("Failed to open database"),
        );

        let provider = crate::hardware::create_provider();
        let monitoring = Arc::new(MonitoringEngine::new(provider));
        tracing::info!("AppState::new: MonitoringEngine created");
        let alerts = Arc::new(AlertEngine::new(1000));
        tracing::info!("AppState::new: AlertEngine created");

        tracing::info!("AppState::new: Retrieving GPUs");
        let gpus = monitoring.gpus();
        tracing::info!("AppState::new: GPUs retrieved: {}", gpus.len());
        for gpu in gpus {
            alerts.create_default_rules(&gpu.id);
        }
        tracing::info!("AppState::new: Default rules created");

        let overlay = OverlayController::new(monitoring.clone());

        let smart_alerts = Arc::new(crate::ai::SmartAlertManager::new());
        let sa = smart_alerts.clone();
        let db_hook = db.clone();
        monitoring.add_sample_hook(move |sample| {
            sa.feed_sample(sample);
            if let Err(e) = db_hook.insert_sample(sample) {
                tracing::error!(error = %e, "Failed to persist sample");
            }
        });

        Self {
            monitoring,
            alerts,
            remote: RwLock::new(None),
            overlay: RwLock::new(Some(overlay)),
            obs_source: crate::integrations::obs::ObsSource::new(9877),
            sync_server: crate::sync::SyncServer::new(9878),
            smart_alerts,
            db,
        }
    }
}

pub type SharedState = Arc<AppState>;
