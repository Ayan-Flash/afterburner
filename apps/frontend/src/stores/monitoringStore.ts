import { create } from 'zustand';

interface MonitoringStore {
  sampleRate: number;
  bufferSize: number;
  enabledMetrics: string[];
  isRunning: boolean;

  setSampleRate: (rate: number) => void;
  setBufferSize: (size: number) => void;
  toggleMetric: (metric: string) => void;
  setEnabledMetrics: (metrics: string[]) => void;
  setRunning: (running: boolean) => void;
}

export const useMonitoringStore = create<MonitoringStore>((set) => ({
  sampleRate: 1000,
  bufferSize: 3600,
  enabledMetrics: ['temperature', 'core_clock', 'fan_speed', 'power', 'core_util'],
  isRunning: false,

  setSampleRate: (rate) => set({ sampleRate: rate }),
  setBufferSize: (size) => set({ bufferSize: size }),
  toggleMetric: (metric) =>
    set((state) => ({
      enabledMetrics: state.enabledMetrics.includes(metric)
        ? state.enabledMetrics.filter((m) => m !== metric)
        : [...state.enabledMetrics, metric],
    })),
  setEnabledMetrics: (metrics) => set({ enabledMetrics: metrics }),
  setRunning: (running) => set({ isRunning: running }),
}));
