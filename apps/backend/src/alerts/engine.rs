use std::collections::HashMap;
use std::sync::RwLock;

use tracing::warn;

use super::types::*;
use crate::hardware::GpuSample;

pub struct AlertEngine {
    rules: RwLock<Vec<AlertRule>>,
    history: RwLock<Vec<AlertEvent>>,
    max_history: usize,
}

impl AlertEngine {
    pub fn new(max_history: usize) -> Self {
        Self {
            rules: RwLock::new(Vec::new()),
            history: RwLock::new(Vec::new()),
            max_history,
        }
    }

    pub fn add_rule(&self, rule: AlertRule) {
        let mut rules = self.rules.write().unwrap();
        rules.push(rule);
    }

    pub fn remove_rule(&self, rule_id: &str) -> bool {
        let mut rules = self.rules.write().unwrap();
        let len = rules.len();
        rules.retain(|r| r.id != rule_id);
        rules.len() < len
    }

    pub fn update_rule(&self, rule: AlertRule) -> bool {
        let mut rules = self.rules.write().unwrap();
        if let Some(existing) = rules.iter_mut().find(|r| r.id == rule.id) {
            *existing = rule;
            true
        } else {
            false
        }
    }

    pub fn get_rules(&self) -> Vec<AlertRule> {
        self.rules.read().unwrap().clone()
    }

    pub fn get_rules_for_gpu(&self, gpu_id: &str) -> Vec<AlertRule> {
        self.rules
            .read()
            .unwrap()
            .iter()
            .filter(|r| r.gpu_id == gpu_id)
            .cloned()
            .collect()
    }

    pub fn evaluate_sample(&self, sample: &GpuSample) -> Vec<AlertEvent> {
        let rules = self.rules.read().unwrap();
        let mut events = Vec::new();

        let metrics: HashMap<AlertMetric, f64> = [
            (AlertMetric::Temperature, sample.temperature_celsius),
            (AlertMetric::FanSpeed, sample.fan_speed_percent),
            (AlertMetric::Power, sample.power_watts),
            (AlertMetric::CoreClock, sample.core_clock_mhz),
            (AlertMetric::MemoryClock, sample.memory_clock_mhz),
            (AlertMetric::CoreUtilization, sample.core_utilization_percent),
            (AlertMetric::MemoryUtilization, sample.memory_utilization_percent),
            (AlertMetric::Voltage, sample.core_voltage_mv),
        ]
        .into();

        for rule in rules.iter() {
            if rule.gpu_id != sample.gpu_id || !rule.enabled {
                continue;
            }
            if let Some(value) = metrics.get(&rule.metric) {
                if let Some(event) = rule.evaluate(*value) {
                    warn!("Alert triggered: {}", event.message);
                    self.add_to_history(event.clone());
                    events.push(event);
                }
            }
        }

        events
    }

    pub fn get_history(&self, limit: usize) -> Vec<AlertEvent> {
        let history = self.history.read().unwrap();
        let start = history.len().saturating_sub(limit);
        history[start..].to_vec()
    }

    pub fn acknowledge_alert(&self, alert_id: &str) -> bool {
        let mut history = self.history.write().unwrap();
        if let Some(event) = history.iter_mut().find(|a| a.id == alert_id) {
            event.acknowledged = true;
            true
        } else {
            false
        }
    }

    pub fn clear_history(&self) {
        let mut history = self.history.write().unwrap();
        history.clear();
    }

    pub fn push_event(&self, event: AlertEvent) {
        self.add_to_history(event);
    }

    fn add_to_history(&self, event: AlertEvent) {
        let mut history = self.history.write().unwrap();
        history.push(event);
        if history.len() > self.max_history {
            history.remove(0);
        }
    }

    pub fn create_default_rules(&self, gpu_id: &str) -> Vec<AlertRule> {
        let rules = vec![
            AlertRule {
                id: uuid::Uuid::new_v4().to_string(),
                gpu_id: gpu_id.to_string(),
                metric: AlertMetric::Temperature,
                condition: AlertCondition::Above,
                threshold: 85.0,
                enabled: true,
            },
            AlertRule {
                id: uuid::Uuid::new_v4().to_string(),
                gpu_id: gpu_id.to_string(),
                metric: AlertMetric::Temperature,
                condition: AlertCondition::Above,
                threshold: 95.0,
                enabled: true,
            },
            AlertRule {
                id: uuid::Uuid::new_v4().to_string(),
                gpu_id: gpu_id.to_string(),
                metric: AlertMetric::FanSpeed,
                condition: AlertCondition::Below,
                threshold: 0.0,
                enabled: true,
            },
            AlertRule {
                id: uuid::Uuid::new_v4().to_string(),
                gpu_id: gpu_id.to_string(),
                metric: AlertMetric::Power,
                condition: AlertCondition::Above,
                threshold: 450.0,
                enabled: true,
            },
        ];

        let mut my_rules = self.rules.write().unwrap();
        for rule in rules {
            my_rules.push(rule.clone());
        }
        self.get_rules_for_gpu(gpu_id)
    }
}
