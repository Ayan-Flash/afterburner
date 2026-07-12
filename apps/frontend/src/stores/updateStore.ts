import { create } from 'zustand';
import { updateService } from '../services/updateService';
import type { UpdateStatus } from '../services/updateService';

interface UpdateStore {
  status: UpdateStatus;
  autoCheck: boolean;
  checkIntervalHours: number;
  checking: boolean;
  error: string | null;
  lastCheckResult: string | null;

  checkUpdate: () => Promise<void>;
  startUpdate: () => Promise<string>;
  getStatus: () => Promise<void>;
  setAutoCheck: (enabled: boolean) => Promise<void>;
  setCheckInterval: (hours: number) => Promise<void>;
}

export const useUpdateStore = create<UpdateStore>((set) => ({
  status: { type: 'Idle' },
  autoCheck: true,
  checkIntervalHours: 24,
  checking: false,
  error: null,
  lastCheckResult: null,

  checkUpdate: async () => {
    set({ checking: true, error: null });
    try {
      const status = await updateService.checkUpdate();
      set({ status, checking: false });
      if (status.type === 'UpToDate') {
        set({ lastCheckResult: 'You are up to date!' });
      } else if (status.type === 'Available') {
        set({ lastCheckResult: `Update ${status.info.version} available` });
      } else if (status.type === 'Error') {
        set({ error: status.error, lastCheckResult: `Check failed: ${status.error}` });
      }
    } catch (err) {
      set({ checking: false, error: String(err), lastCheckResult: `Error: ${String(err)}` });
    }
  },

  startUpdate: async () => {
    set({ error: null });
    try {
      const result = await updateService.startUpdate();
      return result;
    } catch (err) {
      set({ error: String(err) });
      throw err;
    }
  },

  getStatus: async () => {
    try {
      const status = await updateService.getUpdateStatus();
      set({ status });
    } catch (err) {
      set({ error: String(err) });
    }
  },

  setAutoCheck: async (enabled: boolean) => {
    try {
      await updateService.setAutoCheck(enabled);
      set({ autoCheck: enabled });
    } catch (err) {
      set({ error: String(err) });
    }
  },

  setCheckInterval: async (hours: number) => {
    try {
      await updateService.setCheckInterval(hours);
      set({ checkIntervalHours: hours });
    } catch (err) {
      set({ error: String(err) });
    }
  },
}));
