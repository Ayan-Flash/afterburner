use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub enum SuggestionCategory {
    FanCurve,
    PowerLimit,
    ClockOffset,
    Underclock,
    ProfileSwitch,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct OptimizationSuggestion {
    pub id: String,
    pub gpu_id: String,
    pub category: SuggestionCategory,
    pub title: String,
    pub description: String,
    pub potential_benefit: String,
    pub confidence: f64,
    pub applied: bool,
    pub timestamp: i64,
}

pub struct Optimizer;

impl Optimizer {
    pub fn suggest_fan_curve(
        gpu_id: &str,
        temps: &[f64],
        fans: &[f64],
        avg_temp: f64,
        max_temp: f64,
    ) -> Vec<OptimizationSuggestion> {
        let mut suggestions = vec![];

        if max_temp > 80.0 && fans.iter().any(|&f| f < 60.0) {
            let avg_fan_at_high_temp: f64 = temps.iter()
                .zip(fans.iter())
                .filter(|(t, _)| **t > 75.0)
                .map(|(_, f)| *f)
                .sum::<f64>()
                / temps.iter().zip(fans.iter()).filter(|(t, _)| *t > 75.0).count().max(1) as f64;

            if avg_fan_at_high_temp < 70.0 {
                suggestions.push(OptimizationSuggestion {
                    id: uuid::Uuid::new_v4().to_string(),
                    gpu_id: gpu_id.into(),
                    category: SuggestionCategory::FanCurve,
                    title: "Aggressive Fan Curve".into(),
                    description: format!(
                        "GPU reaches {:.0}°C but fans average only {:.0}%. Increase fan curve for better cooling.",
                        max_temp, avg_fan_at_high_temp
                    ),
                    potential_benefit: format!("Reduce peak temperature by 5-10°C"),
                    confidence: 0.75,
                    applied: false,
                    timestamp: chrono::Utc::now().timestamp(),
                });
            }
        }

        suggestions
    }

    pub fn suggest_power_limit(
        gpu_id: &str,
        powers: &[f64],
        temps: &[f64],
        max_power: f64,
    ) -> Vec<OptimizationSuggestion> {
        let mut suggestions = vec![];

        if max_power > 150.0 {
            let avg_temp = temps.iter().sum::<f64>() / temps.len().max(1) as f64;
            let avg_power = powers.iter().sum::<f64>() / powers.len().max(1) as f64;

            if avg_temp > 75.0 && avg_power > max_power * 0.7 {
                suggestions.push(OptimizationSuggestion {
                    id: uuid::Uuid::new_v4().to_string(),
                    gpu_id: gpu_id.into(),
                    category: SuggestionCategory::PowerLimit,
                    title: "Reduce Power Limit".into(),
                    description: format!(
                        "Average power draw ({:.0}W) is high with temps at {:.0}°C. Reducing power limit can lower temps with minimal performance loss.",
                        avg_power, avg_temp
                    ),
                    potential_benefit: "Reduce temperatures by 3-5°C, ~5% performance loss".into(),
                    confidence: 0.6,
                    applied: false,
                    timestamp: chrono::Utc::now().timestamp(),
                });
            }
        }

        suggestions
    }

    pub fn suggest_underclock(
        gpu_id: &str,
        temps: &[f64],
        clocks: &[f64],
        max_temp: f64,
    ) -> Vec<OptimizationSuggestion> {
        let mut suggestions = vec![];

        if max_temp > 80.0 {
            let avg_clock = clocks.iter().sum::<f64>() / clocks.len().max(1) as f64;

            suggestions.push(OptimizationSuggestion {
                id: uuid::Uuid::new_v4().to_string(),
                gpu_id: gpu_id.into(),
                category: SuggestionCategory::Underclock,
                title: "Underclock for Lower Temps".into(),
                description: format!(
                    "GPU reaches {:.0}°C at {:.0}MHz average clock. A 50MHz underclock can reduce temps significantly.",
                    max_temp, avg_clock
                ),
                potential_benefit: "Reduce temperatures by 4-7°C, ~3% performance loss".into(),
                confidence: 0.55,
                applied: false,
                timestamp: chrono::Utc::now().timestamp(),
            });
        }

        suggestions
    }
}
