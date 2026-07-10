import { useEffect, useState } from 'react';
import { useAiStore } from '../stores/aiStore';
import * as aiService from '../services/aiService';
import { useSmartAlertStore } from '../stores/smartAlertStore';
import { IconZap, IconRefresh, IconTrash2, IconCheck, IconSettings, IconSliders, IconBell } from '../components/base/Icons';

function formatDate(ts: number) {
  return new Date(ts * 1000).toLocaleString();
}

function severityColor(severity: string) {
  switch (severity) {
    case 'Critical': return 'text-red-400 bg-red-500/10 border-red-500/30';
    case 'High': return 'text-orange-400 bg-orange-500/10 border-orange-500/30';
    case 'Medium': return 'text-yellow-400 bg-yellow-500/10 border-yellow-500/30';
    default: return 'text-blue-400 bg-blue-500/10 border-blue-500/30';
  }
}

function trendIcon(trend: string) {
  switch (trend) {
    case 'Rising': return '↑';
    case 'Falling': return '↓';
    case 'Stable': return '→';
    case 'Volatile': return '~';
    default: return '?';
  }
}

export function AiPage() {
  const { anomalies, suggestions, tempPrediction, utilPrediction, analyzing, error, fetchAnomalies, fetchSuggestions, clearAnomalies, dismissSuggestion, runAnalysis, predictTemp, predictUtil, clearError } = useAiStore();
  const smartAlertStore = useSmartAlertStore();
  const { fetchAll: fetchSmartAlerts } = smartAlertStore;
  const [selectedGpu, setSelectedGpu] = useState('gpu_0');
  const [activeTab, setActiveTab] = useState<'anomalies' | 'predictions' | 'suggestions' | 'tuning' | 'smart_alerts'>('anomalies');

  const [fanCurveResult, setFanCurveResult] = useState<aiService.FanCurveResult | null>(null);
  const [clockResult, setClockResult] = useState<aiService.ClockTuneResult | null>(null);
  const [powerResult, setPowerResult] = useState<aiService.PowerTuneResult | null>(null);
  const [tuningLoading, setTuningLoading] = useState(false);
  const [maxPower, setMaxPower] = useState(200);

  useEffect(() => {
    fetchAnomalies();
    fetchSuggestions();
    fetchSmartAlerts();
  }, [fetchAnomalies, fetchSuggestions, fetchSmartAlerts]);

  const handlePredict = () => {
    predictTemp(selectedGpu);
    predictUtil(selectedGpu);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="section-header">
          <h2 className="text-text-primary text-lg font-semibold">AI Insights</h2>
          <p className="text-text-secondary mt-1 text-sm">Anomaly detection, predictions, and optimization suggestions</p>
        </div>
        <button
          onClick={runAnalysis}
          disabled={analyzing}
          className="btn-primary px-4 py-1.5 text-xs"
        >
          {analyzing ? 'Analyzing...' : 'Run Analysis'}
        </button>
      </div>

      {error && (
        <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
          {error}
          <button onClick={clearError} className="float-right text-red-400/70 hover:text-red-400">&times;</button>
        </div>
      )}

      <div className="border-gpu-800 flex gap-1 border-b">
        <button onClick={() => setActiveTab('anomalies')} className={`border-b-2 px-4 py-2.5 text-sm font-medium transition-colors ${activeTab === 'anomalies' ? 'border-accent-primary text-text-primary' : 'text-text-secondary border-transparent'}`}>
          Anomalies ({anomalies.length})
        </button>
        <button onClick={() => setActiveTab('predictions')} className={`border-b-2 px-4 py-2.5 text-sm font-medium transition-colors ${activeTab === 'predictions' ? 'border-accent-primary text-text-primary' : 'text-text-secondary border-transparent'}`}>
          Predictions
        </button>
        <button onClick={() => setActiveTab('suggestions')} className={`border-b-2 px-4 py-2.5 text-sm font-medium transition-colors ${activeTab === 'suggestions' ? 'border-accent-primary text-text-primary' : 'text-text-secondary border-transparent'}`}>
          Suggestions ({suggestions.filter(s => !s.applied).length})
        </button>
        <button onClick={() => setActiveTab('tuning')} className={`border-b-2 px-4 py-2.5 text-sm font-medium transition-colors ${activeTab === 'tuning' ? 'border-accent-primary text-text-primary' : 'text-text-secondary border-transparent'}`}>
          Auto-Tuning
        </button>
        <button onClick={() => setActiveTab('smart_alerts')} className={`border-b-2 px-4 py-2.5 text-sm font-medium transition-colors ${activeTab === 'smart_alerts' ? 'border-accent-primary text-text-primary' : 'text-text-secondary border-transparent'}`}>
          Smart Alerts
        </button>
      </div>

      {activeTab === 'anomalies' && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <button onClick={() => clearAnomalies()} className="btn-ghost px-3 py-1.5 text-xs text-red-400/60 hover:text-red-400">
              <IconTrash2 className="mr-1 inline size-3.5" />
              Clear All
            </button>
          </div>
          {anomalies.length === 0 ? (
            <div className="card p-8 text-center">
              <IconZap className="text-text-muted mx-auto mb-3 size-12" />
              <p className="text-text-secondary text-sm">No anomalies detected. Run an analysis to check your GPUs.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {[...anomalies].reverse().map((a) => (
                <div key={a.id} className={`card border-l-4 p-4 ${a.severity === 'Critical' ? 'border-l-red-500' : a.severity === 'High' ? 'border-l-orange-500' : a.severity === 'Medium' ? 'border-l-yellow-500' : 'border-l-blue-500'}`}>
                  <div className="flex items-start justify-between">
                    <div className="min-w-0">
                      <div className="mb-1 flex items-center gap-2">
                        <span className={`rounded px-2 py-0.5 text-xs ${severityColor(a.severity)}`}>
                          {a.severity}
                        </span>
                        <span className="text-text-secondary text-xs">{a.anomaly_type.replace(/([A-Z])/g, ' $1').trim()}</span>
                        <span className="text-text-muted text-xs">{a.gpu_id}</span>
                      </div>
                      <p className="text-text-primary text-sm">{a.message}</p>
                      <p className="text-text-muted mt-1 text-xs">{formatDate(a.timestamp)}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'predictions' && (
        <div className="space-y-4">
          <div className="card p-5">
            <div className="mb-4 flex items-center gap-3">
              <select
                value={selectedGpu}
                onChange={(e) => setSelectedGpu(e.target.value)}
                className="bg-gpu-800 border-gpu-700 text-text-primary rounded-lg border px-3 py-2 text-sm"
              >
                <option value="gpu_0">GPU 0</option>
                <option value="gpu_1">GPU 1</option>
              </select>
              <button onClick={handlePredict} className="btn-primary px-4 py-2 text-xs">
                <IconRefresh className="mr-1 inline size-3.5" />
                Predict
              </button>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {tempPrediction ? (
                <div className="bg-gpu-800 rounded-lg px-4 py-3">
                  <h4 className="text-text-secondary mb-2 text-xs font-medium">Temperature Forecast</h4>
                  <div className="space-y-1.5 text-sm">
                    <div className="flex justify-between">
                      <span className="text-text-secondary">Current</span>
                      <span className="text-text-primary font-mono">{tempPrediction.current_value.toFixed(1)}°C</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-text-secondary">5 min</span>
                      <span className={`font-mono ${tempPrediction.trend === 'Rising' ? 'text-red-400' : tempPrediction.trend === 'Falling' ? 'text-blue-400' : 'text-text-primary'}`}>
                        {tempPrediction.predicted_in_5m.toFixed(1)}°C
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-text-secondary">15 min</span>
                      <span className={`font-mono ${tempPrediction.predicted_in_15m > 80 ? 'text-red-400' : 'text-text-primary'}`}>
                        {tempPrediction.predicted_in_15m.toFixed(1)}°C
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-text-secondary">Trend</span>
                      <span className="text-text-primary">{trendIcon(tempPrediction.trend)} {tempPrediction.trend}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-text-secondary">Confidence</span>
                      <span className="text-text-primary">{(tempPrediction.confidence * 100).toFixed(0)}%</span>
                    </div>
                    {tempPrediction.time_to_throttle && (
                      <div className="flex justify-between text-yellow-400">
                        <span>Time to throttle</span>
                        <span className="font-mono">{(tempPrediction.time_to_throttle / 60).toFixed(0)} min</span>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="bg-gpu-800 text-text-secondary flex items-center justify-center rounded-lg px-4 py-3 text-sm">
                  Run a prediction to see temperature forecast
                </div>
              )}

              {utilPrediction ? (
                <div className="bg-gpu-800 rounded-lg px-4 py-3">
                  <h4 className="text-text-secondary mb-2 text-xs font-medium">Utilization Forecast</h4>
                  <div className="space-y-1.5 text-sm">
                    <div className="flex justify-between">
                      <span className="text-text-secondary">Current</span>
                      <span className="text-text-primary font-mono">{utilPrediction.current_value.toFixed(1)}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-text-secondary">5 min</span>
                      <span className="text-text-primary font-mono">{utilPrediction.predicted_in_5m.toFixed(1)}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-text-secondary">15 min</span>
                      <span className="text-text-primary font-mono">{utilPrediction.predicted_in_15m.toFixed(1)}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-text-secondary">Trend</span>
                      <span className="text-text-primary">{trendIcon(utilPrediction.trend)} {utilPrediction.trend}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-text-secondary">Confidence</span>
                      <span className="text-text-primary">{(utilPrediction.confidence * 100).toFixed(0)}%</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-gpu-800 text-text-secondary flex items-center justify-center rounded-lg px-4 py-3 text-sm">
                  Run a prediction to see utilization forecast
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'suggestions' && (
        <div className="space-y-2">
          {suggestions.length === 0 ? (
            <div className="card p-8 text-center">
              <IconSettings className="text-text-muted mx-auto mb-3 size-12" />
              <p className="text-text-secondary text-sm">No optimization suggestions yet. Run an analysis first.</p>
            </div>
          ) : (
            suggestions.map((s) => (
              <div key={s.id} className={`card p-4 ${s.applied ? 'opacity-50' : ''}`}>
                <div className="flex items-start justify-between">
                  <div className="min-w-0 space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="bg-accent-primary/10 text-accent-primary rounded px-2 py-0.5 text-xs">
                        {s.category.replace(/([A-Z])/g, ' $1').trim()}
                      </span>
                      {s.applied && (
                        <span className="rounded bg-emerald-500/10 px-2 py-0.5 text-xs text-emerald-400">Applied</span>
                      )}
                    </div>
                    <p className="text-text-primary text-sm font-medium">{s.title}</p>
                    <p className="text-text-secondary text-xs">{s.description}</p>
                    <p className="text-xs text-emerald-400">{s.potential_benefit}</p>
                    <p className="text-text-muted text-xs">
                      Confidence: {(s.confidence * 100).toFixed(0)}% &middot; {formatDate(s.timestamp)}
                    </p>
                  </div>
                  {!s.applied && (
                    <button onClick={() => dismissSuggestion(s.id)} className="btn-ghost p-1.5 text-xs text-emerald-400/60 hover:text-emerald-400">
                      <IconCheck className="size-4" />
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {activeTab === 'tuning' && (
        <div className="space-y-4">
          <div className="card p-5">
            <div className="mb-4 flex items-center gap-3">
              <IconSliders className="text-accent-primary size-5" />
              <h3 className="text-text-primary text-sm font-semibold">Auto-Tuner</h3>
              <select
                value={selectedGpu}
                onChange={(e) => setSelectedGpu(e.target.value)}
                className="bg-gpu-800 border-gpu-700 text-text-primary ml-auto rounded border px-2 py-1.5 text-sm"
              >
                <option value="gpu_0">GPU 0</option>
              </select>
            </div>

            <div className="mb-4 grid grid-cols-1 gap-4 md:grid-cols-3">
              <div className="bg-gpu-800 rounded-lg px-4 py-3">
                <h4 className="text-text-secondary mb-2 text-xs font-medium">Fan Curve</h4>
                <p className="text-text-secondary mb-2 text-xs">Analyze your GPU&apos;s thermal behavior and generate an optimal fan curve</p>
                <button
                  onClick={async () => {
                    setTuningLoading(true);
                    const result = await aiService.tuneFanCurve(selectedGpu);
                    setFanCurveResult(result);
                    setTuningLoading(false);
                  }}
                  disabled={tuningLoading}
                  className="btn-primary px-3 py-1.5 text-xs"
                >
                  Tune Fan Curve
                </button>
                {fanCurveResult && (
                  <div className="mt-2 space-y-1 text-xs">
                    <p className="text-text-secondary">Est. max temp: <span className="text-text-primary">{fanCurveResult.estimated_max_temp.toFixed(0)}°C</span></p>
                    <p className="text-text-secondary">Noise: <span className="text-text-primary">{fanCurveResult.estimated_noise_level}</span></p>
                    <div className="mt-1 space-y-0.5">
                      {fanCurveResult.points.filter(p => p.temperature >= 40).map((p, i) => (
                        <div key={i} className="text-text-muted flex justify-between">
                          <span>{p.temperature.toFixed(0)}°C</span>
                          <span className="text-text-primary">{p.fan_speed.toFixed(0)}%</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="bg-gpu-800 rounded-lg px-4 py-3">
                <h4 className="text-text-secondary mb-2 text-xs font-medium">Clock Offsets</h4>
                <p className="text-text-secondary mb-2 text-xs">Find safe core and memory clock offsets based on your GPU&apos;s thermal headroom</p>
                <button
                  onClick={async () => {
                    setTuningLoading(true);
                    const result = await aiService.tuneClockOffsets(selectedGpu);
                    setClockResult(result);
                    setTuningLoading(false);
                  }}
                  disabled={tuningLoading}
                  className="btn-primary px-3 py-1.5 text-xs"
                >
                  Tune Clocks
                </button>
                {clockResult && (
                  <div className="mt-2 space-y-1 text-xs">
                    <div className="flex justify-between"><span className="text-text-secondary">Core offset</span><span className="text-emerald-400">+{clockResult.core_offset_mhz} MHz</span></div>
                    <div className="flex justify-between"><span className="text-text-secondary">Mem offset</span><span className="text-emerald-400">+{clockResult.memory_offset_mhz} MHz</span></div>
                    <div className="flex justify-between"><span className="text-text-secondary">Stability</span><span className="text-text-primary">{clockResult.stability}</span></div>
                    <div className="flex justify-between"><span className="text-text-secondary">Avg temp</span><span className="text-text-primary">{clockResult.avg_temperature.toFixed(0)}°C</span></div>
                  </div>
                )}
              </div>

              <div className="bg-gpu-800 rounded-lg px-4 py-3">
                <h4 className="text-text-secondary mb-2 text-xs font-medium">Power Limit</h4>
                <p className="text-text-secondary mb-2 text-xs">Optimize power limit for best efficiency or performance</p>
                <div className="mb-2 flex items-center gap-2">
                  <input
                    type="number"
                    value={maxPower}
                    onChange={(e) => setMaxPower(Number(e.target.value))}
                    className="bg-gpu-700 border-gpu-600 text-text-primary w-20 rounded border px-2 py-1 text-xs"
                  />
                  <span className="text-text-secondary text-xs">W max</span>
                </div>
                <button
                  onClick={async () => {
                    setTuningLoading(true);
                    const result = await aiService.tunePowerLimit(selectedGpu, maxPower);
                    setPowerResult(result);
                    setTuningLoading(false);
                  }}
                  disabled={tuningLoading}
                  className="btn-primary px-3 py-1.5 text-xs"
                >
                  Tune Power
                </button>
                {powerResult && (
                  <div className="mt-2 space-y-1 text-xs">
                    <div className="flex justify-between"><span className="text-text-secondary">Limit</span><span className="text-text-primary">{powerResult.limit_percent.toFixed(0)}%</span></div>
                    <div className="flex justify-between"><span className="text-text-secondary">Perf est.</span><span className="text-text-primary">{powerResult.estimated_performance.toFixed(0)}%</span></div>
                    <div className="flex justify-between"><span className="text-text-secondary">Power save</span><span className="text-emerald-400">{powerResult.estimated_power_save.toFixed(0)}%</span></div>
                    <div className="flex justify-between"><span className="text-text-secondary">Efficiency</span><span className="text-text-primary">x{powerResult.efficiency_score.toFixed(2)}</span></div>
                  </div>
                )}
              </div>
            </div>

            {tuningLoading && (
              <div className="text-text-secondary flex items-center gap-2 text-sm">
                <div className="border-accent-primary size-4 animate-spin rounded-full border-b-2" />
                Tuning in progress...
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'smart_alerts' && (
        <div className="space-y-4">
          <div className="card p-5">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex size-10 items-center justify-center rounded-lg bg-purple-500/20">
                  <IconBell className="size-5 text-purple-400" />
                </div>
                <div>
                  <h3 className="text-text-primary text-sm font-semibold">Smart Alert Engine</h3>
                  <p className="text-text-secondary text-xs">AI-powered noise reduction and adaptive thresholds</p>
                </div>
              </div>
              <div className="flex gap-1">
                <button onClick={() => smartAlertStore.fetchAll()} className="btn-ghost p-1.5" title="Refresh">
                  <IconRefresh className="size-4" />
                </button>
                <button onClick={() => smartAlertStore.resetBaselines()} className="btn-ghost p-1.5 text-xs text-red-400/60 hover:text-red-400" title="Reset baselines">
                  Reset Baselines
                </button>
              </div>
            </div>

            <div className="mb-4 grid grid-cols-2 gap-3 md:grid-cols-4">
              <div className="bg-gpu-800 rounded-lg px-3 py-2">
                <p className="text-text-secondary text-xs">Context</p>
                <p className="text-text-primary text-sm font-medium">{smartAlertStore.context?.context ?? 'Unknown'}</p>
                <p className="text-text-muted text-xs">{(smartAlertStore.context?.confidence ?? 0) >= 0.5 ? 'High confidence' : 'Low confidence'}</p>
              </div>
              <div className="bg-gpu-800 rounded-lg px-3 py-2">
                <p className="text-text-secondary text-xs">Avg Utilization</p>
                <p className="text-text-primary text-sm font-medium">{smartAlertStore.context?.avg_utilization.toFixed(0) ?? '-'}%</p>
              </div>
              <div className="bg-gpu-800 rounded-lg px-3 py-2">
                <p className="text-text-secondary text-xs">Avg Temperature</p>
                <p className="text-text-primary text-sm font-medium">{smartAlertStore.context?.avg_temperature.toFixed(0) ?? '-'}°C</p>
              </div>
              <div className="bg-gpu-800 rounded-lg px-3 py-2">
                <p className="text-text-secondary text-xs">Suppressed Alerts</p>
                <p className="text-text-primary text-sm font-medium">{smartAlertStore.suppressed.reduce((s, a) => s + a.suppress_count, 0)}</p>
              </div>
            </div>
          </div>

          <div className="card p-5">
            <h4 className="text-text-secondary mb-3 text-xs font-semibold uppercase tracking-wider">Learned Baselines</h4>
            {smartAlertStore.baselines.length === 0 ? (
              <p className="text-text-muted text-xs">No baselines learned yet. The engine needs more samples.</p>
            ) : (
              <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                {smartAlertStore.baselines.map((b) => (
                  <div key={b.metric} className="bg-gpu-800 rounded-lg px-3 py-2">
                    <p className="text-accent-primary mb-1 text-xs font-medium capitalize">{b.metric.replace(/_/g, ' ')}</p>
                    <div className="space-y-0.5 text-xs">
                      <div className="flex justify-between">
                        <span className="text-text-secondary">Mean</span>
                        <span className="text-text-primary font-mono">{b.mean.toFixed(1)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-text-secondary">Std Dev</span>
                        <span className="text-text-primary font-mono">{b.std_dev.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-text-secondary">Range</span>
                        <span className="text-text-primary font-mono">{b.min.toFixed(0)} – {b.max.toFixed(0)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-text-secondary">Samples</span>
                        <span className="text-text-primary font-mono">{b.sample_count}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="card p-5">
            <h4 className="text-text-secondary mb-3 text-xs font-semibold uppercase tracking-wider">Configuration</h4>
            <div className="max-w-md space-y-3">
              <label className="flex cursor-pointer items-center gap-2">
                <input
                  type="checkbox"
                  checked={smartAlertStore.config?.enabled ?? true}
                  onChange={(e) => {
                    if (smartAlertStore.config) {
                      smartAlertStore.updateConfig({ ...smartAlertStore.config, enabled: e.target.checked });
                    }
                  }}
                  className="border-gpu-600 bg-gpu-800 accent-accent-primary rounded"
                />
                <span className="text-text-primary text-sm">Enable Smart Alerts</span>
              </label>
              <label className="flex cursor-pointer items-center gap-2">
                <input
                  type="checkbox"
                  checked={smartAlertStore.config?.context_aware ?? true}
                  onChange={(e) => {
                    if (smartAlertStore.config) {
                      smartAlertStore.updateConfig({ ...smartAlertStore.config, context_aware: e.target.checked });
                    }
                  }}
                  className="border-gpu-600 bg-gpu-800 accent-accent-primary rounded"
                />
                <span className="text-text-primary text-sm">Context-aware filtering</span>
              </label>
              <label className="flex cursor-pointer items-center gap-2">
                <input
                  type="checkbox"
                  checked={smartAlertStore.config?.suppress_duplicates ?? true}
                  onChange={(e) => {
                    if (smartAlertStore.config) {
                      smartAlertStore.updateConfig({ ...smartAlertStore.config, suppress_duplicates: e.target.checked });
                    }
                  }}
                  className="border-gpu-600 bg-gpu-800 accent-accent-primary rounded"
                />
                <span className="text-text-primary text-sm">Suppress duplicate alerts</span>
              </label>
              <div>
                <label className="text-text-secondary mb-1 block text-xs font-medium">Adaptive Sensitivity ({smartAlertStore.config?.adaptive_sensitivity.toFixed(1) ?? '1.0'})</label>
                <input
                  type="range"
                  min="0.1"
                  max="3.0"
                  step="0.1"
                  value={smartAlertStore.config?.adaptive_sensitivity ?? 1.0}
                  onChange={(e) => {
                    if (smartAlertStore.config) {
                      smartAlertStore.updateConfig({ ...smartAlertStore.config, adaptive_sensitivity: parseFloat(e.target.value) });
                    }
                  }}
                  className="slider-gpu w-full"
                />
                <div className="text-text-muted flex justify-between text-xs">
                  <span>Strict</span>
                  <span>Relaxed</span>
                </div>
              </div>
            </div>
          </div>

          {smartAlertStore.suppressed.length > 0 && (
            <div className="card p-5">
              <h4 className="text-text-secondary mb-3 text-xs font-semibold uppercase tracking-wider">Suppressed Alerts</h4>
              <div className="space-y-1">
                {smartAlertStore.suppressed.filter(s => s.suppress_count > 0).map((s, i) => (
                  <div key={`${s.rule_id}-${i}`} className="bg-gpu-800 flex items-center justify-between rounded-lg px-3 py-2">
                    <div>
                      <p className="text-text-primary text-xs">{s.message}</p>
                      <p className="text-text-muted text-xs">Suppressed {s.suppress_count} times</p>
                    </div>
                    <span className="text-xs text-emerald-400">-{s.suppress_count}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
