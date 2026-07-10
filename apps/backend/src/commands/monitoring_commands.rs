use std::sync::atomic::{AtomicBool, Ordering};
use std::thread;
use std::time::Duration;

use tauri::State;
use tracing::info;

use super::state::SharedState;
use crate::utils::error::AppResult;

static MONITORING_ACTIVE: AtomicBool = AtomicBool::new(false);

#[tauri::command]
pub fn start_monitoring(state: State<'_, SharedState>) -> AppResult<()> {
    if MONITORING_ACTIVE.load(Ordering::Relaxed) {
        return Ok(()); // already running
    }

    info!("Starting background monitoring loop");
    state.monitoring.start();
    MONITORING_ACTIVE.store(true, Ordering::Relaxed);

    let app_state = (*state).clone();
    let sample_rate = 1000u64;

    thread::spawn(move || {
        while MONITORING_ACTIVE.load(Ordering::Relaxed) {
            app_state.monitoring.collect_all_once();
            thread::sleep(Duration::from_millis(sample_rate));
        }
        app_state.monitoring.stop();
        info!("Background monitoring loop exited");
    });

    Ok(())
}

#[tauri::command]
pub fn stop_monitoring(_state: State<'_, SharedState>) -> AppResult<()> {
    if !MONITORING_ACTIVE.load(Ordering::Relaxed) {
        return Ok(());
    }
    info!("Stopping background monitoring loop");
    MONITORING_ACTIVE.store(false, Ordering::Relaxed);
    Ok(())
}

#[tauri::command]
pub fn is_monitoring_running(_state: State<'_, SharedState>) -> AppResult<bool> {
    Ok(MONITORING_ACTIVE.load(Ordering::Relaxed))
}

#[tauri::command]
pub fn export_csv(
    state: State<'_, SharedState>,
    gpu_id: String,
    count: usize,
) -> AppResult<String> {
    info!(gpu_id, count, "Exporting CSV");
    Ok(state.monitoring.export_csv(&gpu_id, count))
}
