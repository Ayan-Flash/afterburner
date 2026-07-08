use serde::{Deserialize, Serialize};

use crate::hardware::GpuSample;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ExportedSample {
    pub t: i64,
    pub temp: f64,
    pub core: f64,
    pub mem: f64,
    pub fan: f64,
    pub power: f64,
    pub core_util: f64,
    pub mem_util: f64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ExportedGpuData {
    pub gpu_id: String,
    pub samples: Vec<ExportedSample>,
}

pub struct Exporter;

impl Exporter {
    pub fn export_samples(samples: &[&GpuSample]) -> Vec<ExportedSample> {
        samples
            .iter()
            .map(|s| ExportedSample {
                t: s.timestamp,
                temp: (s.temperature_celsius * 10.0).round() / 10.0,
                core: s.core_clock_mhz.round(),
                mem: s.memory_clock_mhz.round(),
                fan: (s.fan_speed_percent * 10.0).round() / 10.0,
                power: (s.power_watts * 10.0).round() / 10.0,
                core_util: (s.core_utilization_percent * 10.0).round() / 10.0,
                mem_util: (s.memory_utilization_percent * 10.0).round() / 10.0,
            })
            .collect()
    }

    pub fn export_to_csv(samples: &[&GpuSample]) -> String {
        let mut csv = String::from("timestamp,temperature,core_clock,memory_clock,fan_speed,power,core_util,memory_util\n");
        for s in samples {
            csv.push_str(&format!(
                "{},{},{},{},{},{},{},{}\n",
                s.timestamp,
                (s.temperature_celsius * 10.0).round() / 10.0,
                s.core_clock_mhz.round(),
                s.memory_clock_mhz.round(),
                (s.fan_speed_percent * 10.0).round() / 10.0,
                (s.power_watts * 10.0).round() / 10.0,
                (s.core_utilization_percent * 10.0).round() / 10.0,
                (s.memory_utilization_percent * 10.0).round() / 10.0,
            ));
        }
        csv
    }
}
