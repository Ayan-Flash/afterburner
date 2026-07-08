use tauri::State;
use tracing::info;

use super::state::SharedState;
use crate::hardware::GpuIdentity;

#[tauri::command]
pub fn list_gpus(state: State<'_, SharedState>) -> Result<Vec<GpuIdentity>, String> {
    info!("Listing GPUs");
    Ok(state.monitoring.gpus())
}

#[tauri::command]
pub fn get_gpu_data(state: State<'_, SharedState>, gpu_id: String) -> Result<serde_json::Value, String> {
    let sample = state
        .monitoring
        .collect_once(&gpu_id)
        .ok_or_else(|| format!("Failed to collect data for GPU: {}", gpu_id))?;

    let alerts = state.alerts.evaluate_sample(&sample);

    Ok(serde_json::json!({
        "sample": sample,
        "alerts": alerts,
    }))
}

#[tauri::command]
pub fn get_gpu_history(
    state: State<'_, SharedState>,
    gpu_id: String,
    count: usize,
) -> Result<serde_json::Value, String> {
    let samples = state.monitoring.get_exported_samples(&gpu_id, count);
    let aggregated = state.monitoring.get_aggregated(&gpu_id, count);

    Ok(serde_json::json!({
        "samples": samples,
        "aggregated": aggregated,
    }))
}

#[tauri::command]
pub fn get_gpu_control_state(
    state: State<'_, SharedState>,
    gpu_id: String,
) -> Result<serde_json::Value, String> {
    let control = state.monitoring.get_control_state(&gpu_id)?;
    Ok(serde_json::to_value(control).map_err(|e| e.to_string())?)
}
