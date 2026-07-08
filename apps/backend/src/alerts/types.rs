use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub enum AlertSeverity {
    Info,
    Warning,
    Critical,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AlertRule {
    pub id: String,
    pub gpu_id: String,
    pub metric: AlertMetric,
    pub condition: AlertCondition,
    pub threshold: f64,
    pub enabled: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub enum AlertMetric {
    Temperature,
    FanSpeed,
    Power,
    CoreClock,
    MemoryClock,
    CoreUtilization,
    MemoryUtilization,
    Voltage,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub enum AlertCondition {
    Above,
    Below,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AlertEvent {
    pub id: String,
    pub rule_id: String,
    pub gpu_id: String,
    pub metric: AlertMetric,
    pub severity: AlertSeverity,
    pub message: String,
    pub value: f64,
    pub threshold: f64,
    pub timestamp: i64,
    pub acknowledged: bool,
}

impl AlertRule {
    pub fn evaluate(&self, value: f64) -> Option<AlertEvent> {
        if !self.enabled {
            return None;
        }

        let triggered = match self.condition {
            AlertCondition::Above => value > self.threshold,
            AlertCondition::Below => value < self.threshold,
        };

        if triggered {
            let severity = match self.condition {
                AlertCondition::Above => {
                    let ratio = value / self.threshold;
                    if ratio >= 1.5 {
                        AlertSeverity::Critical
                    } else if ratio >= 1.2 {
                        AlertSeverity::Warning
                    } else {
                        AlertSeverity::Info
                    }
                }
                AlertCondition::Below => {
                    let ratio = self.threshold / value.max(0.01);
                    if ratio >= 1.5 {
                        AlertSeverity::Critical
                    } else if ratio >= 1.2 {
                        AlertSeverity::Warning
                    } else {
                        AlertSeverity::Info
                    }
                }
            };

            Some(AlertEvent {
                id: uuid::Uuid::new_v4().to_string(),
                rule_id: self.id.clone(),
                gpu_id: self.gpu_id.clone(),
                metric: self.metric.clone(),
                severity,
                message: format!(
                    "{} {} {:.1} (threshold: {:.1})",
                    self.metric_label(),
                    match self.condition {
                        AlertCondition::Above => "above",
                        AlertCondition::Below => "below",
                    },
                    value,
                    self.threshold
                ),
                value,
                threshold: self.threshold,
                timestamp: chrono::Utc::now().timestamp_millis(),
                acknowledged: false,
            })
        } else {
            None
        }
    }

    fn metric_label(&self) -> &str {
        match self.metric {
            AlertMetric::Temperature => "Temperature",
            AlertMetric::FanSpeed => "Fan speed",
            AlertMetric::Power => "Power",
            AlertMetric::CoreClock => "Core clock",
            AlertMetric::MemoryClock => "Memory clock",
            AlertMetric::CoreUtilization => "Core utilization",
            AlertMetric::MemoryUtilization => "Memory utilization",
            AlertMetric::Voltage => "Voltage",
        }
    }
}
