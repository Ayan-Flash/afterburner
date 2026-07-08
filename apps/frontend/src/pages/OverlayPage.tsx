import { useEffect } from 'react';
import { useOverlayStore, useGpuStore } from '../stores';
import type { OverlayMetric } from '../services';

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
  }, []);

  const handleApply = () => updateConfig(config);
  const firstGpuData = currentData.values().next().value;

  return (
    <div className="flex flex-col gap-5 max-w-4xl">
      <div className="card p-5 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-sm font-semibold text-text-primary">In-Game Overlay</span>
            <p className="text-xs text-text-muted mt-0.5">Display GPU metrics as a transparent overlay on games</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={toggleEnabled}
              className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors duration-200 ${config.enabled ? 'bg-accent' : 'bg-gpu-600'}`}
            >
              <span className={`inline-block w-3.5 h-3.5 transform rounded-full bg-white transition-transform duration-200 ${config.enabled ? 'translate-x-[18px]' : 'translate-x-1'}`} />
            </button>
            <span className={`text-xs font-medium ${config.enabled ? 'text-accent-bright' : 'text-text-muted'}`}>
              {config.enabled ? 'Enabled' : 'Disabled'}
            </span>
          </div>
        </div>

        {gameRunning && (
          <div className="flex items-center gap-2 rounded-lg border border-emerald-500/20 bg-emerald-500/10 px-3 py-2">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_6px_rgba(52,211,153,0.5)]" />
            <span className="text-xs text-emerald-400">
              Game detected{detectedGames.length > 0 ? `: ${detectedGames.join(', ')}` : ''}
            </span>
          </div>
        )}

        {!gameRunning && config.auto_hide_no_game && config.enabled && (
          <div className="flex items-center gap-2 rounded-lg border border-amber-500/20 bg-amber-500/10 px-3 py-2">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
            <span className="text-xs text-amber-400">No game detected — overlay will auto-hide</span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="flex flex-col gap-4">
          <div className="card p-4 flex flex-col gap-3">
            <span className="text-xs font-semibold text-text-secondary uppercase tracking-wider">Metrics</span>
            <div className="flex flex-col gap-1.5">
              {config.metrics.map((metric: OverlayMetric) => (
                <div key={metric.metric} className="flex items-center gap-2.5 px-2 py-1.5 rounded-lg hover:bg-gpu-700/50 transition-colors">
                  <input type="checkbox" checked={metric.enabled}
                    onChange={() => setEnabledMetrics(metric.metric, !metric.enabled)}
                    className="w-4 h-4 rounded border-gpu-500 bg-gpu-700 accent-accent cursor-pointer" />
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: metric.color }} />
                  <span className="flex-1 text-xs text-text-secondary">{metric.label}</span>
                  <input type="color" value={metric.color}
                    onChange={(e) => {
                      const metrics = config.metrics.map((m: OverlayMetric) =>
                        m.metric === metric.metric ? { ...m, color: e.target.value } : m
                      );
                      useOverlayStore.getState().updateConfig({ ...config, metrics });
                    }}
                    className="w-6 h-5 rounded border-0 bg-transparent cursor-pointer" />
                </div>
              ))}
            </div>
          </div>

          <div className="card p-4 flex flex-col gap-3">
            <span className="text-xs font-semibold text-text-secondary uppercase tracking-wider">Position</span>
            <div className="grid grid-cols-4 gap-1.5">
              {POSITION_OPTIONS.map((opt) => (
                <button key={opt.value}
                  onClick={() => { setPosition(opt.value as any); handleApply(); }}
                  className={`rounded-lg border px-2 py-1.5 text-[11px] transition-all duration-150 ${
                    config.position === opt.value
                      ? 'border-accent/50 bg-accent-glow text-accent-bright'
                      : 'border-gpu-600 text-text-muted hover:border-gpu-500'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <div className="card p-4 flex flex-col gap-4">
            <span className="text-xs font-semibold text-text-secondary uppercase tracking-wider">Display Settings</span>
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs text-text-secondary">Opacity</span>
                <span className="metric-value text-sm text-text-primary">{Math.round(config.opacity * 100)}%</span>
              </div>
              <input type="range" min={20} max={100} step={5}
                value={Math.round(config.opacity * 100)}
                onChange={(e) => setOpacity(Number(e.target.value) / 100)}
                onMouseUp={handleApply}
                className="slider-gpu w-full" />
              <div className="flex justify-between text-[10px] text-text-dim mt-1">
                <span>20%</span><span>60%</span><span>100%</span>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs text-text-secondary">Auto-hide</div>
                <div className="text-[10px] text-text-muted">Hide when no game is running</div>
              </div>
              <button
                onClick={() => {
                  const newConfig = { ...config, auto_hide_no_game: !config.auto_hide_no_game };
                  useOverlayStore.getState().updateConfig(newConfig);
                }}
                className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors duration-200 ${config.auto_hide_no_game ? 'bg-accent' : 'bg-gpu-600'}`}
              >
                <span className={`inline-block w-3.5 h-3.5 transform rounded-full bg-white transition-transform duration-200 ${config.auto_hide_no_game ? 'translate-x-[18px]' : 'translate-x-1'}`} />
              </button>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs text-text-secondary">Scale</span>
                <span className="metric-value text-sm text-text-primary">{config.scale.toFixed(1)}x</span>
              </div>
              <input type="range" min={50} max={200} step={10}
                value={Math.round(config.scale * 100)}
                onChange={(e) => {
                  const newConfig = { ...config, scale: Number(e.target.value) / 100 };
                  useOverlayStore.getState().updateConfig(newConfig);
                }}
                className="slider-gpu w-full" />
              <div className="flex justify-between text-[10px] text-text-dim mt-1">
                <span>0.5x</span><span>1.0x</span><span>2.0x</span>
              </div>
            </div>
          </div>

          <div className="card p-4 flex flex-col gap-3">
            <span className="text-xs font-semibold text-text-secondary uppercase tracking-wider">Preview</span>
            <div className="rounded-lg border border-gpu-600 bg-gradient-to-br from-gpu-950 via-gpu-900 to-gpu-800 p-4 font-mono text-xs min-h-[120px] flex items-start justify-end"
              style={{ opacity: config.opacity * 0.4 + 0.6 }}>
              <div className="bg-black/70 backdrop-blur rounded-lg p-2.5 border border-white/10 min-w-[140px]">
                {config.metrics.filter((m: OverlayMetric) => m.enabled).map((m: OverlayMetric) => {
                  let value = '--';
                  if (firstGpuData) {
                    const v = (firstGpuData as any)[m.metric];
                    if (v !== undefined) value = typeof v === 'number' ? v.toFixed(1) : String(v);
                  }
                  return (
                    <div key={m.metric} className="flex items-center gap-2 py-0.5">
                      <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: m.color }} />
                      <span className="text-white/50">{m.label}:</span>
                      <span className="font-semibold" style={{ color: m.color }}>{value}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {!running ? (
          <button onClick={start} disabled={loading || !config.enabled} className="btn-primary text-xs disabled:opacity-50">
            {loading ? 'Starting...' : 'Start Overlay'}
          </button>
        ) : (
          <button onClick={stop} disabled={loading} className="btn-danger text-xs">
            {loading ? 'Stopping...' : 'Stop Overlay'}
          </button>
        )}
        <button onClick={handleApply} className="btn-secondary text-xs">
          Apply Config
        </button>
      </div>
    </div>
  );
}
