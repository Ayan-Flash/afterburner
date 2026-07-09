use std::sync::Arc;

use tauri::State;

use super::state::{AppState, SharedState};
use crate::integrations::{DiscordWebhook, IntegrationConfig, IntegrationStore};

#[tauri::command]
pub async fn get_integration_config() -> Result<IntegrationConfig, String> {
    let store = IntegrationStore::new();
    Ok(store.load())
}

#[tauri::command]
pub async fn save_integration_config(config: IntegrationConfig) -> Result<(), String> {
    let store = IntegrationStore::new();
    store.save(&config);
    Ok(())
}

#[tauri::command]
pub async fn test_discord_webhook(webhook_url: String) -> Result<String, String> {
    DiscordWebhook::test_connection(&webhook_url).await
}

#[tauri::command]
pub async fn send_discord_alert(
    webhook_url: String,
    gpu_name: String,
    metric: String,
    value: f64,
    threshold: f64,
    severity: String,
) -> Result<(), String> {
    DiscordWebhook::send_alert(
        &webhook_url,
        "GPUControl Pro",
        "",
        &gpu_name,
        &metric,
        value,
        threshold,
        &severity,
    )
    .await
}

#[tauri::command]
pub async fn send_discord_report(
    webhook_url: String,
    state: State<'_, Arc<AppState>>,
) -> Result<(), String> {
    let gpus = state.monitoring.gpus();
    let gpu_id = gpus.first().map(|g| g.id.as_str()).unwrap_or("0");
    let samples = state.monitoring.get_history(gpu_id, 1);
    let sample = samples.first().ok_or("No GPU data available")?;

    let metrics = vec![
        ("Temperature".into(), sample.temperature_celsius, "°C".into()),
        ("GPU Utilization".into(), sample.core_utilization_percent, "%".into()),
        ("Memory Used".into(), sample.memory_used_mb as f64, "MB".into()),
        ("Fan Speed".into(), sample.fan_speed_percent, "%".into()),
        ("Power Draw".into(), sample.power_watts, "W".into()),
        ("Core Clock".into(), sample.core_clock_mhz, "MHz".into()),
        ("Memory Clock".into(), sample.memory_clock_mhz, "MHz".into()),
    ];

    DiscordWebhook::send_report(&webhook_url, "GPUControl Pro", "", "GPU 0", &metrics).await
}

#[tauri::command]
pub async fn start_obs_source(
    port: u16,
    state: State<'_, Arc<AppState>>,
) -> Result<(), String> {
    let engine = state.monitoring.clone();
    state.obs_source.start(Box::new(move || {
        let gpus = engine.gpus();
        let gpu_id = gpus.first().map(|g| g.id.as_str()).unwrap_or("0");
        let samples = engine.get_history(gpu_id, 1);
        if let Some(s) = samples.first() {
            crate::integrations::obs::ObsPayload {
                gpu_name: "GPU 0".into(),
                metrics: vec![
                    crate::integrations::obs::ObsMetric {
                        label: "Temperature".into(),
                        value: format!("{:.1}", s.temperature_celsius),
                        unit: "°C".into(),
                    },
                    crate::integrations::obs::ObsMetric {
                        label: "GPU".into(),
                        value: format!("{:.1}", s.core_utilization_percent),
                        unit: "%".into(),
                    },
                    crate::integrations::obs::ObsMetric {
                        label: "VRAM".into(),
                        value: format!("{:.1}", s.memory_used_mb),
                        unit: "MB".into(),
                    },
                    crate::integrations::obs::ObsMetric {
                        label: "Fan".into(),
                        value: format!("{:.1}", s.fan_speed_percent),
                        unit: "%".into(),
                    },
                    crate::integrations::obs::ObsMetric {
                        label: "Power".into(),
                        value: format!("{:.1}", s.power_watts),
                        unit: "W".into(),
                    },
                    crate::integrations::obs::ObsMetric {
                        label: "Core Clock".into(),
                        value: format!("{:.0}", s.core_clock_mhz),
                        unit: "MHz".into(),
                    },
                    crate::integrations::obs::ObsMetric {
                        label: "Mem Clock".into(),
                        value: format!("{:.0}", s.memory_clock_mhz),
                        unit: "MHz".into(),
                    },
                ],
                timestamp: std::time::SystemTime::now()
                    .duration_since(std::time::UNIX_EPOCH)
                    .unwrap_or_default()
                    .as_secs(),
            }
        } else {
            crate::integrations::obs::ObsPayload {
                gpu_name: "No GPU".into(),
                metrics: vec![],
                timestamp: 0,
            }
        }
    }))
}

#[tauri::command]
pub async fn stop_obs_source(state: State<'_, Arc<AppState>>) -> Result<(), String> {
    state.obs_source.stop();
    Ok(())
}

#[tauri::command]
pub async fn is_obs_running(state: State<'_, Arc<AppState>>) -> Result<bool, String> {
    Ok(state.obs_source.is_running())
}
