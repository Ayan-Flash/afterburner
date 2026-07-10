import { create } from 'zustand';
import type { SyncStatus, SyncResult } from '../services/syncService';
import * as syncService from '../services/syncService';

interface SyncState {
  status: SyncStatus | null;
  lastResult: SyncResult | null;
  loading: boolean;
  error: string | null;
  fetchStatus: () => Promise<void>;
  register: (serverUrl: string, apiKey: string) => Promise<void>;
  unregister: () => Promise<void>;
  sync: () => Promise<void>;
  start: () => Promise<void>;
  stop: () => Promise<void>;
  updateSettings: (
    serverUrl: string,
    apiKey: string,
    interval: number,
    syncProfiles: boolean,
    syncReports: boolean,
    syncPolicies: boolean,
  ) => Promise<void>;
  clearError: () => void;
}

export const useSyncStore = create<SyncState>((set) => ({
  status: null,
  lastResult: null,
  loading: false,
  error: null,

  fetchStatus: async () => {
    try {
      const status = await syncService.getSyncStatus();
      set({ status });
    } catch (e) {
      set({ error: String(e) });
    }
  },

  register: async (serverUrl: string, apiKey: string) => {
    set({ loading: true, error: null });
    try {
      await syncService.registerDevice(serverUrl, apiKey);
      const status = await syncService.getSyncStatus();
      set({ status, loading: false });
    } catch (e) {
      set({ error: String(e), loading: false });
    }
  },

  unregister: async () => {
    try {
      await syncService.unregisterDevice();
      const status = await syncService.getSyncStatus();
      set({ status });
    } catch (e) {
      set({ error: String(e) });
    }
  },

  sync: async () => {
    set({ loading: true, error: null });
    try {
      const result = await syncService.syncNow();
      const status = await syncService.getSyncStatus();
      set({ lastResult: result, status, loading: false });
    } catch (e) {
      set({ error: String(e), loading: false });
    }
  },

  start: async () => {
    try {
      await syncService.startSyncClient();
      const status = await syncService.getSyncStatus();
      set({ status });
    } catch (e) {
      set({ error: String(e) });
    }
  },

  stop: async () => {
    try {
      await syncService.stopSyncClient();
      const status = await syncService.getSyncStatus();
      set({ status });
    } catch (e) {
      set({ error: String(e) });
    }
  },

  updateSettings: async (serverUrl, apiKey, interval, syncProfiles, syncReports, syncPolicies) => {
    try {
      await syncService.updateSyncSettings(serverUrl, apiKey, interval, syncProfiles, syncReports, syncPolicies);
      const status = await syncService.getSyncStatus();
      set({ status });
    } catch (e) {
      set({ error: String(e) });
    }
  },

  clearError: () => set({ error: null }),
}));
