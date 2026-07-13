import { useState, useEffect } from 'react';
import { useMonitoringStore, useUiStore, useUpdateStore } from '../stores';
import { monitoringService, appService } from '../services';

export function SettingsPage() {
  const { sampleRate, setSampleRate, isRunning, setRunning } = useMonitoringStore();
  const { theme, persistTheme } = useUiStore();
  const {
    status, autoCheck, checkIntervalHours, checking, error: updateError,
    checkUpdate, startUpdate, setAutoCheck, setCheckInterval,
  } = useUpdateStore();
  const [csvExporting, setCsvExporting] = useState(false);
  const [appInfo, setAppInfo] = useState<{ name: string; version: string; platform: string } | null>(null);
  const [installing, setInstalling] = useState(false);

  useEffect(() => {
    appService.getInfo().then(setAppInfo).catch(() => {});
  }, []);

  const handleStartMonitoring = async () => {
    try { await monitoringService.start(); setRunning(true); } catch { /* ignore */ }
  };

  const handleStopMonitoring = async () => {
    try { await monitoringService.stop(); setRunning(false); } catch { /* ignore */ }
  };

  const handleExportCsv = async () => {
    setCsvExporting(true);
    try {
      const csv = await monitoringService.exportCsv('gpu-sim-0', 120);
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'gpu-data.csv';
      a.click();
      URL.revokeObjectURL(url);
    } catch { /* ignore */ } finally { setCsvExporting(false); }
  };

  const handleCheckUpdate = async () => { await checkUpdate(); };

  const handleInstallUpdate = async () => {
    setInstalling(true);
    try { await startUpdate(); } catch { /* ignore */ } finally { setInstalling(false); }
  };

  const statusLabel = () => {
    switch (status.type) {
      case 'Idle': return null;
      case 'Checking': return { text: 'Checking for updates...', color: 'ac-badge--yellow' };
      case 'Available': return { text: `Update ${status.info.version} available`, color: 'ac-badge--green' };
      case 'Downloading': return { text: `Downloading... ${status.progress}%`, color: 'ac-badge--blue' };
      case 'Downloaded': return { text: `Update ${status.info.version} ready`, color: 'ac-badge--green' };
      case 'Installing': return { text: 'Installing update...', color: 'ac-badge--yellow' };
      case 'Error': return { text: `Error: ${status.error}`, color: 'ac-badge--red' };
      case 'UpToDate': return { text: 'Up to date', color: 'ac-badge--green' };
    }
  };

  const statusInfo = statusLabel();
  const isUpdateAvailable = status.type === 'Available' || status.type === 'Downloaded';

  return (
    <div className="ac-page ac-page--compact">
      <div className="ac-page-header">
        <div className="ac-page-header__left">
          <span className="ac-page-header__title">Settings</span>
          <span className="ac-page-header__desc">Monitoring, updates, and appearance preferences</span>
        </div>
      </div>

      {/* Monitoring */}
      <div className="ac-page-card">
        <div className="ac-page-card__header">
          <span className="ac-page-card__title">
            <svg className="ac-page-card__title-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
            </svg>
            Monitoring
          </span>
        </div>
        <div className="ac-page-card__body" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div className="ac-row">
            <span className="ac-row__label">Status</span>
            <div className="ac-row__value" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span className={`ac-status-dot ${isRunning ? 'ac-status-dot--on' : 'ac-status-dot--off'}`} />
              {isRunning ? 'Running' : 'Stopped'}
            </div>
          </div>

          <div className="ac-row">
            <span className="ac-row__label">Sample Rate</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <input type="number" min={100} max={5000} step={100} value={sampleRate}
                onChange={(e) => setSampleRate(Number(e.target.value))}
                className="ac-input ac-input--sm" style={{ width: 80 }} />
              <span style={{ color: 'var(--ac-text-muted)', fontSize: 11 }}>ms</span>
            </div>
          </div>

          <div className="ac-divider" />

          <div style={{ display: 'flex', gap: 8 }}>
            {isRunning ? (
              <button onClick={handleStopMonitoring} className="ac-btn ac-btn--danger ac-btn--sm" style={{ flex: 1 }}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="6" width="12" height="12" rx="1"/></svg>
                Stop
              </button>
            ) : (
              <button onClick={handleStartMonitoring} className="ac-btn ac-btn--primary ac-btn--sm" style={{ flex: 1 }}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><polygon points="6,3 20,12 6,21"/></svg>
                Start
              </button>
            )}
            <button onClick={handleExportCsv} disabled={csvExporting}
              className="ac-btn ac-btn--secondary ac-btn--sm" style={{ flex: 1 }}>
              {csvExporting ? 'Exporting...' : 'Export CSV'}
            </button>
          </div>
        </div>
      </div>

      {/* Updates */}
      <div className="ac-page-card">
        <div className="ac-page-card__header">
          <span className="ac-page-card__title">
            <svg className="ac-page-card__title-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M23 4v6h-6"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>
            </svg>
            Updates
          </span>
        </div>
        <div className="ac-page-card__body" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div className="ac-row">
            <span className="ac-row__label">Current Version</span>
            <span className="ac-metric" style={{ fontSize: 12 }}>{appInfo?.version ?? '-'}</span>
          </div>

          {statusInfo && (
            <div className="ac-row">
              <span className="ac-row__label">Status</span>
              <span className={`ac-badge ${statusInfo.color}`}>{statusInfo.text}</span>
            </div>
          )}

          {updateError && (
            <div className="ac-banner ac-banner--error">{updateError}</div>
          )}

          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={handleCheckUpdate} disabled={checking || status.type === 'Checking'}
              className="ac-btn ac-btn--primary ac-btn--sm" style={{ flex: 1 }}>
              {checking || status.type === 'Checking' ? 'Checking...' : 'Check for Updates'}
            </button>
            {isUpdateAvailable && (
              <button onClick={handleInstallUpdate} disabled={installing}
                className="ac-btn ac-btn--success ac-btn--sm" style={{ flex: 1 }}>
                {installing ? 'Installing...' : 'Install Update'}
              </button>
            )}
          </div>

          <div className="ac-divider" />

          <div className="ac-row">
            <span className="ac-row__label">Auto-check</span>
            <label className="ac-toggle" onClick={() => setAutoCheck(!autoCheck)}>
              <span className={`ac-toggle__track ${autoCheck ? 'ac-toggle__track--on' : ''}`}>
                <span className="ac-toggle__thumb" />
              </span>
            </label>
          </div>

          <div className="ac-row">
            <span className="ac-row__label">Check Interval</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <input type="number" min={1} max={168} value={checkIntervalHours}
                onChange={(e) => setCheckInterval(Number(e.target.value))}
                className="ac-input ac-input--sm" style={{ width: 60 }} />
              <span style={{ color: 'var(--ac-text-muted)', fontSize: 11 }}>hours</span>
            </div>
          </div>
        </div>
      </div>

      {/* Appearance */}
      <div className="ac-page-card">
        <div className="ac-page-card__header">
          <span className="ac-page-card__title">
            <svg className="ac-page-card__title-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/>
            </svg>
            Appearance
          </span>
        </div>
        <div className="ac-page-card__body" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div className="ac-row">
            <span className="ac-row__label">Theme</span>
            <select value={theme} onChange={(e) => persistTheme(e.target.value as 'dark' | 'light' | 'system')}
              className="ac-input ac-select" style={{ width: 120, fontSize: 12 }}>
              <option value="dark">Dark</option>
              <option value="light">Light</option>
              <option value="system">System</option>
            </select>
          </div>
        </div>
      </div>

      {/* About */}
      <div className="ac-page-card">
        <div className="ac-page-card__header">
          <span className="ac-page-card__title">
            <svg className="ac-page-card__title-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/>
            </svg>
            About
          </span>
        </div>
        <div className="ac-page-card__body" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div className="ac-row">
            <span className="ac-row__label">Version</span>
            <span className="ac-metric" style={{ fontSize: 12 }}>{appInfo?.version ?? '0.2.0'}</span>
          </div>
          <div className="ac-divider" />
          <div className="ac-row">
            <span className="ac-row__label">Platform</span>
            <span className="ac-metric" style={{ fontSize: 12 }}>{appInfo?.platform ?? 'Windows'}</span>
          </div>
          <div className="ac-divider" />
          <div className="ac-row">
            <span className="ac-row__label">Engine</span>
            <span className="ac-metric" style={{ fontSize: 12 }}>Rust + Tauri v2</span>
          </div>
        </div>
      </div>
    </div>
  );
}
