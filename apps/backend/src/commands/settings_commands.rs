use tauri::State;
use tracing::info;

use super::state::SharedState;
use crate::utils::error::{AppResult};

#[tauri::command]
pub fn get_setting(state: State<'_, SharedState>, key: String) -> AppResult<Option<String>> {
    info!(key, "Getting setting");
    state.db.get_setting(&key)
}

#[tauri::command]
pub fn set_setting(state: State<'_, SharedState>, key: String, value: String) -> AppResult<()> {
    info!(key, "Setting setting");
    state.db.set_setting(&key, &value)
}

#[tauri::command]
pub fn get_all_settings(state: State<'_, SharedState>) -> AppResult<serde_json::Value> {
    let settings = state.db.get_all_settings()?;
    let map: serde_json::Map<String, serde_json::Value> = settings
        .into_iter()
        .map(|(k, v)| (k, serde_json::Value::String(v)))
        .collect();
    Ok(serde_json::Value::Object(map))
}
