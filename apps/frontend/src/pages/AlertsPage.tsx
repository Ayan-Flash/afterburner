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
      case 'Critical': return 'ac-badge--red';
      case 'Warning': return 'ac-badge--yellow';
      default: return 'ac-badge--blue';
    }
  };

  const filteredCounts = {
    all: alerts.length,
    Critical: alerts.filter((a) => a.severity === 'Critical').length,
    Warning: alerts.filter((a) => a.severity === 'Warning').length,
    Info: alerts.filter((a) => a.severity === 'Info').length,
  };

  const filterBtns = ['all', 'Critical', 'Warning', 'Info'] as const;

  return (
    <div className="ac-page ac-page--wide">
      <div className="ac-page-header">
        <div className="ac-page-header__left">
          <span className="ac-page-header__title">Alerts</span>
          <span className="ac-page-header__desc">Monitor GPU conditions with custom alert rules</span>
        </div>
      </div>

      <div className="ac-grid-2">
        {/* Alert Rules */}
        <div className="ac-page-card">
          <div className="ac-page-card__header">
            <span className="ac-page-card__title">
              <svg className="ac-page-card__title-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/>
              </svg>
              Alert Rules
            </span>
          </div>
          <div className="ac-page-card__body" style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {rules.length === 0 ? (
              <div className="ac-empty">
                <svg className="ac-empty__icon" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
                </svg>
                <span className="ac-empty__text">No alert rules configured. Create rules in the Automation page.</span>
              </div>
            ) : (
              rules.map((rule) => (
                <div key={rule.id} className="ac-row" style={{ padding: '8px 0' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--ac-text-primary)' }}>{rule.metric}</span>
                    <span style={{ fontSize: 11, color: 'var(--ac-text-muted)', fontFamily: 'var(--ac-font-mono)' }}>
                      {rule.condition} {rule.threshold} &middot; {rule.gpu_id}
                    </span>
                  </div>
                  <button onClick={() => removeRule(rule.id)}
                    className="ac-btn ac-btn--ghost ac-btn--sm" style={{ color: '#f55' }}>
                    Remove
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Alert History */}
        <div className="ac-page-card">
          <div className="ac-page-card__header">
            <span className="ac-page-card__title">
              <svg className="ac-page-card__title-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
              </svg>
              Alert History
            </span>
            <button onClick={clearAlerts}
              className="ac-btn ac-btn--ghost ac-btn--sm">
              Clear All
            </button>
          </div>
          <div className="ac-page-card__body" style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div className="ac-tabs" style={{ borderBottom: 'none', gap: 4 }}>
              {filterBtns.map((f) => (
                <button key={f} onClick={() => setFilter(f === 'all' ? null : f)}
                  className={`ac-tab ${(f === 'all' && !filter) || filter === f ? 'ac-tab--active' : ''}`}
                  style={{ padding: '4px 10px', fontSize: 10 }}>
                  {f} {filteredCounts[f] > 0 && (
                    <span style={{ marginLeft: 4, padding: '1px 5px', borderRadius: 3, background: 'var(--ac-border-subtle)', fontSize: 9 }}>{filteredCounts[f]}</span>
                  )}
                </button>
              ))}
            </div>

            {filteredAlerts.length === 0 ? (
              <div className="ac-empty">
                <svg className="ac-empty__icon" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
                </svg>
                <span className="ac-empty__text">No alerts to show</span>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4, maxHeight: 400, overflowY: 'auto' }}>
                {[...filteredAlerts].reverse().slice(0, 50).map((alert) => (
                  <div key={alert.id}
                    className="ac-row"
                    style={{
                      padding: '8px 10px',
                      opacity: alert.acknowledged ? 0.4 : 1,
                      background: 'var(--ac-bg-input)',
                      borderRadius: 'var(--ac-radius-panel)',
                    }}
                  >
                    <span className={`ac-badge ${severityBadge(alert.severity)}`} style={{ flexShrink: 0 }}>
                      {alert.severity}
                    </span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 12, color: 'var(--ac-text-primary)' }}>{alert.message}</div>
                      <div style={{ fontSize: 10, color: 'var(--ac-text-dim)', fontFamily: 'var(--ac-font-mono)', marginTop: 2 }}>
                        {new Date(alert.timestamp).toLocaleString()}
                      </div>
                    </div>
                    {!alert.acknowledged && (
                      <button onClick={() => acknowledgeAlert(alert.id)}
                        className="ac-btn ac-btn--ghost ac-btn--sm" title="Acknowledge">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
