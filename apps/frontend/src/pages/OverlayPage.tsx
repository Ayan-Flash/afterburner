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
    <div className="flex max-w-4xl flex-col gap-5">
      <div className="card flex flex-col gap-4 p-5">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-text-primary text-sm font-semibold">In-Game Overlay</span>
            <p className="text-text-muted mt-0.5 text-xs">Display GPU metrics as a transparent overlay on games</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={toggleEnabled}
              className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors duration-200 ${config.enabled ? 'bg-accent' : 'bg-gpu-600'}`}
            >
              <span className={`inline-block size-3.5 transform rounded-full bg-white transition-transform duration-200 ${config.enabled ? 'translate-x-[18px]' : 'translate-x-1'}`} />
            </button>
            <span className={`text-xs font-medium ${config.enabled ? 'text-accent-bright' : 'text-text-muted'}`}>
              {config.enabled ? 'Enabled' : 'Disabled'}
            </span>
          </div>
        </div>

        {gameRunning && (
          <div className="flex items-center gap-2 rounded-lg border border-emerald-500/20 bg-emerald-500/10 px-3 py-2">
            <span className="size-1.5 rounded-full bg-emerald-500 shadow-[0_0_6px_rgba(52,211,153,0.5)]" />
            <span className="text-xs text-emerald-400">
              Game detected{detectedGames.length > 0 ? `: ${detectedGames.join(', ')}` : ''}
            </span>
          </div>
        )}

        {!gameRunning && config.auto_hide_no_game && config.enabled && (
          <div className="flex items-center gap-2 rounded-lg border border-amber-500/20 bg-amber-500/10 px-3 py-2">
            <span className="size-1.5 rounded-full bg-amber-500" />
            <span className="text-xs text-amber-400">No game detected — overlay will auto-hide</span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="flex flex-col gap-4">
          <div className="card flex flex-col gap-3 p-4">
            <span className="text-text-secondary text-xs font-semibold uppercase tracking-wider">Metrics</span>
            <div className="flex flex-col gap-1.5">
              {config.metrics.map((metric: OverlayMetric) => (
                <div key={metric.metric} className="hover:bg-gpu-700/50 flex items-center gap-2.5 rounded-lg px-2 py-1.5 transition-colors">
                  <input type="checkbox" checked={metric.enabled}
                    onChange={() => setEnabledMetrics(metric.metric, !metric.enabled)}
                    className="border-gpu-500 bg-gpu-700 accent-accent size-4 cursor-pointer rounded" />
                  <span className="size-2 rounded-full" style={{ backgroundColor: metric.color }} />
                  <span className="text-text-secondary flex-1 text-xs">{metric.label}</span>
                  <input type="color" value={metric.color}
                    onChange={(e) => {
                      const metrics = config.metrics.map((m: OverlayMetric) =>
                        m.metric === metric.metric ? { ...m, color: e.target.value } : m
                      );
                      useOverlayStore.getState().updateConfig({ ...config, metrics });
                    }}
                    className="h-5 w-6 cursor-pointer rounded border-0 bg-transparent" />
                </div>
              ))}
            </div>
          </div>

          <div className="card flex flex-col gap-3 p-4">
            <span className="text-text-secondary text-xs font-semibold uppercase tracking-wider">Position</span>
            <div className="grid grid-cols-4 gap-1.5">
              {POSITION_OPTIONS.map((opt) => (
                <button key={opt.value}
                  onClick={() => { setPosition(opt.value as OverlayPosition); handleApply(); }}
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
          <div className="card flex flex-col gap-4 p-4">
            <span className="text-text-secondary text-xs font-semibold uppercase tracking-wider">Display Settings</span>
            <div>
              <div className="mb-1.5 flex items-center justify-between">
                <span className="text-text-secondary text-xs">Opacity</span>
                <span className="metric-value text-text-primary text-sm">{Math.round(config.opacity * 100)}%</span>
              </div>
              <input type="range" min={20} max={100} step={5}
                value={Math.round(config.opacity * 100)}
                onChange={(e) => setOpacity(Number(e.target.value) / 100)}
                onMouseUp={handleApply}
                className="slider-gpu w-full" />
              <div className="text-text-dim mt-1 flex justify-between text-[10px]">
                <span>20%</span><span>60%</span><span>100%</span>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <div className="text-text-secondary text-xs">Auto-hide</div>
                <div className="text-text-muted text-[10px]">Hide when no game is running</div>
              </div>
              <button
                onClick={() => {
                  const newConfig = { ...config, auto_hide_no_game: !config.auto_hide_no_game };
                  useOverlayStore.getState().updateConfig(newConfig);
                }}
                className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors duration-200 ${config.auto_hide_no_game ? 'bg-accent' : 'bg-gpu-600'}`}
              >
                <span className={`inline-block size-3.5 transform rounded-full bg-white transition-transform duration-200 ${config.auto_hide_no_game ? 'translate-x-[18px]' : 'translate-x-1'}`} />
              </button>
            </div>

            <div>
              <div className="mb-1.5 flex items-center justify-between">
                <span className="text-text-secondary text-xs">Scale</span>
                <span className="metric-value text-text-primary text-sm">{config.scale.toFixed(1)}x</span>
              </div>
              <input type="range" min={50} max={200} step={10}
                value={Math.round(config.scale * 100)}
                onChange={(e) => {
                  const newConfig = { ...config, scale: Number(e.target.value) / 100 };
                  useOverlayStore.getState().updateConfig(newConfig);
                }}
                className="slider-gpu w-full" />
              <div className="text-text-dim mt-1 flex justify-between text-[10px]">
                <span>0.5x</span><span>1.0x</span><span>2.0x</span>
              </div>
            </div>
          </div>

          <div className="card flex flex-col gap-3 p-4">
            <span className="text-text-secondary text-xs font-semibold uppercase tracking-wider">Preview</span>
            <div className="border-gpu-600 from-gpu-950 via-gpu-900 to-gpu-800 flex min-h-[120px] items-start justify-end rounded-lg border bg-gradient-to-br p-4 font-mono text-xs"
              style={{ opacity: config.opacity * 0.4 + 0.6 }}>
              <div className="min-w-[140px] rounded-lg border border-white/10 bg-black/70 p-2.5 backdrop-blur">
                {config.metrics.filter((m: OverlayMetric) => m.enabled).map((m: OverlayMetric) => {
                  let value = '--';
                  if (firstGpuData) {
                    const v = firstGpuData[m.metric as keyof GPUData];
                    if (v !== undefined) value = typeof v === 'number' ? v.toFixed(1) : String(v);
                  }
                  return (
                    <div key={m.metric} className="flex items-center gap-2 py-0.5">
                      <span className="size-1.5 rounded-full" style={{ backgroundColor: m.color }} />
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
