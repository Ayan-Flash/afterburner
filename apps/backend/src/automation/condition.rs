use crate::monitoring::MonitoringEngine;
use super::rule::{Comparison, Condition};

pub struct ConditionEvaluator;

impl ConditionEvaluator {
    pub fn evaluate(condition: &Condition, engine: &MonitoringEngine) -> bool {
        let gpus = engine.gpus();
        for gpu in &gpus {
            if let Some(sample) = engine.get_latest(&gpu.id) {
                let value = Self::extract_metric(&condition.metric, &sample);
                if let Some(v) = value {
                    if Self::compare(v, &condition.comparison, condition.value, condition.value_to) {
                        return true;
                    }
                }
            }
        }
        false
    }

    pub fn evaluate_all(conditions: &[Condition], operator: &super::rule::ConditionOperator, engine: &MonitoringEngine) -> bool {
        if conditions.is_empty() {
            return true;
        }
        match operator {
            super::rule::ConditionOperator::All => conditions.iter().all(|c| Self::evaluate(c, engine)),
            super::rule::ConditionOperator::Any => conditions.iter().any(|c| Self::evaluate(c, engine)),
        }
    }

    fn extract_metric(metric: &str, sample: &crate::hardware::GpuSample) -> Option<f64> {
        match metric {
            "temperature" | "temp" => Some(sample.temperature_celsius),
            "core_clock" | "core_mhz" => Some(sample.core_clock_mhz),
            "memory_clock" | "mem_mhz" => Some(sample.memory_clock_mhz),
            "fan_speed" | "fan" | "fan_percent" => Some(sample.fan_speed_percent),
            "power" | "power_watts" => Some(sample.power_watts),
            "core_util" | "gpu_util" | "utilization" => Some(sample.core_utilization_percent),
            "mem_util" | "memory_util" => Some(sample.memory_utilization_percent),
            "core_voltage" | "voltage" => Some(sample.core_voltage_mv),
            "mem_used" | "memory_used_mb" => Some(sample.memory_used_mb as f64),
            "mem_total" | "memory_total_mb" => Some(sample.memory_total_mb as f64),
            _ => None,
        }
    }

    fn compare(value: f64, comparison: &Comparison, threshold: f64, threshold_to: Option<f64>) -> bool {
        match comparison {
            Comparison::GreaterThan => value > threshold,
            Comparison::GreaterThanOrEqual => value >= threshold,
            Comparison::LessThan => value < threshold,
            Comparison::LessThanOrEqual => value <= threshold,
            Comparison::Equals => (value - threshold).abs() < 0.001,
            Comparison::Between => {
                if let Some(to) = threshold_to {
                    value >= threshold && value <= to
                } else {
                    value >= threshold
                }
            }
            Comparison::NotBetween => {
                if let Some(to) = threshold_to {
                    value < threshold || value > to
                } else {
                    value < threshold
                }
            }
        }
    }
}
