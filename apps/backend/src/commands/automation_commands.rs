use tauri::State;

use super::state::SharedState;
use crate::automation::rule::{Action, Condition, ConditionOperator, Rule, ScheduleTrigger, Trigger, EventTrigger, Comparison};
use crate::automation::engine::AutomationEngine;

fn engine() -> AutomationEngine {
    AutomationEngine::new()
}

#[tauri::command]
pub fn get_automation_rules() -> Vec<Rule> {
    engine().rules()
}

#[tauri::command]
pub fn create_automation_rule(
    name: String,
    description: String,
    trigger_type: String,
    trigger_value: String,
    gpu_id: Option<String>,
) -> Result<Rule, String> {
    let trigger = match trigger_type.as_str() {
        "continuous" => Trigger::Continuous {
            interval_secs: trigger_value.parse().unwrap_or(10),
        },
        "schedule" => Trigger::Schedule(ScheduleTrigger {
            cron: trigger_value,
        }),
        _ => return Err("Invalid trigger type".into()),
    };

    let mut rule = Rule::new(name, trigger);
    rule.description = description;
    rule.gpu_id = gpu_id;

    let mut rules = engine().rules();
    rules.push(rule.clone());
    AutomationEngine::new().save_rules(&rules);

    Ok(rule)
}

#[tauri::command]
pub fn update_automation_rule(rule: Rule) -> Result<(), String> {
    let mut rules = engine().rules();
    if let Some(existing) = rules.iter_mut().find(|r| r.id == rule.id) {
        *existing = rule;
        AutomationEngine::new().save_rules(&rules);
        Ok(())
    } else {
        Err("Rule not found".into())
    }
}

#[tauri::command]
pub fn delete_automation_rule(rule_id: String) -> Result<(), String> {
    let mut rules = engine().rules();
    rules.retain(|r| r.id != rule_id);
    AutomationEngine::new().save_rules(&rules);
    Ok(())
}

#[tauri::command]
pub fn toggle_automation_rule(rule_id: String, enabled: bool) -> Result<(), String> {
    let mut rules = engine().rules();
    if let Some(rule) = rules.iter_mut().find(|r| r.id == rule_id) {
        rule.enabled = enabled;
        AutomationEngine::new().save_rules(&rules);
        Ok(())
    } else {
        Err("Rule not found".into())
    }
}

#[tauri::command]
pub fn add_automation_condition(
    rule_id: String,
    metric: String,
    comparison: String,
    value: f64,
    value_to: Option<f64>,
) -> Result<(), String> {
    let comp = match comparison.as_str() {
        "gt" => Comparison::GreaterThan,
        "gte" => Comparison::GreaterThanOrEqual,
        "lt" => Comparison::LessThan,
        "lte" => Comparison::LessThanOrEqual,
        "eq" => Comparison::Equals,
        "between" => Comparison::Between,
        "not_between" => Comparison::NotBetween,
        _ => return Err("Invalid comparison".into()),
    };
    let condition = Condition { metric, comparison: comp, value, value_to };

    let mut rules = engine().rules();
    if let Some(rule) = rules.iter_mut().find(|r| r.id == rule_id) {
        rule.conditions.push(condition);
        AutomationEngine::new().save_rules(&rules);
        Ok(())
    } else {
        Err("Rule not found".into())
    }
}

#[tauri::command]
pub fn add_automation_action(
    rule_id: String,
    action_type: String,
    action_value: String,
    action_value2: Option<String>,
) -> Result<(), String> {
    let action = match action_type.as_str() {
        "set_fan_speed" => Action::SetFanSpeed {
            speed_percent: action_value.parse().map_err(|_| "Invalid fan speed")?,
        },
        "set_core_clock" => Action::SetCoreClockOffset {
            offset_mhz: action_value.parse().map_err(|_| "Invalid clock offset")?,
        },
        "set_mem_clock" => Action::SetMemoryClockOffset {
            offset_mhz: action_value.parse().map_err(|_| "Invalid mem offset")?,
        },
        "set_power_limit" => Action::SetPowerLimit {
            limit_percent: action_value.parse().map_err(|_| "Invalid power limit")?,
        },
        "trigger_alert" => Action::TriggerAlert {
            severity: action_value,
            message: action_value2.unwrap_or_default(),
        },
        "log" => Action::LogMessage { message: action_value },
        "webhook" => Action::SendWebhook {
            url: action_value,
            body_template: action_value2.unwrap_or_default(),
        },
        "notification" => Action::SendNotification {
            title: action_value,
            message: action_value2.unwrap_or_default(),
        },
        _ => return Err("Invalid action type".into()),
    };

    let mut rules = engine().rules();
    if let Some(rule) = rules.iter_mut().find(|r| r.id == rule_id) {
        rule.actions.push(action);
        AutomationEngine::new().save_rules(&rules);
        Ok(())
    } else {
        Err("Rule not found".into())
    }
}

#[tauri::command]
pub fn start_automation_engine(state: State<'_, SharedState>) {
    let engine = AutomationEngine::new();
    engine.start(state.monitoring.clone(), state.alerts.clone());
}

#[tauri::command]
pub fn stop_automation_engine() {
    AutomationEngine::new().stop();
}
