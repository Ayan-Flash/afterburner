import { invoke } from '@tauri-apps/api/core';

export interface TimeRange {
  last_minutes?: number;
  last_hours?: number;
  last_days?: number;
  custom?: { start: number; end: number };
}

export interface ReportConfig {
  gpu_ids: string[];
  time_range: TimeRange;
  format: 'Csv' | 'Html';
  include_temperature: boolean;
  include_clocks: boolean;
  include_fan: boolean;
  include_power: boolean;
  include_utilization: boolean;
  include_voltage: boolean;
}

export interface MetricRow {
  metric: string;
  current: number;
  min: number;
  max: number;
  avg: number;
  unit: string;
}

export interface GpuReportSection {
  gpu_id: string;
  gpu_name: string;
  sampling_duration_secs: number;
  sample_count: number;
  metrics: MetricRow[];
}

export interface ReportSummary {
  id: string;
  name: string;
  created_at: number;
  gpu_count: number;
  sample_count: number;
  format: string;
  file_size: number;
}

export interface Report {
  id: string;
  name: string;
  created_at: number;
  config: ReportConfig;
  sections: GpuReportSection[];
  raw_csv: string | null;
  html_content: string | null;
}

export async function generateReport(name: string, config: ReportConfig): Promise<ReportSummary> {
  return invoke('generate_report', { name, config });
}

export async function listReports(): Promise<ReportSummary[]> {
  return invoke('list_reports');
}

export async function getReport(id: string): Promise<Report> {
  return invoke('get_report', { id });
}

export async function deleteReport(id: string): Promise<void> {
  return invoke('delete_report', { id });
}

export async function exportReportCsv(id: string): Promise<string> {
  return invoke('export_report_csv', { id });
}
