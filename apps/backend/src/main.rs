#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use std::sync::Arc;

mod alerts;
mod commands;
mod hardware;
mod monitoring;
mod plugins;
mod stores;
mod utils;

fn main() {
    tracing_subscriber::fmt()
        .with_env_filter(
            tracing_subscriber::EnvFilter::try_from_default_env()
                .unwrap_or_else(|_| "info".into()),
        )
        .init();

    let app_state = Arc::new(commands::AppState::new());

    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .manage(app_state)
        .setup(|app| {
            let handle = app.handle().clone();
            std::thread::spawn(move || {
                std::thread::sleep(std::time::Duration::from_secs(1));
                tracing::info!("GPUControl Pro started (PID: {})", std::process::id());
            });
            tracing::info!("GPUControl Pro initialized");
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            commands::get_app_info,
            commands::list_gpus,
            commands::get_gpu_data,
            commands::get_gpu_history,
            commands::get_gpu_control_state,
            commands::set_fan_speed,
            commands::set_core_clock_offset,
            commands::set_memory_clock_offset,
            commands::set_power_limit,
            commands::set_voltage_offset,
            commands::start_monitoring,
            commands::stop_monitoring,
            commands::is_monitoring_running,
            commands::export_csv,
            commands::save_profile,
            commands::load_profiles,
            commands::delete_profile,
            commands::apply_profile,
            commands::get_alert_rules,
            commands::get_alert_rules_for_gpu,
            commands::add_alert_rule,
            commands::remove_alert_rule,
            commands::update_alert_rule,
            commands::get_alert_history,
            commands::acknowledge_alert,
            commands::clear_alert_history,
            commands::start_remote_server,
            commands::stop_remote_server,
            commands::get_remote_server_status,
            commands::generate_api_key,
            commands::start_overlay,
            commands::stop_overlay,
            commands::is_overlay_running,
            commands::get_overlay_config,
            commands::update_overlay_config,
            commands::get_detected_games,
            commands::is_game_running,
            commands::get_overlay_data,
        ])
        .run(tauri::generate_context!())
        .expect("error while running GPUControl Pro");
}

#[tauri::command]
fn get_app_info() -> serde_json::Value {
    serde_json::json!({
        "name": "GPUControl Pro",
        "version": "0.1.0",
        "platform": std::env::consts::OS,
    })
}
