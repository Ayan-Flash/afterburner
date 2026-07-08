use tauri::State;
use tracing::info;

use super::state::SharedState;
use crate::hardware::GpuIdentity;
use crate::utils::error::AppResult;

#[tauri::command]
pub fn list_gpus(state: State<'_, SharedState>) -> AppResult<Vec<GpuIdentity>> {
    info!("Listing GPUs");
    Ok(state.monitoring.gpus())
}

#[tauri::command]
pub fn get_gpu_data(state: State<'_, SharedState>, gpu_id: String) -> AppResult<serde_json::Value> {
    let sample = state
        .monitoring
        .collect_once(&gpu_id)
        .ok_or_else(|| crate::utils::error::AppError::GpuNotFound(gpu_id.clone()))?;

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
) -> AppResult<serde_json::Value> {
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
) -> AppResult<serde_json::Value> {
    let control = state.monitoring.get_control_state(&gpu_id)?;
    Ok(serde_json::to_value(control)?)
}
