use std::sync::RwLock;

use tauri::State;
use tracing::info;

use super::state::SharedState;
use crate::remote::{AuthManager, RemoteApi, RemoteServer};

#[tauri::command]
pub fn start_remote_server(
    state: State<'_, SharedState>,
    port: u16,
    api_key: Option<String>,
) -> Result<String, String> {
    info!(port, "Starting remote monitoring server");

    let mut remote = state.remote.write().map_err(|e| e.to_string())?;
    if remote.is_some() {
        return Err("Remote server is already running".to_string());
    }

    let auth = AuthManager::new();
    if let Some(key) = api_key {
        auth.set_key(key);
    }

    let api = RemoteApi::new(
        state.monitoring.clone(),
        state.alerts.clone(),
    );

    let dashboard_html = include_str!("../remote/dashboard.html");
    let server = RemoteServer::start(port, api, auth, dashboard_html)?;
    let url = server.url();

    *remote = Some(server);
    info!("Remote server started at {}", url);
    Ok(url)
}

#[tauri::command]
pub fn stop_remote_server(state: State<'_, SharedState>) -> Result<(), String> {
    info!("Stopping remote monitoring server");
    let mut remote = state.remote.write().map_err(|e| e.to_string())?;
    match remote.take() {
        Some(_) => {
            info!("Remote server stopped");
            Ok(())
        }
        None => Err("No remote server is running".to_string()),
    }
}

#[tauri::command]
pub fn get_remote_server_status(state: State<'_, SharedState>) -> Result<serde_json::Value, String> {
    let remote = state.remote.read().map_err(|e| e.to_string())?;
    if let Some(server) = remote.as_ref() {
        Ok(serde_json::json!({
            "running": true,
            "port": server.port(),
            "url": server.url(),
        }))
    } else {
        Ok(serde_json::json!({
            "running": false,
        }))
    }
}

#[tauri::command]
pub fn generate_api_key() -> Result<String, String> {
    let auth = AuthManager::new();
    Ok(auth.generate_key())
}
