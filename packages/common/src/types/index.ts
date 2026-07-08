export interface GPUInfo {
  id: string;
  name: string;
  vendor: 'nvidia' | 'amd' | 'intel';
  index: number;
}

export interface GPUData {
  gpuId: string;
  timestamp: number;
  temperature: number;
  clockSpeed: number;
  memoryClock: number;
  memoryUsage: number;
  fanSpeed: number;
  powerUsage: number;
  voltage: number;
}

export interface FanProfile {
  id: string;
  name: string;
  curve: Array<{ temperature: number; speed: number }>;
  enabled: boolean;
}

export interface ClockProfile {
  id: string;
  name: string;
  coreClockOffset: number;
  memoryClockOffset: number;
  voltageOffset: number;
  powerLimit: number;
}

export interface MonitoringConfig {
  sampleRateMs: number;
  bufferSize: number;
  retentionHours: number;
  enabledMetrics: string[];
}

export interface AppSettings {
  theme: 'dark' | 'light' | 'system';
  language: string;
  autoStart: boolean;
  minimizeToTray: boolean;
  updateChannel: 'stable' | 'beta' | 'nightly';
}
