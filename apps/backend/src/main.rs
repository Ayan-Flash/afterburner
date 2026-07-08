#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use std::sync::Arc;

mod ai;
mod alerts;
mod automation;
mod backup;
mod commands;
mod enterprise;
mod hardware;
mod integrations;
mod marketplace;
mod monitoring;
mod reporting;
mod sync;
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
            commands::get_automation_rules,
            commands::create_automation_rule,
            commands::update_automation_rule,
            commands::delete_automation_rule,
            commands::toggle_automation_rule,
            commands::add_automation_condition,
            commands::add_automation_action,
            commands::start_automation_engine,
            commands::stop_automation_engine,
            commands::get_integration_config,
            commands::save_integration_config,
            commands::test_discord_webhook,
            commands::send_discord_alert,
            commands::send_discord_report,
            commands::start_obs_source,
            commands::stop_obs_source,
            commands::is_obs_running,
            commands::generate_report,
            commands::list_reports,
            commands::get_report,
            commands::delete_report,
            commands::export_report_csv,
            commands::get_enterprise_config,
            commands::save_enterprise_config,
            commands::list_group_policies,
            commands::create_group_policy,
            commands::update_group_policy,
            commands::delete_group_policy,
            commands::toggle_group_policy,
            commands::get_sync_status,
            commands::register_device,
            commands::unregister_device,
            commands::sync_now,
            commands::start_sync_client,
            commands::stop_sync_client,
            commands::update_sync_settings,
            commands::start_sync_server,
            commands::stop_sync_server,
            commands::is_sync_server_running,
            commands::get_ai_anomalies,
            commands::get_ai_suggestions,
            commands::clear_ai_anomalies,
            commands::dismiss_ai_suggestion,
            commands::run_ai_analysis,
            commands::predict_gpu_temperature,
            commands::predict_gpu_utilization,
            commands::tune_fan_curve,
            commands::tune_clock_offsets,
            commands::tune_power_limit,
            commands::get_tuning_profiles,
            commands::save_tuning_profile,
            commands::apply_tuning_profile,
            commands::get_smart_alert_status,
            commands::get_smart_baselines,
            commands::get_smart_context,
            commands::get_smart_suppressed,
            commands::update_smart_config,
            commands::reset_smart_baselines,
            commands::create_backup,
            commands::restore_backup,
            commands::list_backups,
            commands::delete_backup,
            commands::export_backup,
            commands::import_backup,
            commands::list_marketplace_profiles,
            commands::get_marketplace_profile,
            commands::publish_marketplace_profile,
            commands::delete_marketplace_profile,
            commands::rate_marketplace_profile,
            commands::download_marketplace_profile,
            commands::import_marketplace_profile,
            commands::export_marketplace_profile,
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
