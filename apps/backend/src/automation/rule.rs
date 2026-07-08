use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Rule {
    pub id: String,
    pub name: String,
    pub description: String,
    pub enabled: bool,
    pub trigger: Trigger,
    pub conditions: Vec<Condition>,
    pub condition_operator: ConditionOperator,
    pub actions: Vec<Action>,
    pub cooldown_secs: u64,
    pub gpu_id: Option<String>,
    pub created_at: u64,
    pub updated_at: u64,
    pub last_triggered_at: Option<u64>,
    pub execution_count: u64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum ConditionOperator {
    All,
    Any,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum Trigger {
    Continuous { interval_secs: u64 },
    Event(EventTrigger),
    Schedule(ScheduleTrigger),
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum EventTrigger {
    AnyAlert,
    AlertSeverity(String),
    TemperatureAbove(f64),
    TemperatureBelow(f64),
    FanSpeedAbove(f64),
    FanSpeedBelow(f64),
    PowerAbove(f64),
    GpuUtilAbove(f64),
    GpuUtilBelow(f64),
    GpuConnected,
    GpuDisconnected,
    Startup,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ScheduleTrigger {
    pub cron: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Condition {
    pub metric: String,
    pub comparison: Comparison,
    pub value: f64,
    pub value_to: Option<f64>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum Comparison {
    GreaterThan,
    GreaterThanOrEqual,
    LessThan,
    LessThanOrEqual,
    Equals,
    Between,
    NotBetween,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum Action {
    SetFanSpeed { speed_percent: f64 },
    SetCoreClockOffset { offset_mhz: i32 },
    SetMemoryClockOffset { offset_mhz: i32 },
    SetPowerLimit { limit_percent: f64 },
    ApplyProfile { profile_name: String },
    TriggerAlert { severity: String, message: String },
    SendWebhook { url: String, body_template: String },
    SendNotification { title: String, message: String },
    LogMessage { message: String },
    ExecuteScript { script_path: String },
}

impl Rule {
    pub fn new(name: String, trigger: Trigger) -> Self {
        Self {
            id: uuid::Uuid::new_v4().to_string(),
            name,
            description: String::new(),
            enabled: true,
            trigger,
            conditions: Vec::new(),
            condition_operator: ConditionOperator::All,
            actions: Vec::new(),
            cooldown_secs: 0,
            gpu_id: None,
            created_at: chrono::Utc::now().timestamp() as u64,
            updated_at: chrono::Utc::now().timestamp() as u64,
            last_triggered_at: None,
            execution_count: 0,
        }
    }

    pub fn can_fire(&self) -> bool {
        if let Some(last) = self.last_triggered_at {
            let elapsed = chrono::Utc::now().timestamp() as u64 - last;
            elapsed >= self.cooldown_secs
        } else {
            true
        }
    }
}
