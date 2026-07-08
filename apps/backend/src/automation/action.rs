use std::sync::Arc;
use tracing::{error, info};

use super::rule::Action;
use crate::alerts::{AlertEngine, AlertEvent, AlertMetric, AlertSeverity, AlertCondition};
use crate::monitoring::MonitoringEngine;

pub struct ActionExecutor;

impl ActionExecutor {
    pub fn execute(
        action: &Action,
        gpu_id: &Option<String>,
        monitoring: &MonitoringEngine,
        alerts: &AlertEngine,
    ) {
        let target = gpu_id.as_deref().unwrap_or("");
        match action {
            Action::SetFanSpeed { speed_percent } => {
                if !target.is_empty() {
                    if let Err(e) = monitoring.set_fan_speed(target, *speed_percent) {
                        error!("Automation: failed to set fan speed: {e}");
                    } else {
                        info!("Automation: set fan speed to {speed_percent}% on {target}");
                    }
                }
            }
            Action::SetCoreClockOffset { offset_mhz } => {
                if !target.is_empty() {
                    if let Err(e) = monitoring.set_core_clock_offset(target, *offset_mhz) {
                        error!("Automation: failed to set core clock offset: {e}");
                    } else {
                        info!("Automation: set core clock offset to {offset_mhz}MHz on {target}");
                    }
                }
            }
            Action::SetMemoryClockOffset { offset_mhz } => {
                if !target.is_empty() {
                    if let Err(e) = monitoring.set_memory_clock_offset(target, *offset_mhz) {
                        error!("Automation: failed to set memory clock offset: {e}");
                    } else {
                        info!("Automation: set memory clock offset to {offset_mhz}MHz on {target}");
                    }
                }
            }
            Action::SetPowerLimit { limit_percent } => {
                if !target.is_empty() {
                    if let Err(e) = monitoring.set_power_limit(target, *limit_percent) {
                        error!("Automation: failed to set power limit: {e}");
                    } else {
                        info!("Automation: set power limit to {limit_percent}% on {target}");
                    }
                }
            }
            Action::ApplyProfile { profile_name } => {
                info!("Automation: would apply profile {profile_name} (not implemented)");
            }
            Action::TriggerAlert { severity, message } => {
                let sev = match severity.to_lowercase().as_str() {
                    "critical" => AlertSeverity::Critical,
                    "warning" => AlertSeverity::Warning,
                    _ => AlertSeverity::Info,
                };
                alerts.push_event(AlertEvent {
                    id: uuid::Uuid::new_v4().to_string(),
                    rule_id: String::new(),
                    gpu_id: target.to_string(),
                    metric: AlertMetric::Temperature,
                    severity: sev,
                    message: message.clone(),
                    value: 0.0,
                    threshold: 0.0,
                    timestamp: chrono::Utc::now().timestamp_millis(),
                    acknowledged: false,
                });
                info!("Automation: triggered alert '{message}'");
            }
            Action::SendWebhook { url, body_template } => {
                info!("Automation: webhook would POST to {url} with body: {body_template}");
            }
            Action::SendNotification { title, message } => {
                info!("Automation: notification '{title}': {message}");
            }
            Action::LogMessage { message } => {
                info!("Automation log: {message}");
            }
            Action::ExecuteScript { script_path } => {
                info!("Automation: would execute script {script_path} (not implemented)");
            }
        }
    }
}
