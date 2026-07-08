use std::sync::Arc;

use tauri::State;

use super::state::AppState;
use crate::sync::{SyncClient, SyncResult, SyncStatus};

fn client() -> SyncClient {
    SyncClient::new()
}

#[tauri::command]
pub fn get_sync_status() -> SyncStatus {
    let client = client();
    let state = client.get_state();
    SyncStatus {
        last_sync_at: state.last_sync_at,
        next_sync_at: None,
        is_syncing: false,
        error: None,
        server_url: state.server_url,
        device_registered: state.registered,
    }
}

#[tauri::command]
pub fn register_device(server_url: String, api_key: String) -> Result<String, String> {
    let client = client();
    client.register_device(&server_url, &api_key)?;
    Ok("Device registered successfully".into())
}

#[tauri::command]
pub fn unregister_device() -> Result<(), String> {
    let client = client();
    client.unregister();
    Ok(())
}

#[tauri::command]
pub fn sync_now() -> Result<SyncResult, String> {
    let client = client();
    client.sync_now()
}

#[tauri::command]
pub fn start_sync_client() -> Result<(), String> {
    let client = client();
    client.start();
    client.update_state(|s| s.enabled = true);
    Ok(())
}

#[tauri::command]
pub fn stop_sync_client() -> Result<(), String> {
    let client = client();
    client.stop();
    client.update_state(|s| s.enabled = false);
    Ok(())
}

#[tauri::command]
pub fn update_sync_settings(
    server_url: String,
    api_key: String,
    sync_interval_secs: u64,
    sync_profiles: bool,
    sync_reports: bool,
    sync_policies: bool,
) -> Result<(), String> {
    let client = client();
    client.update_state(|s| {
        s.server_url = server_url;
        s.api_key = api_key;
        s.sync_interval_secs = sync_interval_secs;
        s.sync_profiles = sync_profiles;
        s.sync_reports = sync_reports;
        s.sync_policies = sync_policies;
    });
    Ok(())
}

#[tauri::command]
pub fn start_sync_server(state: State<'_, Arc<AppState>>) -> Result<(), String> {
    state.sync_server.start()
}

#[tauri::command]
pub fn stop_sync_server(state: State<'_, Arc<AppState>>) -> Result<(), String> {
    state.sync_server.stop();
    Ok(())
}

#[tauri::command]
pub fn is_sync_server_running(state: State<'_, Arc<AppState>>) -> Result<bool, String> {
    Ok(state.sync_server.is_running())
}
