import { useEffect, useState } from 'react';
import { useIntegrationStore } from '../stores/integrationStore';
import { IconZap, IconBell, IconMonitor } from '../components/base/Icons';

export function IntegrationsPage() {
  const { config, loading, testResult, testError, obsRunning, fetchConfig, saveConfig, testWebhook, sendReport, startObs, stopObs } = useIntegrationStore();

  const [webhookUrl, setWebhookUrl] = useState('');
  const [username, setUsername] = useState('GPUControl Pro');
  const [notifyAlert, setNotifyAlert] = useState(true);
  const [notifyHighTemp, setNotifyHighTemp] = useState(true);
  const [highTempThreshold, setHighTempThreshold] = useState(80);
  const [obsPort, setObsPort] = useState(9877);
  const [obsRefreshRate, setObsRefreshRate] = useState(1000);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchConfig();
  }, [fetchConfig]);

  useEffect(() => {
    if (config) {
      setWebhookUrl(config.discord_webhook_url);
      setUsername(config.discord_username);
      setNotifyAlert(config.discord_notify_on_alert);
      setNotifyHighTemp(config.discord_notify_on_high_temp);
      setHighTempThreshold(config.discord_high_temp_threshold);
      setObsPort(config.obs_port);
      setObsRefreshRate(config.obs_refresh_rate_ms);
    }
  }, [config]);

  const handleSave = async () => {
    setSaving(true);
    await saveConfig({
      discord_webhook_url: webhookUrl,
      discord_username: username,
      discord_avatar_url: '',
      discord_notify_on_alert: notifyAlert,
      discord_notify_on_high_temp: notifyHighTemp,
      discord_high_temp_threshold: highTempThreshold,
      obs_enabled: obsRunning,
      obs_port: obsPort,
      obs_refresh_rate_ms: obsRefreshRate,
    });
    setSaving(false);
  };

  const handleTestWebhook = () => {
    testWebhook(webhookUrl);
  };

  const handleSendReport = () => {
    sendReport(webhookUrl);
  };

  const handleToggleObs = () => {
    if (obsRunning) {
      stopObs();
    } else {
      startObs(obsPort);
    }
  };

  if (loading && !config) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="border-accent-primary size-8 animate-spin rounded-full border-b-2" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="section-header">
        <h2 className="text-text-primary text-lg font-semibold">Integrations</h2>
        <p className="text-text-secondary mt-1 text-sm">
          Connect GPUControl Pro to external services
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="card space-y-4 p-5">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-lg bg-[#5865F2]/20">
              <IconBell className="size-5 text-[#5865F2]" />
            </div>
            <div>
              <h3 className="text-text-primary text-sm font-semibold">Discord Webhook</h3>
              <p className="text-text-secondary text-xs">Send GPU alerts and reports to Discord</p>
            </div>
          </div>

          <div className="space-y-3">
            <div>
              <label className="text-text-secondary mb-1 block text-xs font-medium">Webhook URL</label>
              <input
                type="text"
                value={webhookUrl}
                onChange={(e) => setWebhookUrl(e.target.value)}
                placeholder="https://discord.com/api/webhooks/..."
                className="bg-gpu-800 border-gpu-700 text-text-primary placeholder:text-text-muted focus:border-accent-primary w-full rounded-lg border px-3 py-2 text-sm focus:outline-none"
              />
            </div>

            <div>
              <label className="text-text-secondary mb-1 block text-xs font-medium">Bot Username</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="bg-gpu-800 border-gpu-700 text-text-primary focus:border-accent-primary w-full rounded-lg border px-3 py-2 text-sm focus:outline-none"
              />
            </div>

            <div className="space-y-2">
              <label className="flex cursor-pointer items-center gap-2">
                <input
                  type="checkbox"
                  checked={notifyAlert}
                  onChange={(e) => setNotifyAlert(e.target.checked)}
                  className="border-gpu-600 bg-gpu-800 accent-accent-primary rounded"
                />
                <span className="text-text-primary text-sm">Notify on alerts</span>
              </label>

              <label className="flex cursor-pointer items-center gap-2">
                <input
                  type="checkbox"
                  checked={notifyHighTemp}
                  onChange={(e) => setNotifyHighTemp(e.target.checked)}
                  className="border-gpu-600 bg-gpu-800 accent-accent-primary rounded"
                />
                <span className="text-text-primary text-sm">Notify on high temperature</span>
              </label>

              {notifyHighTemp && (
                <div className="ml-6 flex items-center gap-2">
                  <span className="text-text-secondary text-xs">Threshold:</span>
                  <input
                    type="number"
                    value={highTempThreshold}
                    onChange={(e) => setHighTempThreshold(Number(e.target.value))}
                    className="bg-gpu-800 border-gpu-700 text-text-primary w-20 rounded border px-2 py-1 text-center text-sm"
                  />
                  <span className="text-text-secondary text-xs">°C</span>
                </div>
              )}
            </div>

            <div className="flex gap-2">
              <button onClick={handleTestWebhook} className="btn-secondary px-3 py-1.5 text-xs">
                Test Webhook
              </button>
              <button onClick={handleSendReport} className="btn-secondary px-3 py-1.5 text-xs">
                Send Test Report
              </button>
            </div>

            {testResult && (
              <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-xs text-emerald-400">
                {testResult}
              </div>
            )}
            {testError && (
              <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs text-red-400">
                {testError}
              </div>
            )}
          </div>
        </div>

        <div className="card space-y-4 p-5">
          <div className="flex items-center gap-3">
            <div className="bg-accent-primary/20 flex size-10 items-center justify-center rounded-lg">
              <IconMonitor className="text-accent-primary size-5" />
            </div>
            <div>
              <h3 className="text-text-primary text-sm font-semibold">OBS Browser Source</h3>
              <p className="text-text-secondary text-xs">Display GPU metrics in OBS Studio</p>
            </div>
          </div>

          <div className="space-y-3">
            <div>
              <label className="text-text-secondary mb-1 block text-xs font-medium">HTTP Port</label>
              <input
                type="number"
                value={obsPort}
                onChange={(e) => setObsPort(Number(e.target.value))}
                className="bg-gpu-800 border-gpu-700 text-text-primary focus:border-accent-primary w-24 rounded-lg border px-3 py-2 text-sm focus:outline-none"
              />
            </div>

            <div>
              <label className="text-text-secondary mb-1 block text-xs font-medium">Refresh Rate</label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  value={obsRefreshRate}
                  onChange={(e) => setObsRefreshRate(Number(e.target.value))}
                  className="bg-gpu-800 border-gpu-700 text-text-primary focus:border-accent-primary w-24 rounded-lg border px-3 py-2 text-sm focus:outline-none"
                />
                <span className="text-text-secondary text-xs">ms</span>
              </div>
            </div>

            <button
              onClick={handleToggleObs}
              className={`btn-${obsRunning ? 'danger' : 'primary'} px-4 py-2 text-xs`}
            >
              {obsRunning ? 'Stop OBS Source' : 'Start OBS Source'}
            </button>

            {obsRunning && (
              <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-xs text-emerald-400">
                OBS Browser Source running on port {obsPort}
                <br />
                Add a Browser Source in OBS pointing to:
                <span className="text-text-primary mt-1 block font-mono">
                  http://localhost:{obsPort}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="card space-y-3 p-5">
        <h3 className="text-text-primary text-sm font-semibold">Steam Integration</h3>
        <p className="text-text-secondary text-xs">
          Steam integration automatically detects games you launch through Steam and applies GPU profiles.
          Game detection is already active — configure per-game profiles in the Profiles section.
        </p>
        <div className="bg-gpu-800 text-text-secondary flex items-center gap-2 rounded-lg px-3 py-2 text-xs">
          <IconZap className="text-accent-primary size-4" />
          Steam game detection is always active
        </div>
      </div>

      <div className="card space-y-3 p-5">
        <h3 className="text-text-primary text-sm font-semibold">Custom REST API</h3>
        <p className="text-text-secondary text-xs">
          The Remote Monitoring server exposes a REST API for custom integrations.
          Enable it in the Remote section to query GPU metrics from your own applications.
        </p>
        <div className="bg-gpu-800 text-text-secondary flex items-center gap-2 rounded-lg px-3 py-2 text-xs">
          <IconZap className="text-accent-primary size-4" />
          Configure in Settings → Remote Monitoring
        </div>
      </div>

      <div className="flex justify-end">
        <button onClick={handleSave} disabled={saving} className="btn-primary px-6 py-2 text-sm">
          {saving ? 'Saving...' : 'Save Settings'}
        </button>
      </div>
    </div>
  );
}
