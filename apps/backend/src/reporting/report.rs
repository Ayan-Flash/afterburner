use std::collections::HashMap;

use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use uuid::Uuid;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum TimeRange {
    LastMinutes(u64),
    LastHours(u64),
    LastDays(u64),
    Custom { start: i64, end: i64 },
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum ReportFormat {
    Csv,
    Html,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ReportConfig {
    pub gpu_ids: Vec<String>,
    pub time_range: TimeRange,
    pub format: ReportFormat,
    pub include_temperature: bool,
    pub include_clocks: bool,
    pub include_fan: bool,
    pub include_power: bool,
    pub include_utilization: bool,
    pub include_voltage: bool,
}

impl Default for ReportConfig {
    fn default() -> Self {
        Self {
            gpu_ids: vec![],
            time_range: TimeRange::LastHours(1),
            format: ReportFormat::Html,
            include_temperature: true,
            include_clocks: true,
            include_fan: true,
            include_power: true,
            include_utilization: true,
            include_voltage: false,
        }
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ReportSummary {
    pub id: String,
    pub name: String,
    pub created_at: i64,
    pub gpu_count: usize,
    pub sample_count: usize,
    pub format: String,
    pub file_size: u64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MetricRow {
    pub metric: String,
    pub current: f64,
    pub min: f64,
    pub max: f64,
    pub avg: f64,
    pub unit: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct GpuReportSection {
    pub gpu_id: String,
    pub gpu_name: String,
    pub sampling_duration_secs: u64,
    pub sample_count: usize,
    pub metrics: Vec<MetricRow>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Report {
    pub id: String,
    pub name: String,
    pub created_at: i64,
    pub config: ReportConfig,
    pub sections: Vec<GpuReportSection>,
    pub raw_csv: Option<String>,
    pub html_content: Option<String>,
}

impl Report {
    pub fn new(name: String, config: ReportConfig) -> Self {
        Self {
            id: Uuid::new_v4().to_string(),
            name,
            created_at: Utc::now().timestamp(),
            config,
            sections: vec![],
            raw_csv: None,
            html_content: None,
        }
    }

    pub fn summary(&self) -> ReportSummary {
        let sample_count: usize = self.sections.iter().map(|s| s.sample_count).sum();
        let html_len = self.html_content.as_ref().map(|h| h.len() as u64).unwrap_or(0);
        let csv_len = self.raw_csv.as_ref().map(|c| c.len() as u64).unwrap_or(0);
        ReportSummary {
            id: self.id.clone(),
            name: self.name.clone(),
            created_at: self.created_at,
            gpu_count: self.sections.len(),
            sample_count,
            format: if self.html_content.is_some() { "HTML" } else { "CSV" }.into(),
            file_size: html_len.max(csv_len),
        }
    }
}
