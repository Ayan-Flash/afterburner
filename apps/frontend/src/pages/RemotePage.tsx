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
    <div className="ac-page ac-page--compact">
      <div className="ac-page-card">
        <div className="ac-page-card__body" style={{display: 'flex', flexDirection: 'column', gap: 16}}>
          <div className="ac-page-header">
            <div className="ac-page-header__left">
              <div className="ac-page-header__title">Remote Monitoring Server</div>
              <div className="ac-page-header__desc">Monitor GPUs from any device on your network</div>
            </div>
            <div className="ac-page-header__right">
              <div style={{display: 'flex', alignItems: 'center', gap: 8}}>
                <span className={`ac-status-dot ${running ? 'ac-status-dot--on' : 'ac-status-dot--off'}`} />
                <span style={{fontSize: 12, fontWeight: 600, letterSpacing: '0.5px', textTransform: 'uppercase', color: running ? '#34d399' : 'var(--ac-text-muted)'}}>
                  {running ? 'Running' : 'Stopped'}
                </span>
              </div>
            </div>
          </div>

          <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16}}>
            <div style={{display: 'flex', flexDirection: 'column', gap: 6}}>
              <label className="ac-label">Port</label>
              <div style={{display: 'flex', gap: 8}}>
                <input type="number" min={1024} max={65535} value={port}
                  onChange={(e) => setPort(Number(e.target.value))}
                  disabled={running}
                  className="ac-input ac-input--sm"
                  style={{width: 96}} />
              </div>
            </div>
            <div style={{display: 'flex', flexDirection: 'column', gap: 6}}>
              <label className="ac-label">API Key</label>
              <div style={{display: 'flex', gap: 8}}>
                <div style={{flex: 1, background: 'var(--ac-bg-input)', border: '1px solid var(--ac-border-subtle)', borderRadius: 4, padding: '4px 10px', color: 'var(--ac-text-secondary)', fontFamily: 'var(--ac-font-mono)', fontSize: 11, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'}}>
                  {apiKey || 'No auth configured'}
                </div>
                <button onClick={generateKey} disabled={running} className="ac-btn ac-btn--secondary ac-btn--sm" style={{fontSize: 10, padding: '3px 10px'}}>
                  <IconRefresh style={{width: 14, height: 14}} />
                </button>
              </div>
            </div>
          </div>

          {error && (
            <div className="ac-banner ac-banner--error" style={{fontSize: 12}}>
              {error}
            </div>
          )}

          <div style={{display: 'flex', alignItems: 'center', gap: 12}}>
            {!running ? (
              <button onClick={start} disabled={loading} className="ac-btn ac-btn--primary ac-btn--sm">
                <IconPlay style={{width: 14, height: 14}} />
                {loading ? 'Starting...' : 'Start Server'}
              </button>
            ) : (
              <button onClick={stop} disabled={loading} className="ac-btn ac-btn--danger ac-btn--sm">
                <IconStop style={{width: 14, height: 14}} />
                {loading ? 'Stopping...' : 'Stop Server'}
              </button>
            )}
          </div>

          {running && url && (
            <div style={{display: 'flex', flexDirection: 'column', gap: 8, borderRadius: 8, border: '1px solid rgba(52,211,153,0.2)', background: 'rgba(52,211,153,0.05)', padding: 12}}>
              <div style={{display: 'flex', alignItems: 'center', gap: 10}}>
                <div style={{flex: 1, display: 'flex', alignItems: 'center', gap: 8, background: 'var(--ac-bg-input)', border: '1px solid var(--ac-border-subtle)', borderRadius: 8, padding: '8px 12px'}}>
                  <span className="ac-status-dot ac-status-dot--on" style={{width: 6, height: 6}} />
                  <code style={{overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontFamily: 'var(--ac-font-mono)', fontSize: 12, color: '#34d399'}}>{url}</code>
                </div>
                <button onClick={handleCopyUrl} className="ac-btn ac-btn--ghost ac-btn--icon" title="Copy URL">
                  <IconCopy style={{width: 16, height: 16}} />
                </button>
                <a href={url} target="_blank" rel="noopener noreferrer" className="ac-btn ac-btn--ghost ac-btn--icon" title="Open in browser">
                  <IconExternalLink style={{width: 16, height: 16}} />
                </a>
              </div>
              {copied && <span style={{fontSize: 10, color: '#34d399'}}>URL copied to clipboard</span>}
              {apiKey && (
                <div style={{display: 'flex', alignItems: 'center', gap: 8, color: 'var(--ac-text-muted)', fontSize: 12}}>
                  <span>Auth:</span>
                  <code style={{color: 'var(--ac-text-dim)', fontFamily: 'var(--ac-font-mono)'}}>{apiKey}</code>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="ac-page-card">
        <div className="ac-page-card__body" style={{display: 'flex', flexDirection: 'column', gap: 12}}>
          <span className="ac-subtitle">How to Use</span>
          <ol style={{color: 'var(--ac-text-muted)', listStylePosition: 'inside', listStyleType: 'decimal', display: 'flex', flexDirection: 'column', gap: 8, fontSize: 12, margin: 0, padding: 0}}>
            <li>Set a port number (default: 9876)</li>
            <li>Optionally generate an API key for security</li>
            <li>Click &quot;Start Server&quot; to begin</li>
            <li>Open the URL in any browser on your network</li>
            <li>The dashboard shows real-time GPU metrics, charts, and alerts</li>
          </ol>
        </div>
      </div>

      <div className="ac-page-card">
        <div className="ac-page-card__body" style={{display: 'flex', flexDirection: 'column', gap: 12}}>
          <span className="ac-subtitle">API Endpoints</span>
          <div style={{display: 'flex', flexDirection: 'column', gap: 6, fontFamily: 'var(--ac-font-mono)', fontSize: 12}}>
            {[
              { method: 'GET', path: '/', desc: 'Dashboard HTML', color: '#34d399' },
              { method: 'GET', path: '/api/status', desc: 'Server info & GPU count', color: '#34d399' },
              { method: 'GET', path: '/api/gpus', desc: 'List GPUs with live data', color: '#34d399' },
              { method: 'GET', path: '/api/gpus/:id/data', desc: 'Latest sample for a GPU', color: '#34d399' },
              { method: 'GET', path: '/api/gpus/:id/history', desc: 'Historical samples', color: '#60a5fa' },
              { method: 'GET', path: '/api/alerts', desc: 'Recent alert events', color: '#fbbf24' },
              { method: 'GET', path: '/api/health', desc: 'Health check (no auth required)', color: 'var(--ac-text-muted)' },
            ].map((ep) => (
              <div key={ep.path} style={{display: 'flex', alignItems: 'center', gap: 12, borderRadius: 4, padding: '4px 8px'}}>
                <span style={{fontSize: 10, fontWeight: 700, color: ep.color}}>{ep.method}</span>
                <span style={{color: 'var(--ac-text-primary)'}}>{ep.path}</span>
                <span style={{color: 'var(--ac-text-dim)', fontSize: 10, marginLeft: 'auto'}}>{ep.desc}</span>
              </div>
            ))}
          </div>
          <p style={{color: 'var(--ac-text-dim)', fontSize: 10, marginTop: 4}}>
            Set the <code style={{color: 'var(--ac-text-secondary)', fontFamily: 'var(--ac-font-mono)'}}>Authorization</code> header to your API key if auth is enabled.
          </p>
        </div>
      </div>
    </div>
  );
}
