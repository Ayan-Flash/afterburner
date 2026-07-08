use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub enum AnomalyType {
    TemperatureSpike,
    FanDrop,
    PowerSurge,
    ClockDrop,
    UtilizationAnomaly,
    MemoryLeak,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub enum AnomalySeverity {
    Low,
    Medium,
    High,
    Critical,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Anomaly {
    pub id: String,
    pub gpu_id: String,
    pub anomaly_type: AnomalyType,
    pub severity: AnomalySeverity,
    pub metric: String,
    pub current_value: f64,
    pub expected_value: f64,
    pub deviation: f64,
    pub timestamp: i64,
    pub message: String,
}

pub struct AnomalyDetector {
    window_size: usize,
    threshold: f64,
}

impl AnomalyDetector {
    pub fn new() -> Self {
        Self {
            window_size: 60,
            threshold: 2.5,
        }
    }

    pub fn detect(&self, values: &[f64]) -> Vec<(usize, f64, f64)> {
        if values.len() < self.window_size {
            return vec![];
        }

        let mut anomalies = vec![];

        for i in self.window_size..values.len() {
            let window = &values[i - self.window_size..i];
            let mean = window.iter().sum::<f64>() / window.len() as f64;
            let variance = window.iter().map(|v| (v - mean).powi(2)).sum::<f64>() / window.len() as f64;
            let std_dev = variance.sqrt();

            if std_dev < 0.001 {
                continue;
            }

            let z_score = (values[i] - mean).abs() / std_dev;

            if z_score > self.threshold {
                anomalies.push((i, values[i], mean));
            }
        }

        anomalies
    }

    pub fn detect_temperature_spike(&self, temps: &[f64]) -> Vec<Anomaly> {
        self.detect(temps)
            .into_iter()
            .map(|(idx, val, expected)| Anomaly {
                id: uuid::Uuid::new_v4().to_string(),
                gpu_id: String::new(),
                anomaly_type: AnomalyType::TemperatureSpike,
                severity: if val > 85.0 { AnomalySeverity::Critical }
                    else if val > 75.0 { AnomalySeverity::High }
                    else if val > 65.0 { AnomalySeverity::Medium }
                    else { AnomalySeverity::Low },
                metric: "temperature".into(),
                current_value: val,
                expected_value: expected,
                deviation: val - expected,
                timestamp: chrono::Utc::now().timestamp(),
                message: format!(
                    "Temperature spike detected: {:.1}°C (expected {:.1}°C, Δ{:.1})",
                    val, expected, val - expected
                ),
            })
            .collect()
    }

    pub fn detect_fan_drop(&self, fans: &[f64]) -> Vec<Anomaly> {
        self.detect(fans)
            .into_iter()
            .filter(|(_, val, _)| *val < 10.0)
            .map(|(idx, val, expected)| Anomaly {
                id: uuid::Uuid::new_v4().to_string(),
                gpu_id: String::new(),
                anomaly_type: AnomalyType::FanDrop,
                severity: if val < 5.0 { AnomalySeverity::Critical }
                    else { AnomalySeverity::High },
                metric: "fan_speed".into(),
                current_value: val,
                expected_value: expected,
                deviation: val - expected,
                timestamp: chrono::Utc::now().timestamp(),
                message: format!(
                    "Fan speed drop detected: {:.1}% (expected {:.1}%)",
                    val, expected
                ),
            })
            .collect()
    }

    pub fn detect_power_surge(&self, powers: &[f64]) -> Vec<Anomaly> {
        self.detect(powers)
            .into_iter()
            .filter(|(_, val, expected)| (val - expected).abs() > 20.0)
            .map(|(idx, val, expected)| Anomaly {
                id: uuid::Uuid::new_v4().to_string(),
                gpu_id: String::new(),
                anomaly_type: AnomalyType::PowerSurge,
                severity: if (val - expected).abs() > 50.0 { AnomalySeverity::Critical }
                    else { AnomalySeverity::Medium },
                metric: "power".into(),
                current_value: val,
                expected_value: expected,
                deviation: val - expected,
                timestamp: chrono::Utc::now().timestamp(),
                message: format!(
                    "Power {} detected: {:.1}W (expected {:.1}W)",
                    if val > expected { "surge" } else { "drop" },
                    val, expected
                ),
            })
            .collect()
    }
}
