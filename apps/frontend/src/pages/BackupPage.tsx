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
        <h2 className="text-lg font-semibold text-text-primary">Backup & Restore</h2>
        <p className="text-sm text-text-secondary mt-1">Create full system backups and restore your configuration</p>
      </div>

      {error && (
        <div className="px-4 py-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
          {error}
          <button onClick={clearError} className="float-right text-red-400/70 hover:text-red-400">&times;</button>
        </div>
      )}

      {lastResult && (
        <div className="px-4 py-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-sm flex items-center gap-2">
          <IconCheck className="w-4 h-4" />
          Backup created: {lastResult.metadata.name} ({formatBytes(lastResult.metadata.file_size_bytes)})
        </div>
      )}

      {lastRestore && (
        <div className={`px-4 py-3 rounded-lg text-sm ${lastRestore.success ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400' : 'bg-amber-500/10 border border-amber-500/30 text-amber-400'}`}>
          {lastRestore.success
            ? `Restore complete: ${lastRestore.restored_profiles} profiles, ${lastRestore.restored_rules} rules`
            : `Restore completed with ${lastRestore.errors.length} errors`}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card p-5 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-accent-primary/20 flex items-center justify-center">
              <IconSave className="w-5 h-5 text-accent-primary" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-text-primary">Create Backup</h3>
              <p className="text-xs text-text-secondary">Save your current configuration</p>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1">Backup Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Before OC Tuning"
              className="w-full px-3 py-2 rounded-lg bg-gpu-800 border border-gpu-700 text-text-primary text-sm focus:outline-none focus:border-accent-primary"
            />
          </div>

          <div className="space-y-2">
            <p className="text-xs font-medium text-text-secondary">Include</p>
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
              <label key={key} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={scope[key]}
                  onChange={() => toggleScope(key)}
                  className="rounded border-gpu-600 bg-gpu-800 accent-accent-primary"
                />
                <span className="text-sm text-text-primary">{label}</span>
              </label>
            ))}
          </div>

          <button onClick={handleCreate} disabled={loading || !name.trim()} className="btn-primary text-xs px-4 py-2 w-full">
            {loading ? 'Creating...' : 'Create Backup'}
          </button>
        </div>

        <div className="card p-5 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
              <IconDownload className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-text-primary">Saved Backups</h3>
              <p className="text-xs text-text-secondary">{backups.length} backup{backups.length !== 1 ? 's' : ''}</p>
            </div>
            <div className="ml-auto flex gap-1">
              <button onClick={fetchBackups} className="btn-ghost p-1.5" title="Refresh">
                <IconRefresh className="w-4 h-4" />
              </button>
              <button onClick={handleFileImport} className="btn-ghost p-1.5" title="Import backup file">
                <IconUpload className="w-4 h-4" />
              </button>
            </div>
          </div>

          {backups.length === 0 ? (
            <p className="text-xs text-text-muted text-center py-6">No backups yet. Create one to get started.</p>
          ) : (
            <div className="space-y-2 max-h-80 overflow-y-auto">
              {backups.map((b) => (
                <div
                  key={b.id}
                  className={`px-3 py-2 rounded-lg border cursor-pointer transition-colors ${
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
                      <p className="text-sm font-medium text-text-primary">{b.name}</p>
                      <p className="text-xs text-text-secondary">{formatDate(b.created_at)} &middot; {formatBytes(b.file_size_bytes)}</p>
                    </div>
                    <button
                      onClick={(e) => { e.stopPropagation(); deleteBackup(b.id); }}
                      className="btn-ghost p-1 text-text-muted hover:text-red-400"
                      title="Delete"
                    >
                      <IconTrash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <div className="flex gap-2 mt-1">
                    <span className="badge-ghost text-xs">{b.profile_count} profiles</span>
                    <span className="badge-ghost text-xs">{b.rule_count} rules</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {selectedId && (
            <div className="space-y-2 pt-2 border-t border-gpu-700">
              <p className="text-xs font-medium text-text-secondary">Restore scope</p>
              {(['profiles', 'automation_rules', 'integrations', 'enterprise'] as const).map((key) => (
                <label key={key} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={restoreScope[key]}
                    onChange={() => setRestoreScope((s) => ({ ...s, [key]: !s[key] }))}
                    className="rounded border-gpu-600 bg-gpu-800 accent-accent-primary"
                  />
                  <span className="text-sm text-text-primary">{key.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())}</span>
                </label>
              ))}
              <button onClick={handleRestore} disabled={loading} className="btn-primary text-xs px-4 py-2 w-full">
                {loading ? 'Restoring...' : 'Restore Selected Backup'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
