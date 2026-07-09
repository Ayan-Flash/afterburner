use tauri::State;
use tracing::info;

use super::state::SharedState;
use crate::overlay::OverlayConfig;

#[tauri::command]
pub fn start_overlay(state: State<'_, SharedState>) -> Result<(), String> {
    info!("Starting overlay");
    let mut overlay = state.overlay.write().map_err(|e| e.to_string())?;
    let controller = overlay.as_mut().ok_or_else(|| "Overlay not initialized".to_string())?;
    controller.start()
}

#[tauri::command]
pub fn stop_overlay(state: State<'_, SharedState>) -> Result<(), String> {
    info!("Stopping overlay");
    let mut overlay = state.overlay.write().map_err(|e| e.to_string())?;
    let controller = overlay.as_mut().ok_or_else(|| "Overlay not initialized".to_string())?;
    controller.stop()
}

#[tauri::command]
pub fn is_overlay_running(state: State<'_, SharedState>) -> Result<bool, String> {
    let overlay = state.overlay.read().map_err(|e| e.to_string())?;
    Ok(overlay.as_ref().map(|c| c.is_running()).unwrap_or(false))
}

#[tauri::command]
pub fn get_overlay_config(state: State<'_, SharedState>) -> Result<OverlayConfig, String> {
    let overlay = state.overlay.read().map_err(|e| e.to_string())?;
    match overlay.as_ref() {
        Some(controller) => Ok(controller.config().clone()),
        None => Ok(OverlayConfig::default()),
    }
}

#[tauri::command]
pub fn update_overlay_config(
    state: State<'_, SharedState>,
    config: OverlayConfig,
) -> Result<(), String> {
    info!("Updating overlay config");
    let mut overlay = state.overlay.write().map_err(|e| e.to_string())?;
    match overlay.as_mut() {
        Some(controller) => {
            controller.update_config(config);
            Ok(())
        }
        None => Err("Overlay not initialized".to_string()),
    }
}

#[tauri::command]
pub fn get_detected_games(state: State<'_, SharedState>) -> Result<Vec<String>, String> {
    let overlay = state.overlay.read().map_err(|e| e.to_string())?;
    match overlay.as_ref() {
        Some(controller) => Ok(controller.detected_games()),
        None => Ok(vec![]),
    }
}

#[tauri::command]
pub fn is_game_running(state: State<'_, SharedState>) -> Result<bool, String> {
    let overlay = state.overlay.read().map_err(|e| e.to_string())?;
    match overlay.as_ref() {
        Some(controller) => Ok(controller.is_game_running()),
        None => Ok(false),
    }
}

#[tauri::command]
pub fn get_overlay_data(state: State<'_, SharedState>) -> Result<serde_json::Value, String> {
    let overlay = state.overlay.read().map_err(|e| e.to_string())?;
    match overlay.as_ref() {
        Some(controller) => {
            let data = controller.get_overlay_data();
            Ok(serde_json::json!({
                "running": controller.is_running(),
                "should_show": controller.should_show_overlay(),
                "data": data,
            }))
        }
        None => Ok(serde_json::json!({
            "running": false,
            "should_show": false,
            "data": [],
        })),
    }
}
