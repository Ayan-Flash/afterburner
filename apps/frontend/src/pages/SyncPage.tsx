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
        <h2 className="text-text-primary text-lg font-semibold">Cloud Sync</h2>
        <p className="text-text-secondary mt-1 text-sm">Synchronize profiles, reports, and settings with a cloud server</p>
      </div>

      {error && (
        <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
          {error}
          <button onClick={clearError} className="float-right text-red-400/70 hover:text-red-400">&times;</button>
        </div>
      )}

      {lastResult && (
        <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-400">
          Sync complete: {lastResult.profiles_synced} profiles, {lastResult.reports_synced} reports
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="card space-y-4 p-5">
          <div className="flex items-center gap-3">
            <div className="bg-accent-primary/20 flex size-10 items-center justify-center rounded-lg">
              <IconGlobe className="text-accent-primary size-5" />
            </div>
            <div>
              <h3 className="text-text-primary text-sm font-semibold">Cloud Server</h3>
              <p className="text-text-secondary text-xs">Connect to your sync server</p>
            </div>
          </div>

          <div className="space-y-3">
            <div>
              <label className="text-text-secondary mb-1 block text-xs font-medium">Server URL</label>
              <input
                type="text"
                value={serverUrl}
                onChange={(e) => setServerUrl(e.target.value)}
                placeholder="https://sync.example.com"
                className="bg-gpu-800 border-gpu-700 text-text-primary focus:border-accent-primary w-full rounded-lg border px-3 py-2 text-sm focus:outline-none"
              />
            </div>

            {!status?.device_registered && (
              <div>
                <label className="text-text-secondary mb-1 block text-xs font-medium">API Key</label>
                <input
                  type="password"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  className="bg-gpu-800 border-gpu-700 text-text-primary focus:border-accent-primary w-full rounded-lg border px-3 py-2 text-sm focus:outline-none"
                />
              </div>
            )}

            <div className="flex gap-2">
              {!status?.device_registered ? (
                <button onClick={handleRegister} className="btn-primary px-4 py-2 text-xs">
                  Register Device
                </button>
              ) : (
                <button onClick={handleUnregister} className="btn-danger px-4 py-2 text-xs">
                  Unregister
                </button>
              )}
              <button onClick={handleSaveSettings} className="btn-secondary px-4 py-2 text-xs">
                Save Settings
              </button>
            </div>

            {status?.device_registered && (
              <div className="flex items-center gap-2 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-xs text-emerald-400">
                <IconCheck className="size-3.5" />
                Device registered
              </div>
            )}
          </div>
        </div>

        <div className="card space-y-4 p-5">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-lg bg-blue-500/20">
              <IconRefresh className="size-5 text-blue-400" />
            </div>
            <div>
              <h3 className="text-text-primary text-sm font-semibold">Sync Status</h3>
              <p className="text-text-secondary text-xs">Last sync: {formatDate(status?.last_sync_at ?? null)}</p>
            </div>
          </div>

          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-gpu-800 rounded-lg px-3 py-2">
                <p className="text-text-secondary text-xs">Server</p>
                <p className="text-text-primary truncate font-mono text-sm">
                  {status?.server_url || 'Not configured'}
                </p>
              </div>
              <div className="bg-gpu-800 rounded-lg px-3 py-2">
                <p className="text-text-secondary text-xs">Registered</p>
                <p className="text-text-primary text-sm">{status?.device_registered ? 'Yes' : 'No'}</p>
              </div>
            </div>

            <div className="flex gap-2">
              <button onClick={sync} disabled={loading || !status?.device_registered} className="btn-primary px-4 py-2 text-xs">
                {loading ? 'Syncing...' : 'Sync Now'}
              </button>
              <button onClick={toggleClient} className={`btn-${status?.device_registered ? 'danger' : 'primary'} px-4 py-2 text-xs`}>
                {status?.device_registered ? 'Stop Sync Client' : 'Start Sync Client'}
              </button>
            </div>

            <div className="space-y-2">
              <p className="text-text-secondary text-xs font-medium">Sync Settings</p>
              <div>
                <label className="text-text-secondary mb-1 block text-xs font-medium">Sync Interval</label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={interval}
                    onChange={(e) => setInterval(Number(e.target.value))}
                    min={30}
                    className="bg-gpu-800 border-gpu-700 text-text-primary focus:border-accent-primary w-24 rounded-lg border px-3 py-1.5 text-sm focus:outline-none"
                  />
                  <span className="text-text-secondary text-xs">seconds</span>
                </div>
              </div>
              <label className="flex cursor-pointer items-center gap-2">
                <input type="checkbox" checked={syncProfiles} onChange={(e) => setSyncProfiles(e.target.checked)} className="border-gpu-600 bg-gpu-800 accent-accent-primary rounded" />
                <span className="text-text-primary text-sm">Sync profiles</span>
              </label>
              <label className="flex cursor-pointer items-center gap-2">
                <input type="checkbox" checked={syncReports} onChange={(e) => setSyncReports(e.target.checked)} className="border-gpu-600 bg-gpu-800 accent-accent-primary rounded" />
                <span className="text-text-primary text-sm">Sync reports</span>
              </label>
              <label className="flex cursor-pointer items-center gap-2">
                <input type="checkbox" checked={syncPolicies} onChange={(e) => setSyncPolicies(e.target.checked)} className="border-gpu-600 bg-gpu-800 accent-accent-primary rounded" />
                <span className="text-text-primary text-sm">Sync policies</span>
              </label>
            </div>
          </div>
        </div>
      </div>

      <div className="card p-5">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-text-primary text-sm font-semibold">Local Sync Server</h3>
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
            className={`btn-${serverRunning ? 'danger' : 'primary'} px-3 py-1.5 text-xs`}
          >
            {serverRunning ? 'Stop Server' : 'Start Server'}
          </button>
        </div>
        <p className="text-text-secondary mb-2 text-xs">
          Run a local sync server to receive sync requests from other GPUControl Pro instances.
          Other instances can sync to <code className="text-accent-primary">http://localhost:9878/api/sync</code>
        </p>
        {serverRunning && (
          <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-xs text-emerald-400">
            Sync server running on port 9878
          </div>
        )}
      </div>
    </div>
  );
}
