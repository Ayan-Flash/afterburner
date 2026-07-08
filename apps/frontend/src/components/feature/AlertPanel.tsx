import { useAlertStore } from '../../stores';

export function AlertPanel() {
  const { alerts, unacknowledgedCount, acknowledgeAlert, clearAlerts } = useAlertStore();

  const severityStyle = (severity: string) => {
    switch (severity) {
      case 'Critical': return 'border-l-red-500 bg-red-500/5';
      case 'Warning': return 'border-l-amber-500 bg-amber-500/5';
      default: return 'border-l-sky-500 bg-sky-500/5';
    }
  };

  if (alerts.length === 0) {
    return (
      <div className="card p-4 text-center">
        <span className="text-xs text-text-muted">No alerts</span>
      </div>
    );
  }

  return (
    <div className="card p-3 flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-text-primary tracking-wide uppercase">Alerts</span>
          {unacknowledgedCount > 0 && (
            <span className="inline-flex items-center justify-center min-w-[18px] h-[18px] rounded-full bg-accent/20 text-accent-bright text-[10px] font-bold px-1">
              {unacknowledgedCount}
            </span>
          )}
        </div>
        <button onClick={clearAlerts} className="text-[10px] text-text-muted hover:text-text-secondary transition-colors uppercase tracking-wider">
          Clear
        </button>
      </div>

      <div className="flex max-h-40 flex-col gap-1 overflow-y-auto">
        {[...alerts].reverse().slice(0, 20).map((alert) => (
          <div
            key={alert.id}
            className={`flex items-start gap-2 rounded-lg border-l-2 px-3 py-2 text-xs ${severityStyle(alert.severity)} ${
              alert.acknowledged ? 'opacity-40' : ''
            }`}
          >
            <span className="flex-1 text-text-secondary leading-relaxed">{alert.message}</span>
            <div className="flex items-center gap-1.5 flex-shrink-0">
              <span className="text-[10px] text-text-dim">{new Date(alert.timestamp).toLocaleTimeString()}</span>
              {!alert.acknowledged && (
                <button
                  onClick={() => acknowledgeAlert(alert.id)}
                  className="w-4 h-4 rounded bg-gpu-700 hover:bg-gpu-600 text-text-muted hover:text-text-secondary flex items-center justify-center transition-colors"
                  title="Acknowledge"
                >
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
