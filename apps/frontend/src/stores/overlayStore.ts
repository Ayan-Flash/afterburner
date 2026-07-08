import { create } from 'zustand';
import { overlayService, type OverlayConfig } from '../services';

interface OverlayStore {
  config: OverlayConfig;
  running: boolean;
  detectedGames: string[];
  gameRunning: boolean;
  loading: boolean;
  error: string | null;

  fetchConfig: () => Promise<void>;
  fetchDetectedGames: () => Promise<void>;
  fetchGameStatus: () => Promise<void>;
  updateConfig: (config: OverlayConfig) => Promise<void>;
  start: () => Promise<void>;
  stop: () => Promise<void>;
  setEnabledMetrics: (metric: string, enabled: boolean) => void;
  setPosition: (position: OverlayConfig['position']) => void;
  setOpacity: (opacity: number) => void;
  toggleEnabled: () => void;
}

const defaultConfig: OverlayConfig = {
  enabled: false,
  metrics: [
    { metric: 'temperature_celsius', label: 'Temp', color: '#ef4444', enabled: true },
    { metric: 'core_clock_mhz', label: 'Core', color: '#3b82f6', enabled: true },
    { metric: 'fan_speed_percent', label: 'Fan', color: '#22c55e', enabled: true },
    { metric: 'power_watts', label: 'Power', color: '#eab308', enabled: true },
    { metric: 'core_utilization_percent', label: 'GPU', color: '#a855f7', enabled: false },
  ],
  position: 'TopRight',
  opacity: 0.85,
  auto_hide_no_game: true,
  scale: 1.0,
};

export const useOverlayStore = create<OverlayStore>((set, get) => ({
  config: defaultConfig,
  running: false,
  detectedGames: [],
  gameRunning: false,
  loading: false,
  error: null,

  fetchConfig: async () => {
    try {
      const config = await overlayService.getConfig();
      if (config && config.metrics) {
        set({ config });
      }
    } catch {
      // use default
    }
  },

  fetchDetectedGames: async () => {
    try {
      const games = await overlayService.getDetectedGames();
      set({ detectedGames: games });
    } catch {
      // ignore
    }
  },

  fetchGameStatus: async () => {
    try {
      const running = await overlayService.isGameRunning();
      set({ gameRunning: running });
    } catch {
      // ignore
    }
  },

  updateConfig: async (config: OverlayConfig) => {
    set({ loading: true, error: null });
    try {
      await overlayService.updateConfig(config);
      set({ config, loading: false });
    } catch (err) {
      set({ loading: false, error: String(err) });
    }
  },

  start: async () => {
    set({ loading: true, error: null });
    try {
      await overlayService.start();
      set({ running: true, loading: false });
    } catch (err) {
      set({ loading: false, error: String(err) });
    }
  },

  stop: async () => {
    set({ loading: true, error: null });
    try {
      await overlayService.stop();
      set({ running: false, loading: false });
    } catch (err) {
      set({ loading: false, error: String(err) });
    }
  },

  setEnabledMetrics: (metric: string, enabled: boolean) => {
    const { config } = get();
    const metrics = config.metrics.map((m) =>
      m.metric === metric ? { ...m, enabled } : m,
    );
    set({ config: { ...config, metrics } });
  },

  setPosition: (position) => {
    const { config } = get();
    set({ config: { ...config, position } });
  },

  setOpacity: (opacity) => {
    const { config } = get();
    set({ config: { ...config, opacity } });
  },

  toggleEnabled: () => {
    const { config } = get();
    set({ config: { ...config, enabled: !config.enabled } });
  },
}));
