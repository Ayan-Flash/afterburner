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
    <div className="ac-page ac-page--wide">
      <div className="ac-page-header">
        <div className="ac-page-header__left">
          <span className="ac-page-header__title">Backup &amp; Restore</span>
          <span className="ac-page-header__desc">Create full system backups and restore your configuration</span>
        </div>
      </div>

      {error && (
        <div className="ac-banner ac-banner--error">
          <span>{error}</span>
          <button onClick={clearError} className="ac-banner__close">&times;</button>
        </div>
      )}

      {lastResult && (
        <div className="ac-banner ac-banner--success">
          <IconCheck size={16} />
          <span>Backup created: {lastResult.metadata.name} ({formatBytes(lastResult.metadata.file_size_bytes)})</span>
        </div>
      )}

      {lastRestore && (
        <div className={`ac-banner ${lastRestore.success ? 'ac-banner--success' : 'ac-banner--warning'}`}>
          <span>{lastRestore.success
            ? `Restore complete: ${lastRestore.restored_profiles} profiles, ${lastRestore.restored_rules} rules`
            : `Restore completed with ${lastRestore.errors.length} errors`}</span>
        </div>
      )}

      <div className="ac-grid-2">
        <div className="ac-page-card">
          <div className="ac-page-card__header">
            <span className="ac-page-card__title">
              <IconSave className="ac-page-card__title-icon" />
              Create Backup
            </span>
          </div>
          <div className="ac-page-card__body" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <span style={{ fontSize: 12, color: 'var(--ac-text-secondary)' }}>Save your current configuration</span>

            <div>
              <label className="ac-label">Backup Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Before OC Tuning"
                className="ac-input ac-input--wide"
              />
            </div>

            <span className="ac-subtitle">Include</span>
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
              <label key={key} className="ac-checkbox" onClick={() => toggleScope(key)}>
                <div className={`ac-checkbox__box ${scope[key] ? 'ac-checkbox__box--checked' : ''}`} />
                <span className="ac-checkbox__label">{label}</span>
              </label>
            ))}

            <button onClick={handleCreate} disabled={loading || !name.trim()} className="ac-btn ac-btn--primary" style={{ width: '100%' }}>
              {loading ? 'Creating...' : 'Create Backup'}
            </button>
          </div>
        </div>

        <div className="ac-page-card">
          <div className="ac-page-card__header">
            <span className="ac-page-card__title">
              <IconDownload className="ac-page-card__title-icon" />
              Saved Backups
            </span>
            <div className="ac-page-card__actions">
              <button onClick={fetchBackups} className="ac-btn ac-btn--ghost ac-btn--icon" title="Refresh">
                <IconRefresh />
              </button>
              <button onClick={handleFileImport} className="ac-btn ac-btn--ghost ac-btn--icon" title="Import backup file">
                <IconUpload />
              </button>
            </div>
          </div>
          <div className="ac-page-card__body" style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {backups.length === 0 ? (
              <div className="ac-empty">
                <svg className="ac-empty__icon" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/>
                </svg>
                <span className="ac-empty__text">No backups yet. Create one to get started.</span>
              </div>
            ) : (
              <div style={{ maxHeight: 320, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 6 }}>
                {backups.map((b) => (
                  <div
                    key={b.id}
                    style={{
                      cursor: 'pointer',
                      borderRadius: 'var(--ac-radius-panel)',
                      border: '1px solid',
                      padding: '10px 12px',
                      transition: 'all 0.15s',
                      background: selectedId === b.id ? 'var(--ac-bg-panel-header)' : 'var(--ac-bg-input)',
                      borderColor: selectedId === b.id ? 'var(--ac-accent-cyan)' : 'var(--ac-border-subtle)',
                    }}
                    onClick={() => {
                      setSelectedId(b.id);
                      setRestoreScope(b.scope);
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div>
                        <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--ac-text-primary)' }}>{b.name}</span>
                        <div style={{ fontSize: 10, color: 'var(--ac-text-muted)', marginTop: 2 }}>
                          {formatDate(b.created_at)} &middot; {formatBytes(b.file_size_bytes)}
                        </div>
                      </div>
                      <button
                        onClick={(e) => { e.stopPropagation(); deleteBackup(b.id); }}
                        className="ac-btn ac-btn--ghost ac-btn--sm ac-btn--icon"
                        style={{ color: '#f55' }}
                        title="Delete"
                      >
                        <IconTrash2 />
                      </button>
                    </div>
                    <div style={{ display: 'flex', gap: 6, marginTop: 6 }}>
                      <span className="ac-badge ac-badge--blue">{b.profile_count} profiles</span>
                      <span className="ac-badge ac-badge--blue">{b.rule_count} rules</span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {selectedId && (
              <>
                <div className="ac-divider" />
                <span className="ac-subtitle">Restore scope</span>
                {(['profiles', 'automation_rules', 'integrations', 'enterprise'] as const).map((key) => (
                  <label key={key} className="ac-checkbox" onClick={() => setRestoreScope((s) => ({ ...s, [key]: !s[key] }))}>
                    <div className={`ac-checkbox__box ${restoreScope[key] ? 'ac-checkbox__box--checked' : ''}`} />
                    <span className="ac-checkbox__label">{key.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())}</span>
                  </label>
                ))}
                <button onClick={handleRestore} disabled={loading} className="ac-btn ac-btn--primary" style={{ width: '100%' }}>
                  {loading ? 'Restoring...' : 'Restore Selected Backup'}
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
