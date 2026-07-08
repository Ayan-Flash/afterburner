import { useEffect } from 'react';
import { useOverlayStore, useGpuStore } from '../stores';
import type { OverlayMetric } from '../services';

const POSITION_OPTIONS: { value: string; label: string }[] = [
  { value: 'TopLeft', label: 'Top Left' },
  { value: 'TopRight', label: 'Top Right' },
  { value: 'BottomLeft', label: 'Bottom Left' },
  { value: 'BottomRight', label: 'Bottom Right' },
];

export function OverlayPage() {
  const {
    config, running, detectedGames, gameRunning, loading,
    start, stop, updateConfig,
    setEnabledMetrics, setPosition, setOpacity, toggleEnabled,
  } = useOverlayStore();
  const { currentData } = useGpuStore();

  useEffect(() => {
    useOverlayStore.getState().fetchConfig();
    useOverlayStore.getState().fetchDetectedGames();
    useOverlayStore.getState().fetchGameStatus();
  }, []);

  const handleApply = () => {
    updateConfig(config);
  };

  const firstGpuData = currentData.values().next().value;

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6">
      <div className="card flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-surface-200">In-Game Overlay</h3>
          <div className="flex items-center gap-2">
            <button
              onClick={toggleEnabled}
              className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                config.enabled ? 'bg-primary-600' : 'bg-surface-600'
              }`}
            >
              <span
                className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${
                  config.enabled ? 'translate-x-4.5' : 'translate-x-1'
                }`}
              />
            </button>
            <span className="text-xs text-surface-400">
              {config.enabled ? 'Enabled' : 'Disabled'}
            </span>
          </div>
        </div>

        <p className="text-xs text-surface-400">
          Display GPU metrics as an overlay on top of other applications (games).
          The overlay is a transparent, click-through window.
        </p>

        {gameRunning && (
          <div className="flex items-center gap-2 rounded-lg border border-green-500/30 bg-green-500/10 px-3 py-2">
            <span className="h-2 w-2 rounded-full bg-green-500" />
            <span className="text-xs text-green-400">
              Game detected{detectedGames.length > 0 ? `: ${detectedGames.join(', ')}` : ''}
            </span>
          </div>
        )}

        {!gameRunning && config.auto_hide_no_game && config.enabled && (
          <div className="flex items-center gap-2 rounded-lg border border-yellow-500/30 bg-yellow-500/10 px-3 py-2">
            <span className="h-2 w-2 rounded-full bg-yellow-500" />
            <span className="text-xs text-yellow-400">
              No game detected - overlay will auto-hide
            </span>
          </div>
        )}
      </div>

      <div className="card flex flex-col gap-3">
        <h3 className="text-sm font-semibold text-surface-200">Metrics</h3>
        <div className="flex flex-col gap-2">
          {config.metrics.map((metric: OverlayMetric) => (
            <div key={metric.metric} className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={metric.enabled}
                onChange={() => setEnabledMetrics(metric.metric, !metric.enabled)}
                className="h-4 w-4 accent-primary-500"
              />
              <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: metric.color }} />
              <span className="flex-1 text-sm text-surface-300">{metric.label}</span>
              <input
                type="color"
                value={metric.color}
                onChange={(e) => {
                  const metrics = config.metrics.map((m: OverlayMetric) =>
                    m.metric === metric.metric ? { ...m, color: e.target.value } : m,
                  );
                  useOverlayStore.getState().updateConfig({ ...config, metrics });
                }}
                className="h-6 w-8 cursor-pointer rounded border-0 bg-transparent"
              />
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="card flex flex-col gap-3">
          <span className="text-xs font-medium text-surface-400">Position</span>
          <div className="grid grid-cols-2 gap-2">
            {POSITION_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => {
                  setPosition(opt.value as any);
                  handleApply();
                }}
                className={`rounded-lg border px-3 py-2 text-xs transition-all ${
                  config.position === opt.value
                    ? 'border-primary-500 bg-primary-500/20 text-primary-400'
                    : 'border-surface-600 text-surface-400 hover:border-surface-500'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        <div className="card flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-surface-400">Opacity</span>
            <span className="text-sm font-bold text-surface-100">
              {Math.round(config.opacity * 100)}%
            </span>
          </div>
          <input
            type="range"
            min={20}
            max={100}
            step={5}
            value={Math.round(config.opacity * 100)}
            onChange={(e) => {
              setOpacity(Number(e.target.value) / 100);
            }}
            onMouseUp={handleApply}
            className="h-2 w-full cursor-pointer appearance-none rounded-full bg-surface-700 accent-primary-500"
          />
          <div className="flex justify-between text-[10px] text-surface-500">
            <span>20%</span>
            <span>60%</span>
            <span>100%</span>
          </div>
        </div>

        <div className="card flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-xs font-medium text-surface-400">Auto-hide when no game</span>
            <span className="text-[10px] text-surface-500">
              Only show overlay while a game is running
            </span>
          </div>
          <button
            onClick={() => {
              const newConfig = { ...config, auto_hide_no_game: !config.auto_hide_no_game };
              useOverlayStore.getState().updateConfig(newConfig);
            }}
            className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
              config.auto_hide_no_game ? 'bg-primary-600' : 'bg-surface-600'
            }`}
          >
            <span
              className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${
                config.auto_hide_no_game ? 'translate-x-4.5' : 'translate-x-1'
              }`}
            />
          </button>
        </div>

        <div className="card flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-xs font-medium text-surface-400">Scale</span>
            <span className="text-[10px] text-surface-500">
              {config.scale.toFixed(1)}x
            </span>
          </div>
          <input
            type="range"
            min={50}
            max={200}
            step={10}
            value={Math.round(config.scale * 100)}
            onChange={(e) => {
              const newConfig = { ...config, scale: Number(e.target.value) / 100 };
              useOverlayStore.getState().updateConfig(newConfig);
            }}
            className="h-2 w-32 cursor-pointer appearance-none rounded-full bg-surface-700 accent-primary-500"
          />
        </div>
      </div>

      <div className="card flex flex-col gap-3">
        <h3 className="text-sm font-semibold text-surface-200">Preview</h3>
        <div
          className="rounded-lg border border-surface-600 bg-surface-800/50 p-3 font-mono text-xs"
          style={{ opacity: config.opacity }}
        >
          {config.metrics
            .filter((m: OverlayMetric) => m.enabled)
            .map((m: OverlayMetric) => {
              let value = '--';
              if (firstGpuData) {
                const v = (firstGpuData as any)[m.metric];
                if (v !== undefined) value = typeof v === 'number' ? v.toFixed(1) : String(v);
              }
              return (
                <div key={m.metric} className="flex items-center gap-2 py-0.5">
                  <span
                    className="inline-block h-1.5 w-1.5 rounded-full"
                    style={{ backgroundColor: m.color }}
                  />
                  <span className="text-surface-500">{m.label}:</span>
                  <span style={{ color: m.color }}>{value}</span>
                </div>
              );
            })}
        </div>
      </div>

      <div className="flex items-center gap-3">
        {!running ? (
          <button onClick={start} disabled={loading || !config.enabled} className="btn-primary text-sm disabled:opacity-50">
            {loading ? 'Starting...' : 'Start Overlay'}
          </button>
        ) : (
          <button onClick={stop} disabled={loading} className="btn-secondary text-sm text-red-400 disabled:opacity-50">
            {loading ? 'Stopping...' : 'Stop Overlay'}
          </button>
        )}
        <button onClick={handleApply} className="btn-secondary text-sm">
          Apply Config
        </button>
      </div>
    </div>
  );
}
