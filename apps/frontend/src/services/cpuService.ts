import { invoke } from '@tauri-apps/api/core';

/* ================================================================
   cpuService — real CPU telemetry from the Rust backend (sysinfo).
   Mirrors gpuService's invoke-based shape.
   ================================================================ */

export interface CpuInfo {
  model: string;
  vendor: string;
  physical_cores: number;
  logical_cores: number;
}

export interface CpuCoreSample {
  core_index: number;
  frequency_mhz: number;
  usage_percent: number;
}

export interface CpuSample {
  timestamp: number;
  frequency_mhz: number;
  max_frequency_mhz: number;
  usage_percent: number;
  /** null when the OS exposes no CPU thermal sensor. */
  temperature_celsius: number | null;
  /** null — CPU voltage requires a kernel-mode sensor driver. */
  voltage_volts: number | null;
  cores: CpuCoreSample[];
}

export const cpuService = {
  getInfo: () => invoke<CpuInfo>('get_cpu_info'),
  getSample: () => invoke<CpuSample>('get_cpu_sample'),
};
