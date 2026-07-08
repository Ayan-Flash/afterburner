import { create } from 'zustand';
import type { BackupMetadata, BackupResult, RestoreResult, BackupScope } from '../services/backupService';
import { backupService } from '../services/backupService';

interface BackupState {
  backups: BackupMetadata[];
  lastResult: BackupResult | null;
  lastRestore: RestoreResult | null;
  loading: boolean;
  error: string | null;
  fetchBackups: () => Promise<void>;
  createBackup: (name: string, scope: BackupScope) => Promise<void>;
  restoreBackup: (id: string, scope: BackupScope) => Promise<void>;
  deleteBackup: (id: string) => Promise<void>;
  importBackup: (filePath: string) => Promise<void>;
  clearError: () => void;
}

export const useBackupStore = create<BackupState>((set) => ({
  backups: [],
  lastResult: null,
  lastRestore: null,
  loading: false,
  error: null,

  fetchBackups: async () => {
    try {
      const backups = await backupService.list();
      set({ backups });
    } catch (e: any) {
      set({ error: String(e) });
    }
  },

  createBackup: async (name: string, scope: BackupScope) => {
    set({ loading: true, error: null });
    try {
      const result = await backupService.create(name, scope);
      const backups = await backupService.list();
      set({ backups, lastResult: result, loading: false });
    } catch (e: any) {
      set({ error: String(e), loading: false });
    }
  },

  restoreBackup: async (id: string, scope: BackupScope) => {
    set({ loading: true, error: null });
    try {
      const result = await backupService.restore(id, scope);
      set({ lastRestore: result, loading: false });
    } catch (e: any) {
      set({ error: String(e), loading: false });
    }
  },

  deleteBackup: async (id: string) => {
    try {
      await backupService.delete(id);
      const backups = await backupService.list();
      set({ backups });
    } catch (e: any) {
      set({ error: String(e) });
    }
  },

  importBackup: async (filePath: string) => {
    set({ loading: true, error: null });
    try {
      await backupService.import(filePath);
      const backups = await backupService.list();
      set({ backups, loading: false });
    } catch (e: any) {
      set({ error: String(e), loading: false });
    }
  },

  clearError: () => set({ error: null }),
}));
