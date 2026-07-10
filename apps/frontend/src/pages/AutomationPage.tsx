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
  return <span className="text-text-secondary">{tag} ({details})</span>;
}

function ConditionLabel({ condition }: { condition: Condition }) {
  const metric = METRICS.find((m) => m.key === condition.metric);
  const m = metric?.label ?? condition.metric;
  const comp = COMPARISONS.find((c) => c.key === condition.comparison.toLowerCase().slice(0, 2))?.label ?? condition.comparison;
  return <span className="text-text-secondary">{m} {comp} {condition.value}{condition.value_to ? ` - ${condition.value_to}` : ''}</span>;
}

function RuleCard({ rule, onToggle, onDelete }: { rule: Rule; onToggle: () => void; onDelete: () => void }) {
  const triggerLabel = (() => {
    if ('Continuous' in rule.trigger) return `Every ${rule.trigger.Continuous.interval_secs}s`;
    if ('Schedule' in rule.trigger) return `Cron: ${rule.trigger.Schedule.cron}`;
    if ('Event' in rule.trigger) return `On: ${rule.trigger.Event.tag}`;
    return 'Unknown';
  })();

  return (
    <div className={`card flex flex-col gap-3 p-4 transition-opacity ${!rule.enabled ? 'opacity-40' : ''}`}>
      <div className="flex items-start justify-between">
        <div className="min-w-0 flex-1">
          <div className="mb-0.5 flex items-center gap-2">
            <span className="text-text-primary text-sm font-semibold">{rule.name}</span>
            <span className="text-text-dim font-mono text-[10px]">{triggerLabel}</span>
          </div>
          {rule.description && (
            <p className="text-text-muted truncate text-xs">{rule.description}</p>
          )}
        </div>
        <div className="flex flex-shrink-0 items-center gap-2">
          <span className="text-text-dim font-mono text-[10px]">×{rule.execution_count}</span>
          <button
            onClick={onToggle}
            className={`relative inline-flex h-4 w-8 items-center rounded-full transition-colors duration-200 ${rule.enabled ? 'bg-accent' : 'bg-gpu-600'}`}
          >
            <span className={`inline-block size-3 transform rounded-full bg-white transition-transform duration-200 ${rule.enabled ? 'translate-x-[18px]' : 'translate-x-0.5'}`} />
          </button>
          <button onClick={onDelete} className="btn-ghost p-1 text-red-400 hover:text-red-300" title="Delete">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
            </svg>
          </button>
        </div>
      </div>

      {(rule.conditions.length > 0 || rule.actions.length > 0) && (
        <div className="flex flex-col gap-1">
          {rule.conditions.length > 0 && (
            <div className="flex flex-wrap gap-1">
              <span className="text-text-dim mr-1 text-[10px] uppercase tracking-wider">IF</span>
              {rule.conditions.map((c, i) => (
                <span key={i} className="bg-gpu-700 rounded px-1.5 py-0.5 text-[10px]">
                  <ConditionLabel condition={c} />
                </span>
              ))}
            </div>
          )}
          {rule.actions.length > 0 && (
            <div className="flex flex-wrap gap-1">
              <span className="text-text-dim mr-1 text-[10px] uppercase tracking-wider">THEN</span>
              {rule.actions.map((a, i) => (
                <span key={i} className="bg-accent-subtle rounded px-1.5 py-0.5 text-[10px]">
                  <ActionLabel action={a} />
                </span>
              ))}
            </div>
          )}
        </div>
      )}

      {rule.last_triggered_at && (
        <div className="text-text-dim font-mono text-[10px]">
          Last fired: {new Date(rule.last_triggered_at * 1000).toLocaleString()}
        </div>
      )}
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
    <div className="flex max-w-4xl flex-col gap-5">
      <div className="card flex flex-col gap-4 p-5">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-text-primary text-sm font-semibold">Automation Engine</span>
            <p className="text-text-muted mt-0.5 text-xs">Create rules that trigger actions based on GPU metrics and schedules</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <span className={`size-2 rounded-full ${engineRunning ? 'bg-emerald-500 shadow-[0_0_8px_rgba(52,211,153,0.5)]' : 'bg-text-dim'}`} />
              <span className={`text-xs font-semibold uppercase tracking-wider ${engineRunning ? 'text-emerald-400' : 'text-text-muted'}`}>
                {engineRunning ? 'Running' : 'Stopped'}
              </span>
            </div>
            {!engineRunning ? (
              <button onClick={startEngine} className="btn-primary text-xs">Start Engine</button>
            ) : (
              <button onClick={stopEngine} className="btn-danger text-xs">Stop Engine</button>
            )}
          </div>
        </div>
      </div>

      <div className="section-header">
        <span className="section-title">Rules ({rules.length})</span>
        <button onClick={() => setShowBuilder(!showBuilder)} className="btn-primary text-xs">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          New Rule
        </button>
      </div>

      {showBuilder && (
        <div className="card border-accent/30 flex flex-col gap-4 p-5">
          <span className="text-text-secondary text-xs font-semibold uppercase tracking-wider">New Automation Rule</span>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="label">Rule Name</label>
              <input className="input" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g., Cool down fans" />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="label">GPU (optional)</label>
              <input className="input" value={gpuId} onChange={(e) => setGpuId(e.target.value)} placeholder="Leave empty for all" />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="label">Trigger Type</label>
              <select className="input" value={triggerType} onChange={(e) => setTriggerType(e.target.value)}>
                {TRIGGER_TYPES.map((t) => <option key={t.key} value={t.key}>{t.label}</option>)}
              </select>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="label">
                {triggerType === 'continuous' ? 'Interval (seconds)' : 'Cron Expression'}
              </label>
              <input className="input" value={triggerValue} onChange={(e) => setTriggerValue(e.target.value)}
                placeholder={triggerType === 'continuous' ? '10' : '*/5 * * * *'} />
            </div>
            <div className="col-span-2 flex flex-col gap-1.5">
              <label className="label">Description</label>
              <input className="input" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="What this rule does" />
            </div>
          </div>
          <div className="mt-2 flex items-center gap-2">
            <button onClick={handleCreate} disabled={!name.trim()} className="btn-primary text-xs disabled:opacity-50">
              Create Rule
            </button>
            <button onClick={() => setShowBuilder(false)} className="btn-secondary text-xs">Cancel</button>
          </div>
        </div>
      )}

      {loading ? (
        <div className="card p-8 text-center"><span className="text-text-muted text-xs">Loading...</span></div>
      ) : rules.length === 0 ? (
        <div className="card p-8 text-center">
          <span className="text-text-muted text-xs">No automation rules yet. Click &quot;New Rule&quot; to create one.</span>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
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
