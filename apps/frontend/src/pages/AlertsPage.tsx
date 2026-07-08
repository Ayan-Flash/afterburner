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
  }, []);

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
            <span className="text-xs text-text-muted">No alert rules configured</span>
          </div>
        ) : (
          rules.map((rule) => (
            <div key={rule.id} className="card p-3.5 flex items-center justify-between">
              <div className="flex flex-col gap-0.5">
                <span className="text-sm font-medium text-text-primary">{rule.metric}</span>
                <span className="text-[11px] text-text-muted font-mono">
                  {rule.condition} {rule.threshold} <span className="text-text-dim">|</span> {rule.gpu_id}
                </span>
              </div>
              <button onClick={() => removeRule(rule.id)}
                className="btn-ghost p-1.5 text-red-400 hover:text-red-300 text-xs">
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
            className="text-[10px] text-text-muted hover:text-text-secondary uppercase tracking-wider transition-colors">
            Clear All
          </button>
        </div>

        <div className="flex gap-1.5">
          {(['all', 'Critical', 'Warning', 'Info'] as const).map((f) => (
            <button key={f}
              onClick={() => setFilter(f === 'all' ? null : f)}
              className={`px-2.5 py-1 rounded-md text-[10px] font-medium uppercase tracking-wider transition-all duration-150 ${
                (f === 'all' && !filter) || filter === f
                  ? 'bg-accent-glow text-accent-bright border border-accent/30'
                  : 'text-text-muted bg-gpu-700/50 border border-gpu-600 hover:border-gpu-500'
              }`}
            >
              {f} {filteredCounts[f as keyof typeof filteredCounts] > 0 && (
                <span className="ml-1 px-1 py-0.5 rounded bg-gpu-700">{filteredCounts[f as keyof typeof filteredCounts]}</span>
              )}
            </button>
          ))}
        </div>

        {filteredAlerts.length === 0 ? (
          <div className="card p-4">
            <span className="text-xs text-text-muted">No alerts to show</span>
          </div>
        ) : (
          [...filteredAlerts].reverse().slice(0, 50).map((alert) => (
            <div key={alert.id}
              className={`card p-3 flex items-start gap-3 transition-opacity duration-200 ${alert.acknowledged ? 'opacity-40' : ''}`}
            >
              <span className={`${severityBadge(alert.severity)} flex-shrink-0 mt-0.5`}>
                {alert.severity}
              </span>
              <div className="flex-1 min-w-0">
                <div className="text-sm text-text-primary">{alert.message}</div>
                <div className="text-[10px] text-text-muted mt-0.5 font-mono">
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
