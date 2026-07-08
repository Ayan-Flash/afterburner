import { invoke } from '@tauri-apps/api/core';

export interface SyncStatus {
  last_sync_at: number | null;
  next_sync_at: number | null;
  is_syncing: boolean;
  error: string | null;
  server_url: string;
  device_registered: boolean;
}

export interface SyncResult {
  success: boolean;
  profiles_synced: number;
  reports_synced: number;
  policies_synced: boolean;
  error: string | null;
}

export async function getSyncStatus(): Promise<SyncStatus> {
  return invoke('get_sync_status');
}

export async function registerDevice(serverUrl: string, apiKey: string): Promise<string> {
  return invoke('register_device', { serverUrl, apiKey });
}

export async function unregisterDevice(): Promise<void> {
  return invoke('unregister_device');
}

export async function syncNow(): Promise<SyncResult> {
  return invoke('sync_now');
}

export async function startSyncClient(): Promise<void> {
  return invoke('start_sync_client');
}

export async function stopSyncClient(): Promise<void> {
  return invoke('stop_sync_client');
}

export async function updateSyncSettings(
  serverUrl: string,
  apiKey: string,
  syncIntervalSecs: number,
  syncProfiles: boolean,
  syncReports: boolean,
  syncPolicies: boolean,
): Promise<void> {
  return invoke('update_sync_settings', { serverUrl, apiKey, syncIntervalSecs, syncProfiles, syncReports, syncPolicies });
}

export async function startSyncServer(): Promise<void> {
  return invoke('start_sync_server');
}

export async function stopSyncServer(): Promise<void> {
  return invoke('stop_sync_server');
}

export async function isSyncServerRunning(): Promise<boolean> {
  return invoke('is_sync_server_running');
}
