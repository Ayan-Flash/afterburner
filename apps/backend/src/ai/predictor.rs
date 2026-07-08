use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Prediction {
    pub metric: String,
    pub current_value: f64,
    pub predicted_next: f64,
    pub predicted_in_5m: f64,
    pub predicted_in_15m: f64,
    pub trend: TrendDirection,
    pub confidence: f64,
    pub time_to_throttle: Option<f64>,
    pub time_to_critical: Option<f64>,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub enum TrendDirection {
    Rising,
    Falling,
    Stable,
    Volatile,
}

pub struct Predictor;

impl Predictor {
    pub fn predict_temperature(values: &[f64], critical_temp: f64) -> Prediction {
        let current = *values.last().unwrap_or(&0.0);

        if values.len() < 10 {
            return Prediction {
                metric: "temperature".into(),
                current_value: current,
                predicted_next: current,
                predicted_in_5m: current,
                predicted_in_15m: current,
                trend: TrendDirection::Stable,
                confidence: 0.0,
                time_to_throttle: None,
                time_to_critical: None,
            };
        }

        let n = values.len();
        let recent = &values[n - 10..n];
        let slope = Self::linear_regression_slope(recent);

        let predicted_next = current + slope;
        let predicted_in_5m = current + slope * 300.0;
        let predicted_in_15m = current + slope * 900.0;

        let trend = if slope.abs() < 0.01 {
            TrendDirection::Stable
        } else if slope > 0.0 {
            TrendDirection::Rising
        } else {
            TrendDirection::Falling
        };

        let variance = recent.iter()
            .map(|v| (v - current).powi(2))
            .sum::<f64>() / recent.len() as f64;
        let confidence = if variance < 1.0 { 0.9 }
            else if variance < 5.0 { 0.7 }
            else if variance < 20.0 { 0.5 }
            else { 0.3 };

        let time_to_throttle = if slope > 0.0 {
            let throttle_temp = 83.0;
            let remaining = throttle_temp - current;
            if remaining > 0.0 && slope > 0.001 {
                Some((remaining / slope).max(0.0))
            } else { None }
        } else { None };

        let time_to_critical = if slope > 0.0 {
            let remaining = critical_temp - current;
            if remaining > 0.0 && slope > 0.001 {
                Some((remaining / slope).max(0.0))
            } else { None }
        } else { None };

        Prediction {
            metric: "temperature".into(),
            current_value: current,
            predicted_next,
            predicted_in_5m,
            predicted_in_15m,
            trend,
            confidence,
            time_to_throttle,
            time_to_critical,
        }
    }

    pub fn predict_utilization(values: &[f64]) -> Prediction {
        let current = *values.last().unwrap_or(&0.0);

        if values.len() < 5 {
            return Prediction {
                metric: "utilization".into(),
                current_value: current,
                predicted_next: current,
                predicted_in_5m: current,
                predicted_in_15m: current,
                trend: TrendDirection::Stable,
                confidence: 0.0,
                time_to_throttle: None,
                time_to_critical: None,
            };
        }

        let n = values.len();
        let recent = &values[n - 5..n];
        let slope = Self::linear_regression_slope(recent);
        let predicted_next = (current + slope).clamp(0.0, 100.0);
        let predicted_in_5m = (current + slope * 300.0).clamp(0.0, 100.0);
        let predicted_in_15m = (current + slope * 900.0).clamp(0.0, 100.0);

        let trend = if slope.abs() < 0.5 { TrendDirection::Stable }
            else if slope > 0.0 { TrendDirection::Rising }
            else { TrendDirection::Falling };

        Prediction {
            metric: "utilization".into(),
            current_value: current,
            predicted_next,
            predicted_in_5m,
            predicted_in_15m,
            trend,
            confidence: 0.6,
            time_to_throttle: None,
            time_to_critical: None,
        }
    }

    fn linear_regression_slope(values: &[f64]) -> f64 {
        let n = values.len() as f64;
        let mean_x = (n - 1.0) / 2.0;
        let mean_y = values.iter().sum::<f64>() / n;

        let mut numerator = 0.0;
        let mut denominator = 0.0;

        for (i, y) in values.iter().enumerate() {
            let x = i as f64;
            numerator += (x - mean_x) * (y - mean_y);
            denominator += (x - mean_x).powi(2);
        }

        if denominator.abs() < 0.001 { 0.0 } else { numerator / denominator }
    }
}
