import { useEffect } from 'react';
import { useAlertStore } from '../stores';
import { alertService } from '../services';

export function AlertsPage() {
  const { alerts, rules, setAlerts, setRules, removeRule, acknowledgeAlert, clearAlerts } = useAlertStore();

  useEffect(() => {
    (async () => {
      try {
        const [history, fetchedRules] = await Promise.all([
          alertService.getHistory(100),
          alertService.getRules(),
        ]);
        setAlerts(history);
        setRules(fetchedRules);
      } catch {
        // ignore
      }
    })();
  }, []);

  const severityColor = (severity: string) => {
    switch (severity) {
      case 'Critical': return 'text-red-400 bg-red-500/10 border-red-500/30';
      case 'Warning': return 'text-yellow-400 bg-yellow-500/10 border-yellow-500/30';
      default: return 'text-blue-400 bg-blue-500/10 border-blue-500/30';
    }
  };

  const handleRemoveRule = async (ruleId: string) => {
    try {
      await alertService.removeRule(ruleId);
      removeRule(ruleId);
    } catch {
      // ignore
    }
  };

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      <div className="flex flex-col gap-4">
        <h3 className="text-sm font-semibold text-surface-200">Alert Rules</h3>
        {rules.length === 0 ? (
          <div className="card text-sm text-surface-500">No alert rules configured</div>
        ) : (
          rules.map((rule) => (
            <div key={rule.id} className="card flex items-center justify-between">
              <div className="flex flex-col">
                <span className="text-sm font-medium text-surface-200">{rule.metric}</span>
                <span className="text-xs text-surface-400">
                  {rule.condition} {rule.threshold} | {rule.gpu_id}
                </span>
              </div>
              <button
                onClick={() => handleRemoveRule(rule.id)}
                className="text-xs text-red-400 hover:text-red-300"
              >
                Remove
              </button>
            </div>
          ))
        )}
      </div>

      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-surface-200">Alert History</h3>
          <div className="flex gap-2">
            <button onClick={clearAlerts} className="text-xs text-surface-500 hover:text-surface-300">
              Clear
            </button>
          </div>
        </div>

        {alerts.length === 0 ? (
          <div className="card text-sm text-surface-500">No alerts yet</div>
        ) : (
          [...alerts].reverse().map((alert) => (
            <div
              key={alert.id}
              className={`card flex items-start gap-3 ${
                alert.acknowledged ? 'opacity-50' : ''
              }`}
            >
              <span
                className={`rounded border px-2 py-0.5 text-[10px] font-medium ${severityColor(alert.severity)}`}
              >
                {alert.severity}
              </span>
              <div className="flex-1">
                <div className="text-sm text-surface-200">{alert.message}</div>
                <div className="text-[10px] text-surface-500">
                  {new Date(alert.timestamp).toLocaleTimeString()}
                </div>
              </div>
              {!alert.acknowledged && (
                <button
                  onClick={() => acknowledgeAlert(alert.id)}
                  className="rounded px-2 py-1 text-xs text-surface-400 hover:bg-surface-700"
                >
                  Ack
                </button>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
