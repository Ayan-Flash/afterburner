use tauri::State;
use tracing::info;

use super::state::SharedState;
use crate::alerts::{AlertEvent, AlertRule};

#[tauri::command]
pub fn get_alert_rules(state: State<'_, SharedState>) -> Result<Vec<AlertRule>, String> {
    Ok(state.alerts.get_rules())
}

#[tauri::command]
pub fn get_alert_rules_for_gpu(
    state: State<'_, SharedState>,
    gpu_id: String,
) -> Result<Vec<AlertRule>, String> {
    Ok(state.alerts.get_rules_for_gpu(&gpu_id))
}

#[tauri::command]
pub fn add_alert_rule(
    state: State<'_, SharedState>,
    rule: AlertRule,
) -> Result<(), String> {
    info!("Adding alert rule for GPU: {}", rule.gpu_id);
    state.alerts.add_rule(rule);
    Ok(())
}

#[tauri::command]
pub fn remove_alert_rule(state: State<'_, SharedState>, rule_id: String) -> Result<bool, String> {
    info!(rule_id, "Removing alert rule");
    Ok(state.alerts.remove_rule(&rule_id))
}

#[tauri::command]
pub fn update_alert_rule(
    state: State<'_, SharedState>,
    rule: AlertRule,
) -> Result<bool, String> {
    info!("Updating alert rule: {}", rule.id);
    Ok(state.alerts.update_rule(rule))
}

#[tauri::command]
pub fn get_alert_history(
    state: State<'_, SharedState>,
    limit: usize,
) -> Result<Vec<AlertEvent>, String> {
    Ok(state.alerts.get_history(limit))
}

#[tauri::command]
pub fn acknowledge_alert(
    state: State<'_, SharedState>,
    alert_id: String,
) -> Result<bool, String> {
    info!(alert_id, "Acknowledging alert");
    Ok(state.alerts.acknowledge_alert(&alert_id))
}

#[tauri::command]
pub fn clear_alert_history(state: State<'_, SharedState>) -> Result<(), String> {
    info!("Clearing alert history");
    state.alerts.clear_history();
    Ok(())
}
