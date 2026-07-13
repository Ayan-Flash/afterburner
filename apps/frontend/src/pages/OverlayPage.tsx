import { useEffect } from 'react';
import { useOverlayStore, useGpuStore } from '../stores';
import type { OverlayMetric, GPUData } from '../services';

type OverlayPosition = 'TopLeft' | 'TopRight' | 'BottomLeft' | 'BottomRight';

const POSITION_OPTIONS = [
  { value: 'TopLeft', label: 'Top Left' },
  { value: 'TopRight', label: 'Top Right' },
  { value: 'BottomLeft', label: 'Bottom Left' },
  { value: 'BottomRight', label: 'Bottom Right' },
];

export function OverlayPage() {
  const { config, running, detectedGames, gameRunning, loading, start, stop, updateConfig, setEnabledMetrics, setPosition, setOpacity, toggleEnabled, fetchConfig, fetchDetectedGames, fetchGameStatus } = useOverlayStore();
  const { currentData } = useGpuStore();

  useEffect(() => {
    fetchConfig();
    fetchDetectedGames();
    fetchGameStatus();
  }, [fetchConfig, fetchDetectedGames, fetchGameStatus]);

  const handleApply = () => updateConfig(config);
  const firstGpuData = currentData.values().next().value;

  return (
    <div className="ac-page ac-page--wide">

      <div className="ac-page-card">
        <div className="ac-page-card__header">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <span className="ac-page-card__title">In-Game Overlay</span>
            <p className="ac-page-header__desc">Display GPU metrics as a transparent overlay on games</p>
          </div>
          <div className="ac-page-card__actions">
            <label className="ac-toggle" onClick={toggleEnabled}>
              <span className={`ac-toggle__track ${config.enabled ? 'ac-toggle__track--on' : ''}`}>
                <span className="ac-toggle__thumb" />
              </span>
              <span className="ac-toggle__label">{config.enabled ? 'Enabled' : 'Disabled'}</span>
            </label>
          </div>
        </div>

        <div className="ac-page-card__body">
          {gameRunning && (
            <div className="ac-banner ac-banner--success" style={{ marginBottom: 8 }}>
              <span className="ac-status-dot ac-status-dot--on" />
              <span>
                Game detected{detectedGames.length > 0 ? `: ${detectedGames.join(', ')}` : ''}
              </span>
            </div>
          )}

          {!gameRunning && config.auto_hide_no_game && config.enabled && (
            <div className="ac-banner ac-banner--warning">
              <span className="ac-status-dot" style={{ background: '#fbbf24' }} />
              <span>No game detected — overlay will auto-hide</span>
            </div>
          )}
        </div>
      </div>

      <div className="ac-grid-2">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div className="ac-page-card">
            <div className="ac-page-card__header">
              <span className="ac-page-card__title">Metrics</span>
            </div>
            <div className="ac-page-card__body" style={{ padding: '8px 14px 14px' }}>
              {config.metrics.map((metric: OverlayMetric) => (
                <div key={metric.metric}
                  className="ac-checkbox rounded-lg px-2 py-1.5 transition-colors"
                  style={{ borderRadius: 8 }}>
                  <input type="checkbox" checked={metric.enabled}
                    onChange={() => setEnabledMetrics(metric.metric, !metric.enabled)}
                    style={{ width: 14, height: 14, cursor: 'pointer', accentColor: 'var(--ac-accent-cyan)', borderRadius: 3 }} />
                  <span className="ac-status-dot" style={{ backgroundColor: metric.color }} />
                  <span className="ac-checkbox__label" style={{ flex: 1 }}>{metric.label}</span>
                  <input type="color" value={metric.color}
                    onChange={(e) => {
                      const metrics = config.metrics.map((m: OverlayMetric) =>
                        m.metric === metric.metric ? { ...m, color: e.target.value } : m
                      );
                      useOverlayStore.getState().updateConfig({ ...config, metrics });
                    }}
                    style={{ width: 20, height: 18, cursor: 'pointer', border: 'none', background: 'transparent', padding: 0 }} />
                </div>
              ))}
            </div>
          </div>

          <div className="ac-page-card">
            <div className="ac-page-card__header">
              <span className="ac-page-card__title">Position</span>
            </div>
            <div className="ac-page-card__body">
              <div className="ac-grid-4">
                {POSITION_OPTIONS.map((opt) => (
                  <button key={opt.value}
                    onClick={() => { setPosition(opt.value as OverlayPosition); handleApply(); }}
                    className={`ac-btn ac-btn--sm ${config.position === opt.value ? 'ac-btn--primary' : 'ac-btn--ghost'}`}>
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div className="ac-page-card">
            <div className="ac-page-card__header">
              <span className="ac-page-card__title">Display Settings</span>
            </div>
            <div className="ac-page-card__body" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <div className="ac-row" style={{ marginBottom: 6 }}>
                  <span className="ac-row__label">Opacity</span>
                  <span className="ac-row__value">{Math.round(config.opacity * 100)}%</span>
                </div>
                <input type="range" min={20} max={100} step={5}
                  value={Math.round(config.opacity * 100)}
                  onChange={(e) => setOpacity(Number(e.target.value) / 100)}
                  onMouseUp={handleApply}
                  className="ac-slider" />
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4, color: 'var(--ac-text-dim)', fontSize: 10 }}>
                  <span>20%</span><span>60%</span><span>100%</span>
                </div>
              </div>

              <div className="ac-row">
                <div>
                  <div className="ac-row__label">Auto-hide</div>
                  <div style={{ color: 'var(--ac-text-dim)', fontSize: 10, marginTop: 1 }}>Hide when no game is running</div>
                </div>
                <label className="ac-toggle" onClick={() => {
                  const newConfig = { ...config, auto_hide_no_game: !config.auto_hide_no_game };
                  useOverlayStore.getState().updateConfig(newConfig);
                }}>
                  <span className={`ac-toggle__track ${config.auto_hide_no_game ? 'ac-toggle__track--on' : ''}`}>
                    <span className="ac-toggle__thumb" />
                  </span>
                </label>
              </div>

              <div>
                <div className="ac-row" style={{ marginBottom: 6 }}>
                  <span className="ac-row__label">Scale</span>
                  <span className="ac-row__value">{config.scale.toFixed(1)}x</span>
                </div>
                <input type="range" min={50} max={200} step={10}
                  value={Math.round(config.scale * 100)}
                  onChange={(e) => {
                    const newConfig = { ...config, scale: Number(e.target.value) / 100 };
                    useOverlayStore.getState().updateConfig(newConfig);
                  }}
                  className="ac-slider" />
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4, color: 'var(--ac-text-dim)', fontSize: 10 }}>
                  <span>0.5x</span><span>1.0x</span><span>2.0x</span>
                </div>
              </div>
            </div>
          </div>

          <div className="ac-page-card">
            <div className="ac-page-card__header">
              <span className="ac-page-card__title">Preview</span>
            </div>
            <div className="ac-page-card__body">
              <div className="flex min-h-[120px] items-start justify-end rounded-lg border p-4 font-mono text-xs"
                style={{
                  opacity: config.opacity * 0.4 + 0.6,
                  borderColor: 'var(--ac-border-subtle)',
                  background: 'linear-gradient(to bottom right, var(--ac-bg-deep), var(--ac-bg-panel))'
                }}>
                <div className="min-w-[140px] rounded-lg border p-2.5 backdrop-blur"
                  style={{ borderColor: 'rgba(255,255,255,0.1)', background: 'rgba(0,0,0,0.7)' }}>
                  {config.metrics.filter((m: OverlayMetric) => m.enabled).map((m: OverlayMetric) => {
                    let value = '--';
                    if (firstGpuData) {
                      const v = firstGpuData[m.metric as keyof GPUData];
                      if (v !== undefined) value = typeof v === 'number' ? v.toFixed(1) : String(v);
                    }
                    return (
                      <div key={m.metric} className="flex items-center gap-2 py-0.5">
                        <span className="ac-status-dot" style={{ backgroundColor: m.color }} />
                        <span style={{ color: 'rgba(255,255,255,0.5)' }}>{m.label}:</span>
                        <span className="font-semibold" style={{ color: m.color }}>{value}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {!running ? (
          <button onClick={start} disabled={loading || !config.enabled}
            className="ac-btn ac-btn--primary">
            {loading ? 'Starting...' : 'Start Overlay'}
          </button>
        ) : (
          <button onClick={stop} disabled={loading}
            className="ac-btn ac-btn--danger">
            {loading ? 'Stopping...' : 'Stop Overlay'}
          </button>
        )}
        <button onClick={handleApply} className="ac-btn ac-btn--secondary">
          Apply Config
        </button>
      </div>
    </div>
  );
}
