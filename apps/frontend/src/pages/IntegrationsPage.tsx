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
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="section-header">
        <h2 className="text-lg font-semibold text-text-primary">Integrations</h2>
        <p className="text-sm text-text-secondary mt-1">
          Connect GPUControl Pro to external services
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card p-5 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-[#5865F2]/20 flex items-center justify-center">
              <IconBell className="w-5 h-5 text-[#5865F2]" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-text-primary">Discord Webhook</h3>
              <p className="text-xs text-text-secondary">Send GPU alerts and reports to Discord</p>
            </div>
          </div>

          <div className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-text-secondary mb-1">Webhook URL</label>
              <input
                type="text"
                value={webhookUrl}
                onChange={(e) => setWebhookUrl(e.target.value)}
                placeholder="https://discord.com/api/webhooks/..."
                className="w-full px-3 py-2 rounded-lg bg-gpu-800 border border-gpu-700 text-text-primary text-sm placeholder:text-text-muted focus:outline-none focus:border-accent-primary"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-text-secondary mb-1">Bot Username</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-gpu-800 border border-gpu-700 text-text-primary text-sm focus:outline-none focus:border-accent-primary"
              />
            </div>

            <div className="space-y-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={notifyAlert}
                  onChange={(e) => setNotifyAlert(e.target.checked)}
                  className="rounded border-gpu-600 bg-gpu-800 accent-accent-primary"
                />
                <span className="text-sm text-text-primary">Notify on alerts</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={notifyHighTemp}
                  onChange={(e) => setNotifyHighTemp(e.target.checked)}
                  className="rounded border-gpu-600 bg-gpu-800 accent-accent-primary"
                />
                <span className="text-sm text-text-primary">Notify on high temperature</span>
              </label>

              {notifyHighTemp && (
                <div className="flex items-center gap-2 ml-6">
                  <span className="text-xs text-text-secondary">Threshold:</span>
                  <input
                    type="number"
                    value={highTempThreshold}
                    onChange={(e) => setHighTempThreshold(Number(e.target.value))}
                    className="w-20 px-2 py-1 rounded bg-gpu-800 border border-gpu-700 text-text-primary text-sm text-center"
                  />
                  <span className="text-xs text-text-secondary">°C</span>
                </div>
              )}
            </div>

            <div className="flex gap-2">
              <button onClick={handleTestWebhook} className="btn-secondary text-xs px-3 py-1.5">
                Test Webhook
              </button>
              <button onClick={handleSendReport} className="btn-secondary text-xs px-3 py-1.5">
                Send Test Report
              </button>
            </div>

            {testResult && (
              <div className="px-3 py-2 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs">
                {testResult}
              </div>
            )}
            {testError && (
              <div className="px-3 py-2 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-xs">
                {testError}
              </div>
            )}
          </div>
        </div>

        <div className="card p-5 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-accent-primary/20 flex items-center justify-center">
              <IconMonitor className="w-5 h-5 text-accent-primary" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-text-primary">OBS Browser Source</h3>
              <p className="text-xs text-text-secondary">Display GPU metrics in OBS Studio</p>
            </div>
          </div>

          <div className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-text-secondary mb-1">HTTP Port</label>
              <input
                type="number"
                value={obsPort}
                onChange={(e) => setObsPort(Number(e.target.value))}
                className="w-24 px-3 py-2 rounded-lg bg-gpu-800 border border-gpu-700 text-text-primary text-sm focus:outline-none focus:border-accent-primary"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-text-secondary mb-1">Refresh Rate</label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  value={obsRefreshRate}
                  onChange={(e) => setObsRefreshRate(Number(e.target.value))}
                  className="w-24 px-3 py-2 rounded-lg bg-gpu-800 border border-gpu-700 text-text-primary text-sm focus:outline-none focus:border-accent-primary"
                />
                <span className="text-xs text-text-secondary">ms</span>
              </div>
            </div>

            <button
              onClick={handleToggleObs}
              className={`btn-${obsRunning ? 'danger' : 'primary'} text-xs px-4 py-2`}
            >
              {obsRunning ? 'Stop OBS Source' : 'Start OBS Source'}
            </button>

            {obsRunning && (
              <div className="px-3 py-2 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs">
                OBS Browser Source running on port {obsPort}
                <br />
                Add a Browser Source in OBS pointing to:
                <span className="text-text-primary font-mono block mt-1">
                  http://localhost:{obsPort}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="card p-5 space-y-3">
        <h3 className="text-sm font-semibold text-text-primary">Steam Integration</h3>
        <p className="text-xs text-text-secondary">
          Steam integration automatically detects games you launch through Steam and applies GPU profiles.
          Game detection is already active — configure per-game profiles in the Profiles section.
        </p>
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gpu-800 text-xs text-text-secondary">
          <IconZap className="w-4 h-4 text-accent-primary" />
          Steam game detection is always active
        </div>
      </div>

      <div className="card p-5 space-y-3">
        <h3 className="text-sm font-semibold text-text-primary">Custom REST API</h3>
        <p className="text-xs text-text-secondary">
          The Remote Monitoring server exposes a REST API for custom integrations.
          Enable it in the Remote section to query GPU metrics from your own applications.
        </p>
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gpu-800 text-xs text-text-secondary">
          <IconZap className="w-4 h-4 text-accent-primary" />
          Configure in Settings → Remote Monitoring
        </div>
      </div>

      <div className="flex justify-end">
        <button onClick={handleSave} disabled={saving} className="btn-primary text-sm px-6 py-2">
          {saving ? 'Saving...' : 'Save Settings'}
        </button>
      </div>
    </div>
  );
}
