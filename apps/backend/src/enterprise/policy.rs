use serde::{Deserialize, Serialize};
use uuid::Uuid;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum PolicyTarget {
    AllGpus,
    ByVendor(String),
    ByGpuIds(Vec<String>),
    ByGroup(String),
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum PolicyCondition {
    TemperatureAbove { threshold: f64 },
    TemperatureBelow { threshold: f64 },
    UsageAbove { percent: f64 },
    PowerAbove { watts: f64 },
    Always,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum PolicyAction {
    SetFanSpeed { speed_percent: f64 },
    SetPowerLimit { limit_percent: f64 },
    ApplyProfile { profile_name: String },
    EnableMonitoring,
    DisableMonitoring,
    LogEvent { message: String },
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct GroupPolicy {
    pub id: String,
    pub name: String,
    pub description: String,
    pub enabled: bool,
    pub priority: i32,
    pub target: PolicyTarget,
    pub conditions: Vec<PolicyCondition>,
    pub actions: Vec<PolicyAction>,
    pub created_at: i64,
    pub updated_at: i64,
}

impl GroupPolicy {
    pub fn new(name: String, description: String, target: PolicyTarget) -> Self {
        let now = chrono::Utc::now().timestamp();
        Self {
            id: Uuid::new_v4().to_string(),
            name,
            description,
            enabled: true,
            priority: 0,
            target,
            conditions: vec![],
            actions: vec![],
            created_at: now,
            updated_at: now,
        }
    }
}
