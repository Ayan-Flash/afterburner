use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct OverlayConfig {
    pub enabled: bool,
    pub metrics: Vec<OverlayMetric>,
    pub position: OverlayPosition,
    pub opacity: f64,
    pub auto_hide_no_game: bool,
    pub scale: f64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum OverlayPosition {
    TopLeft,
    TopRight,
    BottomLeft,
    BottomRight,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct OverlayMetric {
    pub metric: String,
    pub label: String,
    pub color: String,
    pub enabled: bool,
}

impl Default for OverlayConfig {
    fn default() -> Self {
        Self {
            enabled: false,
            metrics: vec![
                OverlayMetric {
                    metric: "temperature_celsius".into(),
                    label: "Temp".into(),
                    color: "#ef4444".into(),
                    enabled: true,
                },
                OverlayMetric {
                    metric: "core_clock_mhz".into(),
                    label: "Core".into(),
                    color: "#3b82f6".into(),
                    enabled: true,
                },
                OverlayMetric {
                    metric: "fan_speed_percent".into(),
                    label: "Fan".into(),
                    color: "#22c55e".into(),
                    enabled: true,
                },
                OverlayMetric {
                    metric: "power_watts".into(),
                    label: "Power".into(),
                    color: "#eab308".into(),
                    enabled: true,
                },
                OverlayMetric {
                    metric: "core_utilization_percent".into(),
                    label: "GPU".into(),
                    color: "#a855f7".into(),
                    enabled: false,
                },
            ],
            position: OverlayPosition::TopRight,
            opacity: 0.85,
            auto_hide_no_game: true,
            scale: 1.0,
        }
    }
}
