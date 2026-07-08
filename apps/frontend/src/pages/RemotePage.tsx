import { useEffect, useState } from 'react';
import { useRemoteStore } from '../stores';
import { IconCopy, IconExternalLink, IconPlay, IconStop, IconRefresh } from '../components/base/Icons';

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
      } catch { /* ignore */ }
    }
  };

  return (
    <div className="flex flex-col gap-5 max-w-2xl">
      <div className="card p-5 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-sm font-semibold text-text-primary">Remote Monitoring Server</span>
            <p className="text-xs text-text-muted mt-1">Monitor GPUs from any device on your network</p>
          </div>
          <div className="flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full ${running ? 'bg-emerald-500 shadow-[0_0_8px_rgba(52,211,153,0.5)]' : 'bg-text-dim'}`} />
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
              <div className="input flex-1 font-mono text-[11px] text-text-secondary truncate">
                {apiKey || 'No auth configured'}
              </div>
              <button onClick={generateKey} disabled={running} className="btn-secondary text-[10px] px-2.5">
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
          <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-3 flex flex-col gap-2">
            <div className="flex items-center gap-2.5">
              <div className="flex-1 flex items-center gap-2 bg-gpu-900 rounded-lg px-3 py-2 border border-gpu-700">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                <code className="text-xs font-mono text-emerald-400 truncate">{url}</code>
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
              <div className="flex items-center gap-2 text-xs text-text-muted">
                <span>Auth:</span>
                <code className="font-mono text-text-dim">{apiKey}</code>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="card p-5 flex flex-col gap-3">
        <span className="text-xs font-semibold text-text-secondary uppercase tracking-wider">How to Use</span>
        <ol className="flex flex-col gap-2 text-xs text-text-muted list-decimal list-inside">
          <li>Set a port number (default: 9876)</li>
          <li>Optionally generate an API key for security</li>
          <li>Click "Start Server" to begin</li>
          <li>Open the URL in any browser on your network</li>
          <li>The dashboard shows real-time GPU metrics, charts, and alerts</li>
        </ol>
      </div>

      <div className="card p-5 flex flex-col gap-3">
        <span className="text-xs font-semibold text-text-secondary uppercase tracking-wider">API Endpoints</span>
        <div className="grid grid-cols-1 gap-1.5 text-xs font-mono">
          {[
            { method: 'GET', path: '/', desc: 'Dashboard HTML', color: 'text-emerald-400' },
            { method: 'GET', path: '/api/status', desc: 'Server info & GPU count', color: 'text-emerald-400' },
            { method: 'GET', path: '/api/gpus', desc: 'List GPUs with live data', color: 'text-emerald-400' },
            { method: 'GET', path: '/api/gpus/:id/data', desc: 'Latest sample for a GPU', color: 'text-emerald-400' },
            { method: 'GET', path: '/api/gpus/:id/history', desc: 'Historical samples', color: 'text-blue-400' },
            { method: 'GET', path: '/api/alerts', desc: 'Recent alert events', color: 'text-amber-400' },
            { method: 'GET', path: '/api/health', desc: 'Health check (no auth required)', color: 'text-text-muted' },
          ].map((ep) => (
            <div key={ep.path} className="flex items-center gap-3 px-2 py-1 rounded hover:bg-gpu-700/50">
              <span className={`text-[10px] font-bold ${ep.color}`}>{ep.method}</span>
              <span className="text-text-primary">{ep.path}</span>
              <span className="text-text-dim ml-auto text-[10px]">{ep.desc}</span>
            </div>
          ))}
        </div>
        <p className="text-[10px] text-text-dim mt-1">
          Set the <code className="font-mono text-text-secondary">Authorization</code> header to your API key if auth is enabled.
        </p>
      </div>
    </div>
  );
}
