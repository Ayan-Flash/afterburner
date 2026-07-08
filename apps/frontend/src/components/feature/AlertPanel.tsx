import { useAlertStore } from '../../stores';

export function AlertPanel() {
  const { alerts, unacknowledgedCount, acknowledgeAlert, clearAlerts } = useAlertStore();

  const severityColor = (severity: string) => {
    switch (severity) {
      case 'Critical': return 'text-red-400 bg-red-500/10';
      case 'Warning': return 'text-yellow-400 bg-yellow-500/10';
      default: return 'text-blue-400 bg-blue-500/10';
    }
  };

  if (alerts.length === 0) {
    return (
      <div className="card text-center text-sm text-surface-500">
        No alerts
      </div>
    );
  }

  return (
    <div className="card flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-surface-200">Alerts</span>
          {unacknowledgedCount > 0 && (
            <span className="rounded-full bg-red-500/20 px-2 py-0.5 text-[10px] font-medium text-red-400">
              {unacknowledgedCount}
            </span>
          )}
        </div>
        <button onClick={clearAlerts} className="text-xs text-surface-500 hover:text-surface-300">
          Clear
        </button>
      </div>

      <div className="flex max-h-48 flex-col gap-1 overflow-y-auto">
        {[...alerts].reverse().map((alert) => (
          <div
            key={alert.id}
            className={`flex items-start gap-2 rounded-lg px-3 py-2 text-xs ${
              alert.acknowledged ? 'opacity-50' : ''
            }`}
          >
            <span
              className={`rounded px-1.5 py-0.5 text-[10px] font-medium ${severityColor(alert.severity)}`}
            >
              {alert.severity}
            </span>
            <span className="flex-1 text-surface-300">{alert.message}</span>
            {!alert.acknowledged && (
              <button
                onClick={() => acknowledgeAlert(alert.id)}
                className="text-surface-500 hover:text-surface-300"
              >
                ✓
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
