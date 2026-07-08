import { useEffect, useState } from 'react';
import { useRemoteStore } from '../stores';

export function RemotePage() {
  const { running, url, port, apiKey, loading, error, setPort, start, stop, fetchStatus, generateKey } = useRemoteStore();
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetchStatus();
  }, []);

  const handleCopyUrl = async () => {
    if (url) {
      try {
        await navigator.clipboard.writeText(url);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch {
        // clipboard not available
      }
    }
  };

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6">
      <div className="card flex flex-col gap-4">
        <h3 className="text-sm font-semibold text-surface-200">Remote Monitoring Server</h3>
        <p className="text-xs text-surface-400">
          Start an HTTP server to monitor GPUs from any device on your network.
          The dashboard is accessible from any modern browser.
        </p>

        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-1">
            <label className="label">Port</label>
            <input
              type="number"
              min={1024}
              max={65535}
              value={port}
              onChange={(e) => setPort(Number(e.target.value))}
              disabled={running}
              className="input text-sm"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="label">API Key (optional)</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={apiKey}
                onChange={(e) => useRemoteStore.getState().setApiKey(e.target.value)}
                disabled={running}
                placeholder="Leave empty for no auth"
                className="input flex-1 text-sm font-mono"
              />
              <button
                onClick={generateKey}
                disabled={running}
                className="btn-secondary whitespace-nowrap text-xs"
              >
                Generate
              </button>
            </div>
          </div>
        </div>

        {error && (
          <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-2 text-xs text-red-400">
            {error}
          </div>
        )}

        <div className="flex items-center gap-3">
          {!running ? (
            <button
              onClick={start}
              disabled={loading}
              className="btn-primary text-sm disabled:opacity-50"
            >
              {loading ? 'Starting...' : 'Start Server'}
            </button>
          ) : (
            <button
              onClick={stop}
              disabled={loading}
              className="btn-secondary text-sm text-red-400 disabled:opacity-50"
            >
              {loading ? 'Stopping...' : 'Stop Server'}
            </button>
          )}
        </div>

        {running && url && (
          <div className="flex flex-col gap-2 rounded-lg border border-green-500/30 bg-green-500/10 p-3">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-green-500" />
              <span className="text-xs font-medium text-green-400">Running on {url}</span>
            </div>
            <div className="flex items-center gap-2">
              <code className="flex-1 rounded bg-surface-700 px-3 py-2 text-xs font-mono text-surface-200">
                {url}
              </code>
              <button
                onClick={handleCopyUrl}
                className="btn-secondary whitespace-nowrap text-xs"
              >
                {copied ? 'Copied!' : 'Copy URL'}
              </button>
              <a
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary whitespace-nowrap text-xs"
              >
                Open
              </a>
            </div>
            {apiKey && (
              <div className="flex items-center gap-2 text-xs text-surface-400">
                <span>API Key:</span>
                <code className="font-mono text-surface-500">{apiKey}</code>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="card flex flex-col gap-3">
        <h3 className="text-sm font-semibold text-surface-200">Usage</h3>
        <ol className="flex list-inside list-decimal flex-col gap-2 text-xs text-surface-400">
          <li>Set a port number (default: 8080)</li>
          <li>Optionally generate an API key for security</li>
          <li>Click "Start Server" to begin</li>
          <li>Open the URL in any browser on your network</li>
          <li>The dashboard shows real-time GPU metrics, charts, and alerts</li>
        </ol>
      </div>

      <div className="card flex flex-col gap-3">
        <h3 className="text-sm font-semibold text-surface-200">API Endpoints</h3>
        <div className="flex flex-col gap-2 text-xs font-mono text-surface-400">
          <div><span className="text-green-400">GET</span> / &mdash; Dashboard HTML</div>
          <div><span className="text-green-400">GET</span> /api/status &mdash; Server info</div>
          <div><span className="text-green-400">GET</span> /api/gpus &mdash; List GPUs</div>
          <div><span className="text-green-400">GET</span> /api/gpus/:id/data &mdash; Latest sample</div>
          <div><span className="text-green-400">GET</span> /api/gpus/:id/history &mdash; Recent history</div>
          <div><span className="text-green-400">GET</span> /api/alerts &mdash; Alert events</div>
          <div><span className="text-green-400">GET</span> /api/health &mdash; Health check</div>
        </div>
        <p className="text-xs text-surface-500">
          Set the <code className="font-mono text-surface-400">Authorization</code> header to your API key if auth is enabled.
        </p>
      </div>
    </div>
  );
}
