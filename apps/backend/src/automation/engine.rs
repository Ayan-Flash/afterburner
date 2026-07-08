use std::sync::atomic::{AtomicBool, Ordering};
use std::sync::Arc;
use std::thread;
use std::time::Duration;

use tracing::{error, info};

use super::action::ActionExecutor;
use super::condition::ConditionEvaluator;
use super::rule::{Rule, Trigger};
use super::store::RuleStore;
use crate::alerts::AlertEngine;
use crate::monitoring::MonitoringEngine;

pub struct AutomationEngine {
    store: RuleStore,
    running: Arc<AtomicBool>,
    thread_handle: Arc<std::sync::Mutex<Option<thread::JoinHandle<()>>>>,
}

impl AutomationEngine {
    pub fn new() -> Self {
        Self {
            store: RuleStore::new(),
            running: Arc::new(AtomicBool::new(false)),
            thread_handle: Arc::new(std::sync::Mutex::new(None)),
        }
    }

    pub fn rules(&self) -> Vec<Rule> {
        self.store.load()
    }

    pub fn save_rules(&self, rules: &[Rule]) {
        self.store.save(rules);
    }

    pub fn start(&self, monitoring: Arc<MonitoringEngine>, alerts: Arc<AlertEngine>) {
        self.running.store(true, Ordering::Relaxed);
        let running = self.running.clone();
        let store = RuleStore::new();

        let handle = thread::spawn(move || {
            info!("Automation engine started");
            let mut tick = 0u64;
            while running.load(Ordering::Relaxed) {
                thread::sleep(Duration::from_secs(1));
                tick += 1;

                let rules = store.load();
                let now = chrono::Local::now().naive_local();

                for rule in &rules {
                    if !rule.enabled || !rule.can_fire() {
                        continue;
                    }

                    let should_fire = match &rule.trigger {
                        Trigger::Continuous { interval_secs } => {
                            if *interval_secs == 0 { continue; }
                            tick % interval_secs == 0
                        }
                        Trigger::Schedule(schedule) => {
                            super::scheduler::CronScheduler::matches(schedule, &now)
                        }
                        Trigger::Event(_) => false,
                    };

                    if !should_fire {
                        continue;
                    }

                    let conditions_met = ConditionEvaluator::evaluate_all(
                        &rule.conditions,
                        &rule.condition_operator,
                        &monitoring,
                    );

                    if !conditions_met {
                        continue;
                    }

                    info!("Automation rule '{}' triggered", rule.name);
                    for action in &rule.actions {
                        ActionExecutor::execute(action, &rule.gpu_id, &monitoring, &alerts);
                    }

                    let mut updated_rules = store.load();
                    if let Some(r) = updated_rules.iter_mut().find(|r| r.id == rule.id) {
                        r.last_triggered_at = Some(chrono::Utc::now().timestamp() as u64);
                        r.execution_count += 1;
                    }
                    store.save(&updated_rules);
                }
            }
            info!("Automation engine stopped");
        });

        *self.thread_handle.lock().unwrap() = Some(handle);
    }

    pub fn stop(&self) {
        self.running.store(false, Ordering::Relaxed);
    }
}
