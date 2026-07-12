use tauri::State;

use super::state::SharedState;
use crate::hardware::cpu::{CpuInfo, CpuSample};
use crate::utils::error::AppResult;

/// Static CPU identity: model, vendor, physical & logical core counts.
#[tauri::command]
pub fn get_cpu_info(state: State<'_, SharedState>) -> AppResult<CpuInfo> {
    Ok(state.cpu.info())
}

/// Live CPU telemetry: package/per-core frequency, usage, temperature, voltage.
#[tauri::command]
pub fn get_cpu_sample(state: State<'_, SharedState>) -> AppResult<CpuSample> {
    Ok(state.cpu.sample())
}
