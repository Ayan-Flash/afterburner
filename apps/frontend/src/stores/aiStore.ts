import { create } from 'zustand';
import type { Anomaly, OptimizationSuggestion, Prediction } from '../services/aiService';
import * as aiService from '../services/aiService';

interface AiState {
  anomalies: Anomaly[];
  suggestions: OptimizationSuggestion[];
  tempPrediction: Prediction | null;
  utilPrediction: Prediction | null;
  loading: boolean;
  analyzing: boolean;
  error: string | null;
  fetchAnomalies: (limit?: number) => Promise<void>;
  fetchSuggestions: () => Promise<void>;
  clearAnomalies: () => Promise<void>;
  dismissSuggestion: (id: string) => Promise<void>;
  runAnalysis: () => Promise<void>;
  predictTemp: (gpuId: string) => Promise<void>;
  predictUtil: (gpuId: string) => Promise<void>;
  clearError: () => void;
}

export const useAiStore = create<AiState>((set) => ({
  anomalies: [],
  suggestions: [],
  tempPrediction: null,
  utilPrediction: null,
  loading: false,
  analyzing: false,
  error: null,

  fetchAnomalies: async (limit = 50) => {
    try {
      const anomalies = await aiService.getAiAnomalies(limit);
      set({ anomalies });
    } catch (e) {
      set({ error: String(e) });
    }
  },

  fetchSuggestions: async () => {
    try {
      const suggestions = await aiService.getAiSuggestions();
      set({ suggestions });
    } catch (e) {
      set({ error: String(e) });
    }
  },

  clearAnomalies: async () => {
    try {
      await aiService.clearAiAnomalies();
      set({ anomalies: [] });
    } catch (e) {
      set({ error: String(e) });
    }
  },

  dismissSuggestion: async (id: string) => {
    try {
      await aiService.dismissAiSuggestion(id);
      const suggestions = await aiService.getAiSuggestions();
      set({ suggestions });
    } catch (e) {
      set({ error: String(e) });
    }
  },

  runAnalysis: async () => {
    set({ analyzing: true, error: null });
    try {
      const [, suggestions] = await aiService.runAiAnalysis();
      const anomalies = await aiService.getAiAnomalies(50);
      set({ anomalies, suggestions, analyzing: false });
    } catch (e) {
      set({ error: String(e), analyzing: false });
    }
  },

  predictTemp: async (gpuId: string) => {
    try {
      const prediction = await aiService.predictGpuTemperature(gpuId);
      set({ tempPrediction: prediction });
    } catch (e) {
      set({ error: String(e) });
    }
  },

  predictUtil: async (gpuId: string) => {
    try {
      const prediction = await aiService.predictGpuUtilization(gpuId);
      set({ utilPrediction: prediction });
    } catch (e) {
      set({ error: String(e) });
    }
  },

  clearError: () => set({ error: null }),
}));
