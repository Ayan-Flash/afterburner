import { create } from 'zustand';
import { automationService } from '../services/automationService';
import type { Rule } from '../services/automationService';

interface AutomationStore {
  rules: Rule[];
  engineRunning: boolean;
  loading: boolean;
  error: string | null;

  fetchRules: () => Promise<void>;
  createRule: (name: string, description: string, triggerType: string, triggerValue: string, gpuId?: string) => Promise<void>;
  deleteRule: (ruleId: string) => Promise<void>;
  toggleRule: (ruleId: string, enabled: boolean) => Promise<void>;
  startEngine: () => Promise<void>;
  stopEngine: () => Promise<void>;
  setEngineRunning: (running: boolean) => void;
}

export const useAutomationStore = create<AutomationStore>((set, get) => ({
  rules: [],
  engineRunning: false,
  loading: false,
  error: null,

  fetchRules: async () => {
    set({ loading: true, error: null });
    try {
      const rules = await automationService.getRules();
      set({ rules, loading: false });
    } catch (err) {
      set({ error: String(err), loading: false });
    }
  },

  createRule: async (name, description, triggerType, triggerValue, gpuId) => {
    set({ loading: true, error: null });
    try {
      await automationService.createRule(name, description, triggerType, triggerValue, gpuId);
      await get().fetchRules();
    } catch (err) {
      set({ error: String(err), loading: false });
    }
  },

  deleteRule: async (ruleId) => {
    try {
      await automationService.deleteRule(ruleId);
      await get().fetchRules();
    } catch (err) {
      set({ error: String(err) });
    }
  },

  toggleRule: async (ruleId, enabled) => {
    try {
      await automationService.toggleRule(ruleId, enabled);
      await get().fetchRules();
    } catch (err) {
      set({ error: String(err) });
    }
  },

  startEngine: async () => {
    try {
      await automationService.startEngine();
      set({ engineRunning: true });
    } catch (err) {
      set({ error: String(err) });
    }
  },

  stopEngine: async () => {
    try {
      await automationService.stopEngine();
      set({ engineRunning: false });
    } catch (err) {
      set({ error: String(err) });
    }
  },

  setEngineRunning: (running) => set({ engineRunning: running }),
}));
