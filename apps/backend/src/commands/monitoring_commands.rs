use tauri::State;
use tracing::info;

use super::state::SharedState;

#[tauri::command]
pub fn start_monitoring(state: State<'_, SharedState>) -> Result<(), String> {
    info!("Starting monitoring");
    state.monitoring.start();
    Ok(())
}

#[tauri::command]
pub fn stop_monitoring(state: State<'_, SharedState>) -> Result<(), String> {
    info!("Stopping monitoring");
    state.monitoring.stop();
    Ok(())
}

#[tauri::command]
pub fn is_monitoring_running(state: State<'_, SharedState>) -> Result<bool, String> {
    Ok(state.monitoring.is_running())
}

#[tauri::command]
pub fn export_csv(
    state: State<'_, SharedState>,
    gpu_id: String,
    count: usize,
) -> Result<String, String> {
    info!(gpu_id, count, "Exporting CSV");
    Ok(state.monitoring.export_csv(&gpu_id, count))
}
