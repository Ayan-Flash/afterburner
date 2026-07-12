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

  const handleCheckUpdate = async () => {
    await checkUpdate();
  };

  const handleInstallUpdate = async () => {
    setInstalling(true);
    try {
      await startUpdate();
    } catch { /* ignore */ } finally { setInstalling(false); }
  };

  const statusLabel = () => {
    switch (status.type) {
      case 'Idle': return null;
      case 'Checking': return { text: 'Checking for updates...', color: 'text-yellow-400' };
      case 'Available': return { text: `Update ${status.info.version} available`, color: 'text-emerald-400' };
      case 'Downloading': return { text: `Downloading... ${status.progress}%`, color: 'text-blue-400' };
      case 'Downloaded': return { text: `Update ${status.info.version} ready`, color: 'text-emerald-400' };
      case 'Installing': return { text: 'Installing update...', color: 'text-yellow-400' };
      case 'Error': return { text: `Error: ${status.error}`, color: 'text-red-400' };
      case 'UpToDate': return { text: 'Up to date', color: 'text-emerald-400' };
    }
  };

  const statusInfo = statusLabel();
  const isUpdateAvailable = status.type === 'Available' || status.type === 'Downloaded';

  return (
    <div className="flex max-w-xl flex-col gap-5">
      <div className="card flex flex-col gap-4 p-5">
        <span className="text-text-primary text-sm font-semibold">Monitoring</span>

        <div className="flex items-center justify-between">
          <span className="text-text-secondary text-xs">Status</span>
          <div className="flex items-center gap-2">
            <span className={`size-2 rounded-full ${isRunning ? 'bg-emerald-500 shadow-[0_0_6px_rgba(52,211,153,0.5)]' : 'bg-text-dim'}`} />
            <span className="text-text-secondary text-xs font-medium">{isRunning ? 'Running' : 'Stopped'}</span>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-text-secondary text-xs">Sample Rate</span>
          <div className="flex items-center gap-2">
            <input type="number" min={100} max={5000} step={100} value={sampleRate}
              onChange={(e) => setSampleRate(Number(e.target.value))}
              className="input w-20 text-xs" />
            <span className="text-text-muted text-xs">ms</span>
          </div>
        </div>

        <div className="flex gap-2">
          {isRunning ? (
            <button onClick={handleStopMonitoring} className="btn-danger flex-1 text-xs">Stop</button>
          ) : (
            <button onClick={handleStartMonitoring} className="btn-primary flex-1 text-xs">Start</button>
          )}
          <button onClick={handleExportCsv} disabled={csvExporting}
            className="btn-secondary text-xs disabled:opacity-50">
            {csvExporting ? 'Exporting...' : 'Export CSV'}
          </button>
        </div>
      </div>

      <div className="card flex flex-col gap-4 p-5">
        <span className="text-text-primary text-sm font-semibold">Updates</span>

        <div className="flex items-center justify-between">
          <span className="text-text-secondary text-xs">Current Version</span>
          <span className="text-text-primary font-mono text-xs">{appInfo?.version ?? '-'}</span>
        </div>

        {statusInfo && (
          <div className="flex items-center justify-between">
            <span className="text-text-secondary text-xs">Status</span>
            <span className={`font-mono text-xs ${statusInfo.color}`}>{statusInfo.text}</span>
          </div>
        )}

        {updateError && (
          <div className="rounded border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs text-red-400">
            {updateError}
          </div>
        )}

        <div className="flex gap-2">
          <button onClick={handleCheckUpdate} disabled={checking || status.type === 'Checking'}
            className="btn-primary flex-1 text-xs disabled:opacity-50">
            {checking || status.type === 'Checking' ? 'Checking...' : 'Check for Updates'}
          </button>
          {isUpdateAvailable && (
            <button onClick={handleInstallUpdate} disabled={installing}
              className="btn-success flex-1 text-xs disabled:opacity-50">
              {installing ? 'Installing...' : 'Install Update'}
            </button>
          )}
        </div>

        <div className="flex items-center justify-between">
          <span className="text-text-secondary text-xs">Auto-check</span>
          <label className="relative inline-flex cursor-pointer items-center">
            <input type="checkbox" checked={autoCheck}
              onChange={(e) => setAutoCheck(e.target.checked)}
              className="peer sr-only" />
            <div className="h-5 w-9 rounded-full bg-gray-600 after:absolute after:start-[2px] after:top-[2px] after:h-4 after:w-4 after:rounded-full after:bg-white after:transition-all peer-checked:bg-indigo-600 peer-checked:after:translate-x-full" />
          </label>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-text-secondary text-xs">Check Interval</span>
          <div className="flex items-center gap-2">
            <input type="number" min={1} max={168} value={checkIntervalHours}
              onChange={(e) => setCheckInterval(Number(e.target.value))}
              className="input w-16 text-xs" />
            <span className="text-text-muted text-xs">hours</span>
          </div>
        </div>
      </div>

      <div className="card flex flex-col gap-4 p-5">
        <span className="text-text-primary text-sm font-semibold">Appearance</span>

        <div className="flex items-center justify-between">
          <span className="text-text-secondary text-xs">Theme</span>
          <select value={theme} onChange={(e) => persistTheme(e.target.value as 'dark' | 'light' | 'system')}
            className="input w-28 text-xs">
            <option value="dark">Dark</option>
            <option value="light">Light</option>
            <option value="system">System</option>
          </select>
        </div>
      </div>

      <div className="card flex flex-col gap-4 p-5">
        <span className="text-text-primary text-sm font-semibold">About</span>
        <div className="flex items-center justify-between text-xs">
          <span className="text-text-muted">Version</span>
          <span className="text-text-primary font-mono">{appInfo?.version ?? '0.2.0'}</span>
        </div>
        <div className="flex items-center justify-between text-xs">
          <span className="text-text-muted">Platform</span>
          <span className="text-text-primary font-mono">{appInfo?.platform ?? 'Windows'}</span>
        </div>
        <div className="flex items-center justify-between text-xs">
          <span className="text-text-muted">Engine</span>
          <span className="text-text-primary font-mono">Rust + Tauri v2</span>
        </div>
      </div>
    </div>
  );
}
