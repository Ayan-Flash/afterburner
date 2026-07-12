import { invoke } from '@tauri-apps/api/core';

export interface UpdateInfo {
  version: string;
  date: string;
  body: string;
  download_url: string;
}

export type UpdateStatus =
  | { type: 'Idle' }
  | { type: 'Checking' }
  | { type: 'Available'; info: UpdateInfo }
  | { type: 'Downloading'; progress: number }
  | { type: 'Downloaded'; info: UpdateInfo }
  | { type: 'Installing' }
  | { type: 'Error'; error: string }
  | { type: 'UpToDate' };

export const updateService = {
  checkUpdate: () => invoke<UpdateStatus>('check_update'),
  startUpdate: () => invoke<string>('start_update'),
  getUpdateStatus: () => invoke<UpdateStatus>('get_update_status'),
  setAutoCheck: (enabled: boolean) => invoke<void>('set_auto_check', { enabled }),
  setCheckInterval: (hours: number) => invoke<void>('set_check_interval', { hours }),
};
