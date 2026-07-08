use crate::hardware::GpuSample;

#[derive(Debug, Clone, serde::Serialize, serde::Deserialize)]
pub struct AggregatedMetrics {
    pub gpu_id: String,
    pub temperature: MetricStats,
    pub core_clock: MetricStats,
    pub memory_clock: MetricStats,
    pub fan_speed: MetricStats,
    pub power: MetricStats,
    pub core_util: MetricStats,
    pub mem_util: MetricStats,
}

#[derive(Debug, Clone, serde::Serialize, serde::Deserialize)]
pub struct MetricStats {
    pub current: f64,
    pub min: f64,
    pub max: f64,
    pub avg: f64,
}

pub struct Aggregator;

impl Aggregator {
    pub fn aggregate(gpu_id: &str, samples: &[&GpuSample]) -> AggregatedMetrics {
        let temps: Vec<f64> = samples.iter().map(|s| s.temperature_celsius).collect();
        let clocks: Vec<f64> = samples.iter().map(|s| s.core_clock_mhz).collect();
        let mem_clocks: Vec<f64> = samples.iter().map(|s| s.memory_clock_mhz).collect();
        let fans: Vec<f64> = samples.iter().map(|s| s.fan_speed_percent).collect();
        let powers: Vec<f64> = samples.iter().map(|s| s.power_watts).collect();
        let core_utils: Vec<f64> = samples.iter().map(|s| s.core_utilization_percent).collect();
        let mem_utils: Vec<f64> = samples.iter().map(|s| s.memory_utilization_percent).collect();

        AggregatedMetrics {
            gpu_id: gpu_id.to_string(),
            temperature: Self::stats(&temps),
            core_clock: Self::stats(&clocks),
            memory_clock: Self::stats(&mem_clocks),
            fan_speed: Self::stats(&fans),
            power: Self::stats(&powers),
            core_util: Self::stats(&core_utils),
            mem_util: Self::stats(&mem_utils),
        }
    }

    fn stats(values: &[f64]) -> MetricStats {
        let current = *values.last().unwrap_or(&0.0);
        let min = values.iter().cloned().fold(f64::MAX, f64::min);
        let max = values.iter().cloned().fold(f64::MIN, f64::max);
        let avg = if values.is_empty() {
            0.0
        } else {
            values.iter().sum::<f64>() / values.len() as f64
        };

        MetricStats {
            current,
            min,
            max,
            avg,
        }
    }

    pub fn smooth(values: &[f64], window: usize) -> Vec<f64> {
        if values.len() <= window {
            return values.to_vec();
        }

        let mut smoothed = Vec::with_capacity(values.len());
        for i in 0..values.len() {
            let start = i.saturating_sub(window / 2);
            let end = (i + window / 2).min(values.len());
            let slice = &values[start..end];
            let avg = slice.iter().sum::<f64>() / slice.len() as f64;
            smoothed.push(avg);
        }

        smoothed
    }
}
