export interface EngineConfig {
  sampleRateMs: number;
  bufferSize: number;
  retentionHours: number;
  enabledMetrics: string[];
}

export type EngineStatus = 'idle' | 'running' | 'paused' | 'error';

export interface EngineState {
  status: EngineStatus;
  startTime: number | null;
  samplesCollected: number;
  errors: number;
}
