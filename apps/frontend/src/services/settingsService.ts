import { invoke } from '@tauri-apps/api/core';

export const settingsService = {
  get: (key: string) => invoke<string | null>('get_setting', { key }),

  set: (key: string, value: string) => invoke<void>('set_setting', { key, value }),

  getAll: () => invoke<Record<string, string>>('get_all_settings'),
};
