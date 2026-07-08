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
    smartAlertStore.fetchAll();
  }, [fetchAnomalies, fetchSuggestions]);

  const handlePredict = () => {
    predictTemp(selectedGpu);
    predictUtil(selectedGpu);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="section-header">
          <h2 className="text-lg font-semibold text-text-primary">AI Insights</h2>
          <p className="text-sm text-text-secondary mt-1">Anomaly detection, predictions, and optimization suggestions</p>
        </div>
        <button
          onClick={runAnalysis}
          disabled={analyzing}
          className="btn-primary text-xs px-4 py-1.5"
        >
          {analyzing ? 'Analyzing...' : 'Run Analysis'}
        </button>
      </div>

      {error && (
        <div className="px-4 py-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
          {error}
          <button onClick={clearError} className="float-right text-red-400/70 hover:text-red-400">&times;</button>
        </div>
      )}

      <div className="flex gap-1 border-b border-gpu-800">
        <button onClick={() => setActiveTab('anomalies')} className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${activeTab === 'anomalies' ? 'border-accent-primary text-text-primary' : 'border-transparent text-text-secondary'}`}>
          Anomalies ({anomalies.length})
        </button>
        <button onClick={() => setActiveTab('predictions')} className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${activeTab === 'predictions' ? 'border-accent-primary text-text-primary' : 'border-transparent text-text-secondary'}`}>
          Predictions
        </button>
        <button onClick={() => setActiveTab('suggestions')} className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${activeTab === 'suggestions' ? 'border-accent-primary text-text-primary' : 'border-transparent text-text-secondary'}`}>
          Suggestions ({suggestions.filter(s => !s.applied).length})
        </button>
        <button onClick={() => setActiveTab('tuning')} className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${activeTab === 'tuning' ? 'border-accent-primary text-text-primary' : 'border-transparent text-text-secondary'}`}>
          Auto-Tuning
        </button>
        <button onClick={() => setActiveTab('smart_alerts')} className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${activeTab === 'smart_alerts' ? 'border-accent-primary text-text-primary' : 'border-transparent text-text-secondary'}`}>
          Smart Alerts
        </button>
      </div>

      {activeTab === 'anomalies' && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <button onClick={() => clearAnomalies()} className="btn-ghost text-xs px-3 py-1.5 text-red-400/60 hover:text-red-400">
              <IconTrash2 className="w-3.5 h-3.5 mr-1 inline" />
              Clear All
            </button>
          </div>
          {anomalies.length === 0 ? (
            <div className="card p-8 text-center">
              <IconZap className="w-12 h-12 mx-auto text-text-muted mb-3" />
              <p className="text-text-secondary text-sm">No anomalies detected. Run an analysis to check your GPUs.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {[...anomalies].reverse().map((a) => (
                <div key={a.id} className={`card p-4 border-l-4 ${a.severity === 'Critical' ? 'border-l-red-500' : a.severity === 'High' ? 'border-l-orange-500' : a.severity === 'Medium' ? 'border-l-yellow-500' : 'border-l-blue-500'}`}>
                  <div className="flex items-start justify-between">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`text-xs px-2 py-0.5 rounded ${severityColor(a.severity)}`}>
                          {a.severity}
                        </span>
                        <span className="text-xs text-text-secondary">{a.anomaly_type.replace(/([A-Z])/g, ' $1').trim()}</span>
                        <span className="text-xs text-text-muted">{a.gpu_id}</span>
                      </div>
                      <p className="text-sm text-text-primary">{a.message}</p>
                      <p className="text-xs text-text-muted mt-1">{formatDate(a.timestamp)}</p>
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
            <div className="flex items-center gap-3 mb-4">
              <select
                value={selectedGpu}
                onChange={(e) => setSelectedGpu(e.target.value)}
                className="px-3 py-2 rounded-lg bg-gpu-800 border border-gpu-700 text-text-primary text-sm"
              >
                <option value="gpu_0">GPU 0</option>
                <option value="gpu_1">GPU 1</option>
              </select>
              <button onClick={handlePredict} className="btn-primary text-xs px-4 py-2">
                <IconRefresh className="w-3.5 h-3.5 mr-1 inline" />
                Predict
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {tempPrediction ? (
                <div className="px-4 py-3 rounded-lg bg-gpu-800">
                  <h4 className="text-xs font-medium text-text-secondary mb-2">Temperature Forecast</h4>
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
                <div className="px-4 py-3 rounded-lg bg-gpu-800 text-text-secondary text-sm flex items-center justify-center">
                  Run a prediction to see temperature forecast
                </div>
              )}

              {utilPrediction ? (
                <div className="px-4 py-3 rounded-lg bg-gpu-800">
                  <h4 className="text-xs font-medium text-text-secondary mb-2">Utilization Forecast</h4>
                  <div className="space-y-1.5 text-sm">
                    <div className="flex justify-between">
                      <span className="text-text-secondary">Current</span>
                      <span className="text-text-primary font-mono">{utilPrediction.current_value.toFixed(1)}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-text-secondary">5 min</span>
                      <span className="font-mono text-text-primary">{utilPrediction.predicted_in_5m.toFixed(1)}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-text-secondary">15 min</span>
                      <span className="font-mono text-text-primary">{utilPrediction.predicted_in_15m.toFixed(1)}%</span>
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
                <div className="px-4 py-3 rounded-lg bg-gpu-800 text-text-secondary text-sm flex items-center justify-center">
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
              <IconSettings className="w-12 h-12 mx-auto text-text-muted mb-3" />
              <p className="text-text-secondary text-sm">No optimization suggestions yet. Run an analysis first.</p>
            </div>
          ) : (
            suggestions.map((s) => (
              <div key={s.id} className={`card p-4 ${s.applied ? 'opacity-50' : ''}`}>
                <div className="flex items-start justify-between">
                  <div className="min-w-0 space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs px-2 py-0.5 rounded bg-accent-primary/10 text-accent-primary">
                        {s.category.replace(/([A-Z])/g, ' $1').trim()}
                      </span>
                      {s.applied && (
                        <span className="text-xs px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400">Applied</span>
                      )}
                    </div>
                    <p className="text-sm font-medium text-text-primary">{s.title}</p>
                    <p className="text-xs text-text-secondary">{s.description}</p>
                    <p className="text-xs text-emerald-400">{s.potential_benefit}</p>
                    <p className="text-xs text-text-muted">
                      Confidence: {(s.confidence * 100).toFixed(0)}% &middot; {formatDate(s.timestamp)}
                    </p>
                  </div>
                  {!s.applied && (
                    <button onClick={() => dismissSuggestion(s.id)} className="btn-ghost text-xs p-1.5 text-emerald-400/60 hover:text-emerald-400">
                      <IconCheck className="w-4 h-4" />
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
            <div className="flex items-center gap-3 mb-4">
              <IconSliders className="w-5 h-5 text-accent-primary" />
              <h3 className="text-sm font-semibold text-text-primary">Auto-Tuner</h3>
              <select
                value={selectedGpu}
                onChange={(e) => setSelectedGpu(e.target.value)}
                className="ml-auto px-2 py-1.5 rounded bg-gpu-800 border border-gpu-700 text-text-primary text-sm"
              >
                <option value="gpu_0">GPU 0</option>
              </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div className="px-4 py-3 rounded-lg bg-gpu-800">
                <h4 className="text-xs font-medium text-text-secondary mb-2">Fan Curve</h4>
                <p className="text-xs text-text-secondary mb-2">Analyze your GPU's thermal behavior and generate an optimal fan curve</p>
                <button
                  onClick={async () => {
                    setTuningLoading(true);
                    const result = await aiService.tuneFanCurve(selectedGpu);
                    setFanCurveResult(result);
                    setTuningLoading(false);
                  }}
                  disabled={tuningLoading}
                  className="btn-primary text-xs px-3 py-1.5"
                >
                  Tune Fan Curve
                </button>
                {fanCurveResult && (
                  <div className="mt-2 space-y-1 text-xs">
                    <p className="text-text-secondary">Est. max temp: <span className="text-text-primary">{fanCurveResult.estimated_max_temp.toFixed(0)}°C</span></p>
                    <p className="text-text-secondary">Noise: <span className="text-text-primary">{fanCurveResult.estimated_noise_level}</span></p>
                    <div className="mt-1 space-y-0.5">
                      {fanCurveResult.points.filter(p => p.temperature >= 40).map((p, i) => (
                        <div key={i} className="flex justify-between text-text-muted">
                          <span>{p.temperature.toFixed(0)}°C</span>
                          <span className="text-text-primary">{p.fan_speed.toFixed(0)}%</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="px-4 py-3 rounded-lg bg-gpu-800">
                <h4 className="text-xs font-medium text-text-secondary mb-2">Clock Offsets</h4>
                <p className="text-xs text-text-secondary mb-2">Find safe core and memory clock offsets based on your GPU's thermal headroom</p>
                <button
                  onClick={async () => {
                    setTuningLoading(true);
                    const result = await aiService.tuneClockOffsets(selectedGpu);
                    setClockResult(result);
                    setTuningLoading(false);
                  }}
                  disabled={tuningLoading}
                  className="btn-primary text-xs px-3 py-1.5"
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

              <div className="px-4 py-3 rounded-lg bg-gpu-800">
                <h4 className="text-xs font-medium text-text-secondary mb-2">Power Limit</h4>
                <p className="text-xs text-text-secondary mb-2">Optimize power limit for best efficiency or performance</p>
                <div className="flex items-center gap-2 mb-2">
                  <input
                    type="number"
                    value={maxPower}
                    onChange={(e) => setMaxPower(Number(e.target.value))}
                    className="w-20 px-2 py-1 rounded bg-gpu-700 border border-gpu-600 text-text-primary text-xs"
                  />
                  <span className="text-xs text-text-secondary">W max</span>
                </div>
                <button
                  onClick={async () => {
                    setTuningLoading(true);
                    const result = await aiService.tunePowerLimit(selectedGpu, maxPower);
                    setPowerResult(result);
                    setTuningLoading(false);
                  }}
                  disabled={tuningLoading}
                  className="btn-primary text-xs px-3 py-1.5"
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
              <div className="flex items-center gap-2 text-sm text-text-secondary">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-accent-primary" />
                Tuning in progress...
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'smart_alerts' && (
        <div className="space-y-4">
          <div className="card p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center">
                  <IconBell className="w-5 h-5 text-purple-400" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-text-primary">Smart Alert Engine</h3>
                  <p className="text-xs text-text-secondary">AI-powered noise reduction and adaptive thresholds</p>
                </div>
              </div>
              <div className="flex gap-1">
                <button onClick={() => smartAlertStore.fetchAll()} className="btn-ghost p-1.5" title="Refresh">
                  <IconRefresh className="w-4 h-4" />
                </button>
                <button onClick={() => smartAlertStore.resetBaselines()} className="btn-ghost p-1.5 text-xs text-red-400/60 hover:text-red-400" title="Reset baselines">
                  Reset Baselines
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
              <div className="px-3 py-2 rounded-lg bg-gpu-800">
                <p className="text-xs text-text-secondary">Context</p>
                <p className="text-sm font-medium text-text-primary">{smartAlertStore.context?.context ?? 'Unknown'}</p>
                <p className="text-xs text-text-muted">{(smartAlertStore.context?.confidence ?? 0) >= 0.5 ? 'High confidence' : 'Low confidence'}</p>
              </div>
              <div className="px-3 py-2 rounded-lg bg-gpu-800">
                <p className="text-xs text-text-secondary">Avg Utilization</p>
                <p className="text-sm font-medium text-text-primary">{smartAlertStore.context?.avg_utilization.toFixed(0) ?? '-'}%</p>
              </div>
              <div className="px-3 py-2 rounded-lg bg-gpu-800">
                <p className="text-xs text-text-secondary">Avg Temperature</p>
                <p className="text-sm font-medium text-text-primary">{smartAlertStore.context?.avg_temperature.toFixed(0) ?? '-'}°C</p>
              </div>
              <div className="px-3 py-2 rounded-lg bg-gpu-800">
                <p className="text-xs text-text-secondary">Suppressed Alerts</p>
                <p className="text-sm font-medium text-text-primary">{smartAlertStore.suppressed.reduce((s, a) => s + a.suppress_count, 0)}</p>
              </div>
            </div>
          </div>

          <div className="card p-5">
            <h4 className="text-xs font-semibold text-text-secondary uppercase tracking-wider mb-3">Learned Baselines</h4>
            {smartAlertStore.baselines.length === 0 ? (
              <p className="text-xs text-text-muted">No baselines learned yet. The engine needs more samples.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {smartAlertStore.baselines.map((b) => (
                  <div key={b.metric} className="px-3 py-2 rounded-lg bg-gpu-800">
                    <p className="text-xs font-medium text-accent-primary mb-1 capitalize">{b.metric.replace(/_/g, ' ')}</p>
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
            <h4 className="text-xs font-semibold text-text-secondary uppercase tracking-wider mb-3">Configuration</h4>
            <div className="space-y-3 max-w-md">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={smartAlertStore.config?.enabled ?? true}
                  onChange={(e) => {
                    if (smartAlertStore.config) {
                      smartAlertStore.updateConfig({ ...smartAlertStore.config, enabled: e.target.checked });
                    }
                  }}
                  className="rounded border-gpu-600 bg-gpu-800 accent-accent-primary"
                />
                <span className="text-sm text-text-primary">Enable Smart Alerts</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={smartAlertStore.config?.context_aware ?? true}
                  onChange={(e) => {
                    if (smartAlertStore.config) {
                      smartAlertStore.updateConfig({ ...smartAlertStore.config, context_aware: e.target.checked });
                    }
                  }}
                  className="rounded border-gpu-600 bg-gpu-800 accent-accent-primary"
                />
                <span className="text-sm text-text-primary">Context-aware filtering</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={smartAlertStore.config?.suppress_duplicates ?? true}
                  onChange={(e) => {
                    if (smartAlertStore.config) {
                      smartAlertStore.updateConfig({ ...smartAlertStore.config, suppress_duplicates: e.target.checked });
                    }
                  }}
                  className="rounded border-gpu-600 bg-gpu-800 accent-accent-primary"
                />
                <span className="text-sm text-text-primary">Suppress duplicate alerts</span>
              </label>
              <div>
                <label className="block text-xs font-medium text-text-secondary mb-1">Adaptive Sensitivity ({smartAlertStore.config?.adaptive_sensitivity.toFixed(1) ?? '1.0'})</label>
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
                <div className="flex justify-between text-xs text-text-muted">
                  <span>Strict</span>
                  <span>Relaxed</span>
                </div>
              </div>
            </div>
          </div>

          {smartAlertStore.suppressed.length > 0 && (
            <div className="card p-5">
              <h4 className="text-xs font-semibold text-text-secondary uppercase tracking-wider mb-3">Suppressed Alerts</h4>
              <div className="space-y-1">
                {smartAlertStore.suppressed.filter(s => s.suppress_count > 0).map((s, i) => (
                  <div key={`${s.rule_id}-${i}`} className="px-3 py-2 rounded-lg bg-gpu-800 flex items-center justify-between">
                    <div>
                      <p className="text-xs text-text-primary">{s.message}</p>
                      <p className="text-xs text-text-muted">Suppressed {s.suppress_count} times</p>
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
