import { useState } from 'react';
import { useMonitoringStore, useUiStore } from '../stores';
import { monitoringService } from '../services';

export function SettingsPage() {
  const { sampleRate, setSampleRate, isRunning, setRunning } = useMonitoringStore();
  const { theme, setTheme } = useUiStore();
  const [csvExporting, setCsvExporting] = useState(false);

  const handleStartMonitoring = async () => {
    try {
      await monitoringService.start();
      setRunning(true);
    } catch {
      // ignore
    }
  };

  const handleStopMonitoring = async () => {
    try {
      await monitoringService.stop();
      setRunning(false);
    } catch {
      // ignore
    }
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
    } catch {
      // ignore
    } finally {
      setCsvExporting(false);
    }
  };

  return (
    <div className="mx-auto flex max-w-xl flex-col gap-6">
      <div className="card flex flex-col gap-4">
        <h3 className="text-sm font-semibold text-surface-200">Monitoring</h3>

        <div className="flex items-center justify-between">
          <span className="text-sm text-surface-300">Status</span>
          <div className="flex items-center gap-2">
            <span className={`h-2 w-2 rounded-full ${isRunning ? 'bg-green-500' : 'bg-surface-500'}`} />
            <span className="text-sm text-surface-400">{isRunning ? 'Running' : 'Stopped'}</span>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sm text-surface-300">Sample Rate</span>
          <div className="flex items-center gap-2">
            <input
              type="number"
              min={100}
              max={5000}
              step={100}
              value={sampleRate}
              onChange={(e) => setSampleRate(Number(e.target.value))}
              className="input w-20 text-sm"
            />
            <span className="text-sm text-surface-400">ms</span>
          </div>
        </div>

        <div className="flex gap-2">
          {isRunning ? (
            <button onClick={handleStopMonitoring} className="btn-secondary flex-1 text-sm">
              Stop
            </button>
          ) : (
            <button onClick={handleStartMonitoring} className="btn-primary flex-1 text-sm">
              Start
            </button>
          )}
          <button
            onClick={handleExportCsv}
            disabled={csvExporting}
            className="btn-secondary text-sm disabled:opacity-50"
          >
            {csvExporting ? 'Exporting...' : 'Export CSV'}
          </button>
        </div>
      </div>

      <div className="card flex flex-col gap-4">
        <h3 className="text-sm font-semibold text-surface-200">Appearance</h3>

        <div className="flex items-center justify-between">
          <span className="text-sm text-surface-300">Theme</span>
          <select
            value={theme}
            onChange={(e) => setTheme(e.target.value as any)}
            className="input text-sm"
          >
            <option value="dark">Dark</option>
            <option value="light">Light</option>
            <option value="system">System</option>
          </select>
        </div>
      </div>

      <div className="card flex flex-col gap-4">
        <h3 className="text-sm font-semibold text-surface-200">About</h3>
        <div className="flex items-center justify-between text-sm">
          <span className="text-surface-400">Version</span>
          <span className="text-surface-200">0.2.0</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-surface-400">Platform</span>
          <span className="text-surface-200">Windows</span>
        </div>
      </div>
    </div>
  );
}
