import { create } from 'zustand';
import type { SmartAlertConfig, MetricBaseline, ContextInfo, SuppressedAlert } from '../services/smartAlertService';
import { smartAlertService } from '../services/smartAlertService';

interface SmartAlertState {
  config: SmartAlertConfig | null;
  baselines: MetricBaseline[];
  context: ContextInfo | null;
  suppressed: SuppressedAlert[];
  loading: boolean;
  error: string | null;
  fetchAll: () => Promise<void>;
  fetchStatus: () => Promise<void>;
  fetchBaselines: () => Promise<void>;
  fetchContext: () => Promise<void>;
  fetchSuppressed: () => Promise<void>;
  updateConfig: (config: SmartAlertConfig) => Promise<void>;
  resetBaselines: () => Promise<void>;
  clearError: () => void;
}

export const useSmartAlertStore = create<SmartAlertState>((set) => ({
  config: null,
  baselines: [],
  context: null,
  suppressed: [],
  loading: false,
  error: null,

  fetchAll: async () => {
    set({ loading: true, error: null });
    try {
      const [config, baselines, context, suppressed] = await Promise.all([
        smartAlertService.getStatus(),
        smartAlertService.getBaselines(),
        smartAlertService.getContext(),
        smartAlertService.getSuppressed(),
      ]);
      set({ config, baselines, context, suppressed, loading: false });
    } catch (e: any) {
      set({ error: String(e), loading: false });
    }
  },

  fetchStatus: async () => {
    try {
      const config = await smartAlertService.getStatus();
      set({ config });
    } catch (e: any) {
      set({ error: String(e) });
    }
  },

  fetchBaselines: async () => {
    try {
      const baselines = await smartAlertService.getBaselines();
      set({ baselines });
    } catch (e: any) {
      set({ error: String(e) });
    }
  },

  fetchContext: async () => {
    try {
      const context = await smartAlertService.getContext();
      set({ context });
    } catch (e: any) {
      set({ error: String(e) });
    }
  },

  fetchSuppressed: async () => {
    try {
      const suppressed = await smartAlertService.getSuppressed();
      set({ suppressed });
    } catch (e: any) {
      set({ error: String(e) });
    }
  },

  updateConfig: async (config: SmartAlertConfig) => {
    try {
      await smartAlertService.updateConfig(config);
      set({ config });
    } catch (e: any) {
      set({ error: String(e) });
    }
  },

  resetBaselines: async () => {
    try {
      await smartAlertService.resetBaselines();
      const baselines = await smartAlertService.getBaselines();
      set({ baselines });
    } catch (e: any) {
      set({ error: String(e) });
    }
  },

  clearError: () => set({ error: null }),
}));
