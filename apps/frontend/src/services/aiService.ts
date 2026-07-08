import { invoke } from '@tauri-apps/api/core';

export interface Anomaly {
  id: string;
  gpu_id: string;
  anomaly_type: 'TemperatureSpike' | 'FanDrop' | 'PowerSurge' | 'ClockDrop' | 'UtilizationAnomaly' | 'MemoryLeak';
  severity: 'Low' | 'Medium' | 'High' | 'Critical';
  metric: string;
  current_value: number;
  expected_value: number;
  deviation: number;
  timestamp: number;
  message: string;
}

export interface OptimizationSuggestion {
  id: string;
  gpu_id: string;
  category: 'FanCurve' | 'PowerLimit' | 'ClockOffset' | 'Underclock' | 'ProfileSwitch';
  title: string;
  description: string;
  potential_benefit: string;
  confidence: number;
  applied: boolean;
  timestamp: number;
}

export interface Prediction {
  metric: string;
  current_value: number;
  predicted_next: number;
  predicted_in_5m: number;
  predicted_in_15m: number;
  trend: 'Rising' | 'Falling' | 'Stable' | 'Volatile';
  confidence: number;
  time_to_throttle: number | null;
  time_to_critical: number | null;
}

export async function getAiAnomalies(limit: number): Promise<Anomaly[]> {
  return invoke('get_ai_anomalies', { limit });
}

export async function getAiSuggestions(): Promise<OptimizationSuggestion[]> {
  return invoke('get_ai_suggestions');
}

export async function clearAiAnomalies(): Promise<void> {
  return invoke('clear_ai_anomalies');
}

export async function dismissAiSuggestion(id: string): Promise<void> {
  return invoke('dismiss_ai_suggestion', { id });
}

export async function runAiAnalysis(): Promise<[Anomaly[], OptimizationSuggestion[]]> {
  return invoke('run_ai_analysis');
}

export async function predictGpuTemperature(gpuId: string): Promise<Prediction> {
  return invoke('predict_gpu_temperature', { gpuId });
}

export async function predictGpuUtilization(gpuId: string): Promise<Prediction> {
  return invoke('predict_gpu_utilization', { gpuId });
}

export interface FanCurvePoint {
  temperature: number;
  fan_speed: number;
}

export interface FanCurveResult {
  points: FanCurvePoint[];
  estimated_max_temp: number;
  estimated_noise_level: string;
}

export interface ClockTuneResult {
  core_offset_mhz: number;
  memory_offset_mhz: number;
  peak_performance_score: number;
  avg_temperature: number;
  stability: string;
}

export interface PowerTuneResult {
  limit_percent: number;
  estimated_performance: number;
  estimated_power_save: number;
  efficiency_score: number;
}

export interface TuningProfile {
  id: string;
  gpu_id: string;
  name: string;
  created_at: number;
  fan_curve: FanCurveResult | null;
  clock_offsets: ClockTuneResult | null;
  power_limit: PowerTuneResult | null;
}

export async function tuneFanCurve(gpuId: string): Promise<FanCurveResult> {
  return invoke('tune_fan_curve', { gpuId });
}

export async function tuneClockOffsets(gpuId: string): Promise<ClockTuneResult> {
  return invoke('tune_clock_offsets', { gpuId });
}

export async function tunePowerLimit(gpuId: string, maxPowerWatts: number): Promise<PowerTuneResult> {
  return invoke('tune_power_limit', { gpuId, maxPowerWatts });
}

export async function getTuningProfiles(gpuId: string): Promise<TuningProfile[]> {
  return invoke('get_tuning_profiles', { gpuId });
}

export async function saveTuningProfile(profile: TuningProfile): Promise<void> {
  return invoke('save_tuning_profile', { profile });
}

export async function applyTuningProfile(gpuId: string): Promise<string> {
  return invoke('apply_tuning_profile', { gpuId });
}
