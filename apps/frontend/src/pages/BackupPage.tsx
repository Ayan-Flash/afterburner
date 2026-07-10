import { useEffect, useState } from 'react';
import { useBackupStore } from '../stores/backupStore';
import { IconSave, IconRefresh, IconTrash2, IconDownload, IconCheck, IconUpload } from '../components/base/Icons';
import type { BackupScope } from '../services/backupService';

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatDate(ts: number) {
  return new Date(ts * 1000).toLocaleString();
}

const defaultScope: BackupScope = {
  profiles: true,
  alert_rules: false,
  automation_rules: false,
  integrations: false,
  enterprise: false,
  overlay: false,
  remote: false,
  tuning_profiles: true,
  reports: false,
};

export function BackupPage() {
  const { backups, lastResult, lastRestore, loading, error, fetchBackups, createBackup, restoreBackup, deleteBackup, importBackup, clearError } = useBackupStore();

  const [name, setName] = useState('');
  const [scope, setScope] = useState<BackupScope>({ ...defaultScope });
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [restoreScope, setRestoreScope] = useState<BackupScope>({ ...defaultScope });

  useEffect(() => {
    fetchBackups();
  }, [fetchBackups]);

  const toggleScope = (key: keyof BackupScope) => {
    setScope((s) => ({ ...s, [key]: !s[key] }));
  };

  const handleCreate = () => {
    if (!name.trim()) return;
    createBackup(name.trim(), scope);
    setName('');
  };

  const handleRestore = () => {
    if (!selectedId) return;
    restoreBackup(selectedId, restoreScope);
  };

  const handleFileImport = async () => {
    const path = prompt('Enter path to .gpubackup file:');
    if (path) {
      importBackup(path);
    }
  };

  return (
    <div className="space-y-6">
      <div className="section-header">
        <h2 className="text-text-primary text-lg font-semibold">Backup & Restore</h2>
        <p className="text-text-secondary mt-1 text-sm">Create full system backups and restore your configuration</p>
      </div>

      {error && (
        <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
          {error}
          <button onClick={clearError} className="float-right text-red-400/70 hover:text-red-400">&times;</button>
        </div>
      )}

      {lastResult && (
        <div className="flex items-center gap-2 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-400">
          <IconCheck className="size-4" />
          Backup created: {lastResult.metadata.name} ({formatBytes(lastResult.metadata.file_size_bytes)})
        </div>
      )}

      {lastRestore && (
        <div className={`rounded-lg px-4 py-3 text-sm ${lastRestore.success ? 'border border-emerald-500/30 bg-emerald-500/10 text-emerald-400' : 'border border-amber-500/30 bg-amber-500/10 text-amber-400'}`}>
          {lastRestore.success
            ? `Restore complete: ${lastRestore.restored_profiles} profiles, ${lastRestore.restored_rules} rules`
            : `Restore completed with ${lastRestore.errors.length} errors`}
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="card space-y-4 p-5">
          <div className="flex items-center gap-3">
            <div className="bg-accent-primary/20 flex size-10 items-center justify-center rounded-lg">
              <IconSave className="text-accent-primary size-5" />
            </div>
            <div>
              <h3 className="text-text-primary text-sm font-semibold">Create Backup</h3>
              <p className="text-text-secondary text-xs">Save your current configuration</p>
            </div>
          </div>

          <div>
            <label className="text-text-secondary mb-1 block text-xs font-medium">Backup Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Before OC Tuning"
              className="bg-gpu-800 border-gpu-700 text-text-primary focus:border-accent-primary w-full rounded-lg border px-3 py-2 text-sm focus:outline-none"
            />
          </div>

          <div className="space-y-2">
            <p className="text-text-secondary text-xs font-medium">Include</p>
            {([
              ['profiles', 'GPU Profiles'] as const,
              ['automation_rules', 'Automation Rules'] as const,
              ['alert_rules', 'Alert Rules'] as const,
              ['integrations', 'Integration Config'] as const,
              ['enterprise', 'Enterprise Config'] as const,
              ['tuning_profiles', 'Tuning Profiles'] as const,
              ['overlay', 'Overlay Config'] as const,
              ['remote', 'Remote Config'] as const,
              ['reports', 'Reports'] as const,
            ]).map(([key, label]) => (
              <label key={key} className="flex cursor-pointer items-center gap-2">
                <input
                  type="checkbox"
                  checked={scope[key]}
                  onChange={() => toggleScope(key)}
                  className="border-gpu-600 bg-gpu-800 accent-accent-primary rounded"
                />
                <span className="text-text-primary text-sm">{label}</span>
              </label>
            ))}
          </div>

          <button onClick={handleCreate} disabled={loading || !name.trim()} className="btn-primary w-full px-4 py-2 text-xs">
            {loading ? 'Creating...' : 'Create Backup'}
          </button>
        </div>

        <div className="card space-y-4 p-5">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-lg bg-blue-500/20">
              <IconDownload className="size-5 text-blue-400" />
            </div>
            <div>
              <h3 className="text-text-primary text-sm font-semibold">Saved Backups</h3>
              <p className="text-text-secondary text-xs">{backups.length} backup{backups.length !== 1 ? 's' : ''}</p>
            </div>
            <div className="ml-auto flex gap-1">
              <button onClick={fetchBackups} className="btn-ghost p-1.5" title="Refresh">
                <IconRefresh className="size-4" />
              </button>
              <button onClick={handleFileImport} className="btn-ghost p-1.5" title="Import backup file">
                <IconUpload className="size-4" />
              </button>
            </div>
          </div>

          {backups.length === 0 ? (
            <p className="text-text-muted py-6 text-center text-xs">No backups yet. Create one to get started.</p>
          ) : (
            <div className="max-h-80 space-y-2 overflow-y-auto">
              {backups.map((b) => (
                <div
                  key={b.id}
                  className={`cursor-pointer rounded-lg border px-3 py-2 transition-colors ${
                    selectedId === b.id
                      ? 'bg-accent-primary/10 border-accent-primary/40'
                      : 'bg-gpu-800 border-gpu-700 hover:border-gpu-600'
                  }`}
                  onClick={() => {
                    setSelectedId(b.id);
                    setRestoreScope(b.scope);
                  }}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-text-primary text-sm font-medium">{b.name}</p>
                      <p className="text-text-secondary text-xs">{formatDate(b.created_at)} &middot; {formatBytes(b.file_size_bytes)}</p>
                    </div>
                    <button
                      onClick={(e) => { e.stopPropagation(); deleteBackup(b.id); }}
                      className="btn-ghost text-text-muted p-1 hover:text-red-400"
                      title="Delete"
                    >
                      <IconTrash2 className="size-3.5" />
                    </button>
                  </div>
                  <div className="mt-1 flex gap-2">
                    <span className="badge-ghost text-xs">{b.profile_count} profiles</span>
                    <span className="badge-ghost text-xs">{b.rule_count} rules</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {selectedId && (
            <div className="border-gpu-700 space-y-2 border-t pt-2">
              <p className="text-text-secondary text-xs font-medium">Restore scope</p>
              {(['profiles', 'automation_rules', 'integrations', 'enterprise'] as const).map((key) => (
                <label key={key} className="flex cursor-pointer items-center gap-2">
                  <input
                    type="checkbox"
                    checked={restoreScope[key]}
                    onChange={() => setRestoreScope((s) => ({ ...s, [key]: !s[key] }))}
                    className="border-gpu-600 bg-gpu-800 accent-accent-primary rounded"
                  />
                  <span className="text-text-primary text-sm">{key.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())}</span>
                </label>
              ))}
              <button onClick={handleRestore} disabled={loading} className="btn-primary w-full px-4 py-2 text-xs">
                {loading ? 'Restoring...' : 'Restore Selected Backup'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
