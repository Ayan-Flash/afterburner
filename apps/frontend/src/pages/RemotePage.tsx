import { useEffect, useState } from 'react';
import { useRemoteStore } from '../stores';
import { IconCopy, IconExternalLink, IconPlay, IconStop, IconRefresh } from '../components/base/Icons';

export function RemotePage() {
  const { running, url, port, apiKey, loading, error, setPort, start, stop, fetchStatus, generateKey } = useRemoteStore();
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetchStatus();
  }, [fetchStatus]);

  const handleCopyUrl = async () => {
    if (url) {
      try {
        await navigator.clipboard.writeText(url);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch { /* ignore */ }
    }
  };

  return (
    <div className="flex max-w-2xl flex-col gap-5">
      <div className="card flex flex-col gap-4 p-5">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-text-primary text-sm font-semibold">Remote Monitoring Server</span>
            <p className="text-text-muted mt-1 text-xs">Monitor GPUs from any device on your network</p>
          </div>
          <div className="flex items-center gap-2">
            <span className={`size-2 rounded-full ${running ? 'bg-emerald-500 shadow-[0_0_8px_rgba(52,211,153,0.5)]' : 'bg-text-dim'}`} />
            <span className={`text-xs font-semibold uppercase tracking-wider ${running ? 'text-emerald-400' : 'text-text-muted'}`}>
              {running ? 'Running' : 'Stopped'}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="label">Port</label>
            <div className="flex gap-2">
              <input type="number" min={1024} max={65535} value={port}
                onChange={(e) => setPort(Number(e.target.value))}
                disabled={running}
                className="input w-24" />
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="label">API Key</label>
            <div className="flex gap-2">
              <div className="input text-text-secondary flex-1 truncate font-mono text-[11px]">
                {apiKey || 'No auth configured'}
              </div>
              <button onClick={generateKey} disabled={running} className="btn-secondary px-2.5 text-[10px]">
                <IconRefresh size={14} />
              </button>
            </div>
          </div>
        </div>

        {error && (
          <div className="rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2 text-xs text-red-400">
            {error}
          </div>
        )}

        <div className="flex items-center gap-3">
          {!running ? (
            <button onClick={start} disabled={loading} className="btn-primary text-xs">
              <IconPlay size={14} />
              {loading ? 'Starting...' : 'Start Server'}
            </button>
          ) : (
            <button onClick={stop} disabled={loading} className="btn-danger text-xs">
              <IconStop size={14} />
              {loading ? 'Stopping...' : 'Stop Server'}
            </button>
          )}
        </div>

        {running && url && (
          <div className="flex flex-col gap-2 rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-3">
            <div className="flex items-center gap-2.5">
              <div className="bg-gpu-900 border-gpu-700 flex flex-1 items-center gap-2 rounded-lg border px-3 py-2">
                <span className="size-1.5 rounded-full bg-emerald-500" />
                <code className="truncate font-mono text-xs text-emerald-400">{url}</code>
              </div>
              <button onClick={handleCopyUrl} className="btn-ghost p-2" title="Copy URL">
                <IconCopy size={16} />
              </button>
              <a href={url} target="_blank" rel="noopener noreferrer" className="btn-ghost p-2" title="Open in browser">
                <IconExternalLink size={16} />
              </a>
            </div>
            {copied && <span className="text-[10px] text-emerald-400">URL copied to clipboard</span>}
            {apiKey && (
              <div className="text-text-muted flex items-center gap-2 text-xs">
                <span>Auth:</span>
                <code className="text-text-dim font-mono">{apiKey}</code>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="card flex flex-col gap-3 p-5">
        <span className="text-text-secondary text-xs font-semibold uppercase tracking-wider">How to Use</span>
        <ol className="text-text-muted flex list-inside list-decimal flex-col gap-2 text-xs">
          <li>Set a port number (default: 9876)</li>
          <li>Optionally generate an API key for security</li>
          <li>Click &quot;Start Server&quot; to begin</li>
          <li>Open the URL in any browser on your network</li>
          <li>The dashboard shows real-time GPU metrics, charts, and alerts</li>
        </ol>
      </div>

      <div className="card flex flex-col gap-3 p-5">
        <span className="text-text-secondary text-xs font-semibold uppercase tracking-wider">API Endpoints</span>
        <div className="grid grid-cols-1 gap-1.5 font-mono text-xs">
          {[
            { method: 'GET', path: '/', desc: 'Dashboard HTML', color: 'text-emerald-400' },
            { method: 'GET', path: '/api/status', desc: 'Server info & GPU count', color: 'text-emerald-400' },
            { method: 'GET', path: '/api/gpus', desc: 'List GPUs with live data', color: 'text-emerald-400' },
            { method: 'GET', path: '/api/gpus/:id/data', desc: 'Latest sample for a GPU', color: 'text-emerald-400' },
            { method: 'GET', path: '/api/gpus/:id/history', desc: 'Historical samples', color: 'text-blue-400' },
            { method: 'GET', path: '/api/alerts', desc: 'Recent alert events', color: 'text-amber-400' },
            { method: 'GET', path: '/api/health', desc: 'Health check (no auth required)', color: 'text-text-muted' },
          ].map((ep) => (
            <div key={ep.path} className="hover:bg-gpu-700/50 flex items-center gap-3 rounded px-2 py-1">
              <span className={`text-[10px] font-bold ${ep.color}`}>{ep.method}</span>
              <span className="text-text-primary">{ep.path}</span>
              <span className="text-text-dim ml-auto text-[10px]">{ep.desc}</span>
            </div>
          ))}
        </div>
        <p className="text-text-dim mt-1 text-[10px]">
          Set the <code className="text-text-secondary font-mono">Authorization</code> header to your API key if auth is enabled.
        </p>
      </div>
    </div>
  );
}
