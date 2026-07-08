import { useState } from 'react';
import { useMonitoringStore, useUiStore } from '../stores';
import { monitoringService } from '../services';

export function SettingsPage() {
  const { sampleRate, setSampleRate, isRunning, setRunning } = useMonitoringStore();
  const { theme, setTheme } = useUiStore();
  const [csvExporting, setCsvExporting] = useState(false);

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

  return (
    <div className="flex flex-col gap-5 max-w-xl">
      <div className="card p-5 flex flex-col gap-4">
        <span className="text-sm font-semibold text-text-primary">Monitoring</span>

        <div className="flex items-center justify-between">
          <span className="text-xs text-text-secondary">Status</span>
          <div className="flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full ${isRunning ? 'bg-emerald-500 shadow-[0_0_6px_rgba(52,211,153,0.5)]' : 'bg-text-dim'}`} />
            <span className="text-xs font-medium text-text-secondary">{isRunning ? 'Running' : 'Stopped'}</span>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-xs text-text-secondary">Sample Rate</span>
          <div className="flex items-center gap-2">
            <input type="number" min={100} max={5000} step={100} value={sampleRate}
              onChange={(e) => setSampleRate(Number(e.target.value))}
              className="input w-20 text-xs" />
            <span className="text-xs text-text-muted">ms</span>
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

      <div className="card p-5 flex flex-col gap-4">
        <span className="text-sm font-semibold text-text-primary">Appearance</span>

        <div className="flex items-center justify-between">
          <span className="text-xs text-text-secondary">Theme</span>
          <select value={theme} onChange={(e) => setTheme(e.target.value as any)}
            className="input text-xs w-28">
            <option value="dark">Dark</option>
            <option value="light">Light</option>
            <option value="system">System</option>
          </select>
        </div>
      </div>

      <div className="card p-5 flex flex-col gap-4">
        <span className="text-sm font-semibold text-text-primary">About</span>
        <div className="flex items-center justify-between text-xs">
          <span className="text-text-muted">Version</span>
          <span className="text-text-primary font-mono">0.2.0</span>
        </div>
        <div className="flex items-center justify-between text-xs">
          <span className="text-text-muted">Platform</span>
          <span className="text-text-primary font-mono">Windows</span>
        </div>
        <div className="flex items-center justify-between text-xs">
          <span className="text-text-muted">Engine</span>
          <span className="text-text-primary font-mono">Rust + Tauri v2</span>
        </div>
      </div>
    </div>
  );
}
