import { useEffect, useState } from 'react';
import { useAiStore } from '../stores/aiStore';
import { IconZap, IconRefresh, IconTrash2, IconCheck, IconSettings } from '../components/base/Icons';

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
  const [selectedGpu, setSelectedGpu] = useState('gpu_0');
  const [activeTab, setActiveTab] = useState<'anomalies' | 'predictions' | 'suggestions'>('anomalies');

  useEffect(() => {
    fetchAnomalies();
    fetchSuggestions();
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
    </div>
  );
}
