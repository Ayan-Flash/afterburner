import { create } from 'zustand';
import type { EnterpriseConfig, GroupPolicy, PolicyTarget } from '../services/enterpriseService';
import * as enterpriseService from '../services/enterpriseService';

interface EnterpriseState {
  config: EnterpriseConfig | null;
  policies: GroupPolicy[];
  loading: boolean;
  error: string | null;
  fetchConfig: () => Promise<void>;
  saveConfig: (config: EnterpriseConfig) => Promise<void>;
  fetchPolicies: () => Promise<void>;
  createPolicy: (name: string, description: string, target: PolicyTarget) => Promise<void>;
  deletePolicy: (id: string) => Promise<void>;
  togglePolicy: (id: string, enabled: boolean) => Promise<void>;
  clearError: () => void;
}

export const useEnterpriseStore = create<EnterpriseState>((set) => ({
  config: null,
  policies: [],
  loading: false,
  error: null,

  fetchConfig: async () => {
    set({ loading: true, error: null });
    try {
      const config = await enterpriseService.getEnterpriseConfig();
      set({ config, loading: false });
    } catch (e) {
      set({ error: String(e), loading: false });
    }
  },

  saveConfig: async (config: EnterpriseConfig) => {
    try {
      await enterpriseService.saveEnterpriseConfig(config);
      set({ config });
    } catch (e) {
      set({ error: String(e) });
    }
  },

  fetchPolicies: async () => {
    try {
      const policies = await enterpriseService.listGroupPolicies();
      set({ policies });
    } catch (e) {
      set({ error: String(e) });
    }
  },

  createPolicy: async (name: string, description: string, target: PolicyTarget) => {
    try {
      await enterpriseService.createGroupPolicy(name, description, target);
      const policies = await enterpriseService.listGroupPolicies();
      set({ policies });
    } catch (e) {
      set({ error: String(e) });
    }
  },

  deletePolicy: async (id: string) => {
    try {
      await enterpriseService.deleteGroupPolicy(id);
      const policies = await enterpriseService.listGroupPolicies();
      set({ policies });
    } catch (e) {
      set({ error: String(e) });
    }
  },

  togglePolicy: async (id: string, enabled: boolean) => {
    try {
      await enterpriseService.toggleGroupPolicy(id, enabled);
      const policies = await enterpriseService.listGroupPolicies();
      set({ policies });
    } catch (e) {
      set({ error: String(e) });
    }
  },

  clearError: () => set({ error: null }),
}));
