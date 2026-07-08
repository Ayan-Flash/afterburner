import { useEffect, useState } from 'react';
import { useSyncStore } from '../stores/syncStore';
import { IconRefresh, IconGlobe, IconCheck } from '../components/base/Icons';

function formatDate(ts: number | null) {
  if (!ts) return 'Never';
  return new Date(ts * 1000).toLocaleString();
}

export function SyncPage() {
  const { status, lastResult, loading, error, fetchStatus, register, unregister, sync, start, stop, updateSettings, clearError } = useSyncStore();

  const [serverUrl, setServerUrl] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [interval, setInterval] = useState(300);
  const [syncProfiles, setSyncProfiles] = useState(true);
  const [syncReports, setSyncReports] = useState(false);
  const [syncPolicies, setSyncPolicies] = useState(true);
  const [serverRunning, setServerRunning] = useState(false);

  useEffect(() => {
    fetchStatus();
  }, [fetchStatus]);

  useEffect(() => {
    if (status) {
      setServerUrl(status.server_url);
    }
  }, [status]);

  const handleRegister = () => {
    register(serverUrl, apiKey);
  };

  const handleUnregister = () => {
    unregister();
    setApiKey('');
  };

  const handleSaveSettings = () => {
    updateSettings(serverUrl, apiKey, interval, syncProfiles, syncReports, syncPolicies);
  };

  const toggleClient = () => {
    if (status?.device_registered) {
      stop();
    } else {
      start();
    }
  };

  return (
    <div className="space-y-6">
      <div className="section-header">
        <h2 className="text-lg font-semibold text-text-primary">Cloud Sync</h2>
        <p className="text-sm text-text-secondary mt-1">Synchronize profiles, reports, and settings with a cloud server</p>
      </div>

      {error && (
        <div className="px-4 py-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
          {error}
          <button onClick={clearError} className="float-right text-red-400/70 hover:text-red-400">&times;</button>
        </div>
      )}

      {lastResult && (
        <div className="px-4 py-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-sm">
          Sync complete: {lastResult.profiles_synced} profiles, {lastResult.reports_synced} reports
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card p-5 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-accent-primary/20 flex items-center justify-center">
              <IconGlobe className="w-5 h-5 text-accent-primary" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-text-primary">Cloud Server</h3>
              <p className="text-xs text-text-secondary">Connect to your sync server</p>
            </div>
          </div>

          <div className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-text-secondary mb-1">Server URL</label>
              <input
                type="text"
                value={serverUrl}
                onChange={(e) => setServerUrl(e.target.value)}
                placeholder="https://sync.example.com"
                className="w-full px-3 py-2 rounded-lg bg-gpu-800 border border-gpu-700 text-text-primary text-sm focus:outline-none focus:border-accent-primary"
              />
            </div>

            {!status?.device_registered && (
              <div>
                <label className="block text-xs font-medium text-text-secondary mb-1">API Key</label>
                <input
                  type="password"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-gpu-800 border border-gpu-700 text-text-primary text-sm focus:outline-none focus:border-accent-primary"
                />
              </div>
            )}

            <div className="flex gap-2">
              {!status?.device_registered ? (
                <button onClick={handleRegister} className="btn-primary text-xs px-4 py-2">
                  Register Device
                </button>
              ) : (
                <button onClick={handleUnregister} className="btn-danger text-xs px-4 py-2">
                  Unregister
                </button>
              )}
              <button onClick={handleSaveSettings} className="btn-secondary text-xs px-4 py-2">
                Save Settings
              </button>
            </div>

            {status?.device_registered && (
              <div className="px-3 py-2 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center gap-2">
                <IconCheck className="w-3.5 h-3.5" />
                Device registered
              </div>
            )}
          </div>
        </div>

        <div className="card p-5 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
              <IconRefresh className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-text-primary">Sync Status</h3>
              <p className="text-xs text-text-secondary">Last sync: {formatDate(status?.last_sync_at ?? null)}</p>
            </div>
          </div>

          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="px-3 py-2 rounded-lg bg-gpu-800">
                <p className="text-xs text-text-secondary">Server</p>
                <p className="text-sm text-text-primary font-mono truncate">
                  {status?.server_url || 'Not configured'}
                </p>
              </div>
              <div className="px-3 py-2 rounded-lg bg-gpu-800">
                <p className="text-xs text-text-secondary">Registered</p>
                <p className="text-sm text-text-primary">{status?.device_registered ? 'Yes' : 'No'}</p>
              </div>
            </div>

            <div className="flex gap-2">
              <button onClick={sync} disabled={loading || !status?.device_registered} className="btn-primary text-xs px-4 py-2">
                {loading ? 'Syncing...' : 'Sync Now'}
              </button>
              <button onClick={toggleClient} className={`btn-${status?.device_registered ? 'danger' : 'primary'} text-xs px-4 py-2`}>
                {status?.device_registered ? 'Stop Sync Client' : 'Start Sync Client'}
              </button>
            </div>

            <div className="space-y-2">
              <p className="text-xs font-medium text-text-secondary">Sync Settings</p>
              <div>
                <label className="block text-xs font-medium text-text-secondary mb-1">Sync Interval</label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={interval}
                    onChange={(e) => setInterval(Number(e.target.value))}
                    min={30}
                    className="w-24 px-3 py-1.5 rounded-lg bg-gpu-800 border border-gpu-700 text-text-primary text-sm focus:outline-none focus:border-accent-primary"
                  />
                  <span className="text-xs text-text-secondary">seconds</span>
                </div>
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={syncProfiles} onChange={(e) => setSyncProfiles(e.target.checked)} className="rounded border-gpu-600 bg-gpu-800 accent-accent-primary" />
                <span className="text-sm text-text-primary">Sync profiles</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={syncReports} onChange={(e) => setSyncReports(e.target.checked)} className="rounded border-gpu-600 bg-gpu-800 accent-accent-primary" />
                <span className="text-sm text-text-primary">Sync reports</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={syncPolicies} onChange={(e) => setSyncPolicies(e.target.checked)} className="rounded border-gpu-600 bg-gpu-800 accent-accent-primary" />
                <span className="text-sm text-text-primary">Sync policies</span>
              </label>
            </div>
          </div>
        </div>
      </div>

      <div className="card p-5">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-text-primary">Local Sync Server</h3>
          <button
            onClick={async () => {
              const { isSyncServerRunning, startSyncServer, stopSyncServer } = await import('../services/syncService');
              const running = await isSyncServerRunning();
              if (running) {
                await stopSyncServer();
                setServerRunning(false);
              } else {
                await startSyncServer();
                setServerRunning(true);
              }
            }}
            className={`btn-${serverRunning ? 'danger' : 'primary'} text-xs px-3 py-1.5`}
          >
            {serverRunning ? 'Stop Server' : 'Start Server'}
          </button>
        </div>
        <p className="text-xs text-text-secondary mb-2">
          Run a local sync server to receive sync requests from other GPUControl Pro instances.
          Other instances can sync to <code className="text-accent-primary">http://localhost:9878/api/sync</code>
        </p>
        {serverRunning && (
          <div className="px-3 py-2 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs">
            Sync server running on port 9878
          </div>
        )}
      </div>
    </div>
  );
}
