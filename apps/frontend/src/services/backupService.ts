import { invoke } from '@tauri-apps/api/core';

export interface BackupScope {
  profiles: boolean;
  alert_rules: boolean;
  automation_rules: boolean;
  integrations: boolean;
  enterprise: boolean;
  overlay: boolean;
  remote: boolean;
  tuning_profiles: boolean;
  reports: boolean;
}

export interface BackupMetadata {
  id: string;
  name: string;
  created_at: number;
  file_size_bytes: number;
  scope: BackupScope;
  gpu_count: number;
  profile_count: number;
  rule_count: number;
}

export interface BackupResult {
  id: string;
  path: string;
  metadata: BackupMetadata;
}

export interface RestoreResult {
  success: boolean;
  restored_profiles: number;
  restored_rules: number;
  errors: string[];
}

export const backupService = {
  create: (name: string, scope: BackupScope) =>
    invoke<BackupResult>('create_backup', { name, scope }),

  restore: (id: string, scope: BackupScope) =>
    invoke<RestoreResult>('restore_backup', { id, scope }),

  list: () => invoke<BackupMetadata[]>('list_backups'),

  delete: (id: string) => invoke<void>('delete_backup', { id }),

  exportPath: (id: string) => invoke<string>('export_backup', { id }),

  import: (filePath: string) => invoke<BackupMetadata>('import_backup', { filePath }),
};
