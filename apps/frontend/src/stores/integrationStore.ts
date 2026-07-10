import { create } from 'zustand';
import type { IntegrationConfig } from '../services/integrationService';
import * as integrationService from '../services/integrationService';

interface IntegrationState {
  config: IntegrationConfig | null;
  loading: boolean;
  testResult: string | null;
  testError: string | null;
  obsRunning: boolean;
  fetchConfig: () => Promise<void>;
  saveConfig: (config: IntegrationConfig) => Promise<void>;
  testWebhook: (url: string) => Promise<void>;
  sendReport: (url: string) => Promise<void>;
  startObs: (port: number) => Promise<void>;
  stopObs: () => Promise<void>;
  refreshObsStatus: () => Promise<void>;
}

export const useIntegrationStore = create<IntegrationState>((set) => ({
  config: null,
  loading: false,
  testResult: null,
  testError: null,
  obsRunning: false,

  fetchConfig: async () => {
    set({ loading: true });
    try {
      const config = await integrationService.getIntegrationConfig();
      set({ config, loading: false });
    } catch {
      set({ loading: false });
    }
  },

  saveConfig: async (config: IntegrationConfig) => {
    await integrationService.saveIntegrationConfig(config);
    set({ config });
  },

  testWebhook: async (url: string) => {
    set({ testResult: null, testError: null });
    try {
      const result = await integrationService.testDiscordWebhook(url);
      set({ testResult: result, testError: null });
    } catch (e) {
      set({ testResult: null, testError: String(e) });
    }
  },

  sendReport: async (url: string) => {
    try {
      await integrationService.sendDiscordReport(url);
      set({ testResult: 'Report sent successfully', testError: null });
    } catch (e) {
      set({ testResult: null, testError: String(e) });
    }
  },

  startObs: async (port: number) => {
    try {
      await integrationService.startObsSource(port);
      set({ obsRunning: true });
    } catch (e) {
      set({ testError: String(e) });
    }
  },

  stopObs: async () => {
    try {
      await integrationService.stopObsSource();
      set({ obsRunning: false });
    } catch (e) {
      set({ testError: String(e) });
    }
  },

  refreshObsStatus: async () => {
    try {
      const running = await integrationService.isObsRunning();
      set({ obsRunning: running });
    } catch {
      set({ obsRunning: false });
    }
  },
}));
