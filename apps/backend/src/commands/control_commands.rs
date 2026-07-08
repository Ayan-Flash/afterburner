use tauri::State;
use tracing::info;

use super::state::SharedState;

#[tauri::command]
pub fn set_fan_speed(
    state: State<'_, SharedState>,
    gpu_id: String,
    percent: f64,
) -> Result<(), String> {
    info!(gpu_id, percent, "Setting fan speed");
    state.monitoring.set_fan_speed(&gpu_id, percent)
}

#[tauri::command]
pub fn set_core_clock_offset(
    state: State<'_, SharedState>,
    gpu_id: String,
    offset_mhz: i32,
) -> Result<(), String> {
    info!(gpu_id, offset_mhz, "Setting core clock offset");
    state.monitoring.set_core_clock_offset(&gpu_id, offset_mhz)
}

#[tauri::command]
pub fn set_memory_clock_offset(
    state: State<'_, SharedState>,
    gpu_id: String,
    offset_mhz: i32,
) -> Result<(), String> {
    info!(gpu_id, offset_mhz, "Setting memory clock offset");
    state.monitoring.set_memory_clock_offset(&gpu_id, offset_mhz)
}

#[tauri::command]
pub fn set_power_limit(
    state: State<'_, SharedState>,
    gpu_id: String,
    percent: f64,
) -> Result<(), String> {
    info!(gpu_id, percent, "Setting power limit");
    state.monitoring.set_power_limit(&gpu_id, percent)
}

#[tauri::command]
pub fn set_voltage_offset(
    state: State<'_, SharedState>,
    gpu_id: String,
    offset_mv: i32,
) -> Result<(), String> {
    info!(gpu_id, offset_mv, "Setting voltage offset");
    state.monitoring.set_voltage_offset(&gpu_id, offset_mv)
}
