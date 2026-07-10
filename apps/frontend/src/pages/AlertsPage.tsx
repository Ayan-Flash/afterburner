import { useEffect, useState } from 'react';
import { useAlertStore } from '../stores';
import { alertService } from '../services';

export function AlertsPage() {
  const { alerts, rules, setAlerts, setRules, removeRule, acknowledgeAlert, clearAlerts } = useAlertStore();
  const [filter, setFilter] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const [history, fetchedRules] = await Promise.all([
          alertService.getHistory(100),
          alertService.getRules(),
        ]);
        setAlerts(history);
        setRules(fetchedRules);
      } catch { /* ignore */ }
    })();
  }, [setAlerts, setRules]);

  const filteredAlerts = filter
    ? alerts.filter((a) => a.severity === filter)
    : alerts;

  const severityBadge = (severity: string) => {
    switch (severity) {
      case 'Critical': return 'badge-red';
      case 'Warning': return 'badge-yellow';
      default: return 'badge-blue';
    }
  };

  const filteredCounts = {
    all: alerts.length,
    Critical: alerts.filter((a) => a.severity === 'Critical').length,
    Warning: alerts.filter((a) => a.severity === 'Warning').length,
    Info: alerts.filter((a) => a.severity === 'Info').length,
  };

  return (
    <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
      <div className="flex flex-col gap-4">
        <div className="section-header">
          <span className="section-title">Alert Rules</span>
        </div>
        {rules.length === 0 ? (
          <div className="card p-4">
            <span className="text-text-muted text-xs">No alert rules configured</span>
          </div>
        ) : (
          rules.map((rule) => (
            <div key={rule.id} className="card flex items-center justify-between p-3.5">
              <div className="flex flex-col gap-0.5">
                <span className="text-text-primary text-sm font-medium">{rule.metric}</span>
                <span className="text-text-muted font-mono text-[11px]">
                  {rule.condition} {rule.threshold} <span className="text-text-dim">|</span> {rule.gpu_id}
                </span>
              </div>
              <button onClick={() => removeRule(rule.id)}
                className="btn-ghost p-1.5 text-xs text-red-400 hover:text-red-300">
                Remove
              </button>
            </div>
          ))
        )}
      </div>

      <div className="flex flex-col gap-4">
        <div className="section-header">
          <span className="section-title">Alert History</span>
          <button onClick={clearAlerts}
            className="text-text-muted hover:text-text-secondary text-[10px] uppercase tracking-wider transition-colors">
            Clear All
          </button>
        </div>

        <div className="flex gap-1.5">
          {(['all', 'Critical', 'Warning', 'Info'] as const).map((f) => (
            <button key={f}
              onClick={() => setFilter(f === 'all' ? null : f)}
              className={`rounded-md px-2.5 py-1 text-[10px] font-medium uppercase tracking-wider transition-all duration-150 ${
                (f === 'all' && !filter) || filter === f
                  ? 'bg-accent-glow text-accent-bright border-accent/30 border'
                  : 'text-text-muted bg-gpu-700/50 border-gpu-600 hover:border-gpu-500 border'
              }`}
            >
              {f} {filteredCounts[f as keyof typeof filteredCounts] > 0 && (
                <span className="bg-gpu-700 ml-1 rounded px-1 py-0.5">{filteredCounts[f as keyof typeof filteredCounts]}</span>
              )}
            </button>
          ))}
        </div>

        {filteredAlerts.length === 0 ? (
          <div className="card p-4">
            <span className="text-text-muted text-xs">No alerts to show</span>
          </div>
        ) : (
          [...filteredAlerts].reverse().slice(0, 50).map((alert) => (
            <div key={alert.id}
              className={`card flex items-start gap-3 p-3 transition-opacity duration-200 ${alert.acknowledged ? 'opacity-40' : ''}`}
            >
              <span className={`${severityBadge(alert.severity)} mt-0.5 flex-shrink-0`}>
                {alert.severity}
              </span>
              <div className="min-w-0 flex-1">
                <div className="text-text-primary text-sm">{alert.message}</div>
                <div className="text-text-muted mt-0.5 font-mono text-[10px]">
                  {new Date(alert.timestamp).toLocaleString()}
                </div>
              </div>
              {!alert.acknowledged && (
                <button onClick={() => acknowledgeAlert(alert.id)}
                  className="btn-ghost p-1 text-xs" title="Acknowledge">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </button>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
