import { useEffect, useState } from 'react';
import { useAutomationStore } from '../stores/automationStore';
import type { Rule, Condition, AutomationAction } from '../services/automationService';

const METRICS = [
  { key: 'temperature', label: 'Temperature', unit: '°C' },
  { key: 'fan_speed', label: 'Fan Speed', unit: '%' },
  { key: 'power_watts', label: 'Power', unit: 'W' },
  { key: 'core_util', label: 'GPU Utilization', unit: '%' },
  { key: 'core_clock', label: 'Core Clock', unit: 'MHz' },
  { key: 'memory_clock', label: 'Memory Clock', unit: 'MHz' },
  { key: 'core_voltage', label: 'Voltage', unit: 'mV' },
];

const COMPARISONS = [
  { key: 'gt', label: '>' },
  { key: 'gte', label: '>=' },
  { key: 'lt', label: '<' },
  { key: 'lte', label: '<=' },
  { key: 'eq', label: '=' },
  { key: 'between', label: 'Between' },
];

const TRIGGER_TYPES = [
  { key: 'continuous', label: 'Continuous (every N sec)' },
  { key: 'schedule', label: 'Cron Schedule' },
];

function ActionLabel({ action }: { action: AutomationAction }) {
  const tag = Object.keys(action)[0];
  const val = Object.values(action)[0] as Record<string, unknown>;
  const details = Object.entries(val).map(([k, v]) => `${k}=${v}`).join(', ');
  return <span style={{color: 'var(--ac-text-secondary)'}}>{tag} ({details})</span>;
}

function ConditionLabel({ condition }: { condition: Condition }) {
  const metric = METRICS.find((m) => m.key === condition.metric);
  const m = metric?.label ?? condition.metric;
  const comp = COMPARISONS.find((c) => c.key === condition.comparison.toLowerCase().slice(0, 2))?.label ?? condition.comparison;
  return <span style={{color: 'var(--ac-text-secondary)'}}>{m} {comp} {condition.value}{condition.value_to ? ` - ${condition.value_to}` : ''}</span>;
}

function RuleCard({ rule, onToggle, onDelete }: { rule: Rule; onToggle: () => void; onDelete: () => void }) {
  const triggerLabel = (() => {
    if ('Continuous' in rule.trigger) return `Every ${rule.trigger.Continuous.interval_secs}s`;
    if ('Schedule' in rule.trigger) return `Cron: ${rule.trigger.Schedule.cron}`;
    if ('Event' in rule.trigger) return `On: ${rule.trigger.Event.tag}`;
    return 'Unknown';
  })();

  return (
    <div className="ac-page-card" style={{opacity: !rule.enabled ? 0.4 : 1}}>
      <div className="ac-page-card__body" style={{display: 'flex', flexDirection: 'column', gap: 12}}>
        <div className="ac-page-header">
          <div className="ac-page-header__left">
            <div style={{display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2}}>
              <span style={{color: 'var(--ac-text-primary)', fontWeight: 600, fontSize: 13}}>{rule.name}</span>
              <span style={{color: 'var(--ac-text-dim)', fontFamily: 'var(--ac-font-mono)', fontSize: 10}}>{triggerLabel}</span>
            </div>
            {rule.description && (
              <p style={{color: 'var(--ac-text-muted)', fontSize: 12, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'}}>{rule.description}</p>
            )}
          </div>
          <div className="ac-page-header__right">
            <span style={{color: 'var(--ac-text-dim)', fontFamily: 'var(--ac-font-mono)', fontSize: 10}}>x{rule.execution_count}</span>
            <div className="ac-toggle" onClick={onToggle}>
              <div className={`ac-toggle__track ${rule.enabled ? 'ac-toggle__track--on' : ''}`}>
                <div className="ac-toggle__thumb" />
              </div>
            </div>
            <button onClick={onDelete} className="ac-btn ac-btn--ghost ac-btn--icon" title="Delete" style={{color: '#f55'}}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
              </svg>
            </button>
          </div>
        </div>

        {(rule.conditions.length > 0 || rule.actions.length > 0) && (
          <div style={{display: 'flex', flexDirection: 'column', gap: 4}}>
            {rule.conditions.length > 0 && (
              <div style={{display: 'flex', flexWrap: 'wrap', gap: 4, alignItems: 'center'}}>
                <span style={{color: 'var(--ac-text-dim)', fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 600}}>IF</span>
                {rule.conditions.map((c, i) => (
                  <span key={i} className="ac-badge ac-badge--blue">
                    <ConditionLabel condition={c} />
                  </span>
                ))}
              </div>
            )}
            {rule.actions.length > 0 && (
              <div style={{display: 'flex', flexWrap: 'wrap', gap: 4, alignItems: 'center'}}>
                <span style={{color: 'var(--ac-text-dim)', fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 600}}>THEN</span>
                {rule.actions.map((a, i) => (
                  <span key={i} className="ac-badge ac-badge--green">
                    <ActionLabel action={a} />
                  </span>
                ))}
              </div>
            )}
          </div>
        )}

        {rule.last_triggered_at && (
          <div style={{color: 'var(--ac-text-dim)', fontFamily: 'var(--ac-font-mono)', fontSize: 10}}>
            Last fired: {new Date(rule.last_triggered_at * 1000).toLocaleString()}
          </div>
        )}
      </div>
    </div>
  );
}

export function AutomationPage() {
  const { rules, engineRunning, loading, fetchRules, createRule, deleteRule, toggleRule, startEngine, stopEngine } = useAutomationStore();
  const [showBuilder, setShowBuilder] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [triggerType, setTriggerType] = useState('continuous');
  const [triggerValue, setTriggerValue] = useState('10');
  const [gpuId, setGpuId] = useState('');

  useEffect(() => {
    fetchRules();
  }, [fetchRules]);

  const handleCreate = async () => {
    await createRule(name, description, triggerType, triggerValue, gpuId || undefined);
    setName('');
    setDescription('');
    setShowBuilder(false);
  };

  return (
    <div className="ac-page ac-page--wide">
      <div className="ac-page-card">
        <div className="ac-page-card__body" style={{display: 'flex', flexDirection: 'column', gap: 16}}>
          <div className="ac-page-header">
            <div className="ac-page-header__left">
              <div className="ac-page-header__title">Automation Engine</div>
              <div className="ac-page-header__desc">Create rules that trigger actions based on GPU metrics and schedules</div>
            </div>
            <div className="ac-page-header__right">
              <div style={{display: 'flex', alignItems: 'center', gap: 8}}>
                <span className={`ac-status-dot ${engineRunning ? 'ac-status-dot--on' : 'ac-status-dot--off'}`} />
                <span style={{fontSize: 12, fontWeight: 600, letterSpacing: '0.5px', textTransform: 'uppercase', color: engineRunning ? '#34d399' : 'var(--ac-text-muted)'}}>
                  {engineRunning ? 'Running' : 'Stopped'}
                </span>
              </div>
              {!engineRunning ? (
                <button onClick={startEngine} className="ac-btn ac-btn--primary ac-btn--sm">Start Engine</button>
              ) : (
                <button onClick={stopEngine} className="ac-btn ac-btn--danger ac-btn--sm">Stop Engine</button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="ac-page-card">
        <div className="ac-page-card__header">
          <div className="ac-page-card__title">Rules ({rules.length})</div>
          <div className="ac-page-card__actions">
            <button onClick={() => setShowBuilder(!showBuilder)} className="ac-btn ac-btn--primary ac-btn--sm">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{flexShrink: 0}}>
                <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
              </svg>
              New Rule
            </button>
          </div>
        </div>
      </div>

      {showBuilder && (
        <div className="ac-page-card" style={{borderColor: 'rgba(0,170,220,0.3)'}}>
          <div className="ac-page-card__body" style={{display: 'flex', flexDirection: 'column', gap: 16}}>
            <span style={{color: 'var(--ac-text-secondary)', fontSize: 12, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px'}}>New Automation Rule</span>
            <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16}}>
              <div style={{display: 'flex', flexDirection: 'column', gap: 6}}>
                <label className="ac-label">Rule Name</label>
                <input className="ac-input" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g., Cool down fans" />
              </div>
              <div style={{display: 'flex', flexDirection: 'column', gap: 6}}>
                <label className="ac-label">GPU (optional)</label>
                <input className="ac-input" value={gpuId} onChange={(e) => setGpuId(e.target.value)} placeholder="Leave empty for all" />
              </div>
              <div style={{display: 'flex', flexDirection: 'column', gap: 6}}>
                <label className="ac-label">Trigger Type</label>
                <select className="ac-input ac-select" value={triggerType} onChange={(e) => setTriggerType(e.target.value)}>
                  {TRIGGER_TYPES.map((t) => <option key={t.key} value={t.key}>{t.label}</option>)}
                </select>
              </div>
              <div style={{display: 'flex', flexDirection: 'column', gap: 6}}>
                <label className="ac-label">
                  {triggerType === 'continuous' ? 'Interval (seconds)' : 'Cron Expression'}
                </label>
                <input className="ac-input" value={triggerValue} onChange={(e) => setTriggerValue(e.target.value)}
                  placeholder={triggerType === 'continuous' ? '10' : '*/5 * * * *'} />
              </div>
              <div style={{display: 'flex', flexDirection: 'column', gap: 6, gridColumn: 'span 2'}}>
                <label className="ac-label">Description</label>
                <input className="ac-input" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="What this rule does" />
              </div>
            </div>
            <div style={{display: 'flex', alignItems: 'center', gap: 8, marginTop: 8}}>
              <button onClick={handleCreate} disabled={!name.trim()} className="ac-btn ac-btn--primary ac-btn--sm" style={{opacity: !name.trim() ? 0.5 : 1}}>
                Create Rule
              </button>
              <button onClick={() => setShowBuilder(false)} className="ac-btn ac-btn--secondary ac-btn--sm">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {loading ? (
        <div className="ac-page-card">
          <div className="ac-page-card__body" style={{padding: 32, textAlign: 'center'}}>
            <span style={{color: 'var(--ac-text-muted)', fontSize: 12}}>Loading...</span>
          </div>
        </div>
      ) : rules.length === 0 ? (
        <div className="ac-page-card">
          <div className="ac-page-card__body" style={{padding: 32, textAlign: 'center'}}>
            <span style={{color: 'var(--ac-text-muted)', fontSize: 12}}>No automation rules yet. Click &quot;New Rule&quot; to create one.</span>
          </div>
        </div>
      ) : (
        <div style={{display: 'flex', flexDirection: 'column', gap: 8}}>
          {rules.map((rule) => (
            <RuleCard
              key={rule.id}
              rule={rule}
              onToggle={() => toggleRule(rule.id, !rule.enabled)}
              onDelete={() => deleteRule(rule.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
