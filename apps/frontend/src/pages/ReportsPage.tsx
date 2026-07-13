import { useEffect, useState } from 'react';
import { useReportingStore } from '../stores/reportingStore';
import { IconFile, IconDownload, IconTrash2, IconRefresh } from '../components/base/Icons';
import type { ReportConfig, TimeRange } from '../services/reportingService';

function formatDate(ts: number) {
  return new Date(ts * 1000).toLocaleString();
}

function formatSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1048576).toFixed(1)} MB`;
}

export function ReportsPage() {
  const { reports, currentReport, loading, generating, error, fetchReports, generate, loadReport, removeReport, clearError } = useReportingStore();
  const [showBuilder, setShowBuilder] = useState(false);
  const [name, setName] = useState('');
  const [rangeType, setRangeType] = useState<'minutes' | 'hours' | 'days'>('hours');
  const [rangeValue, setRangeValue] = useState(1);
  const [includeTemp, setIncludeTemp] = useState(true);
  const [includeClocks, setIncludeClocks] = useState(true);
  const [includeFan, setIncludeFan] = useState(true);
  const [includePower, setIncludePower] = useState(true);
  const [includeUtil, setIncludeUtil] = useState(true);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  const handleGenerate = async () => {
    if (!name.trim()) return;
    const timeRange: TimeRange = rangeType === 'minutes'
      ? { last_minutes: rangeValue }
      : rangeType === 'hours'
        ? { last_hours: rangeValue }
        : { last_days: rangeValue };

    const config: ReportConfig = {
      gpu_ids: [],
      time_range: timeRange,
      format: 'Html',
      include_temperature: includeTemp,
      include_clocks: includeClocks,
      include_fan: includeFan,
      include_power: includePower,
      include_utilization: includeUtil,
      include_voltage: false,
    };

    await generate(name, config);
    setShowBuilder(false);
    setName('');
  };

  return (
    <div className="ac-page">
      <div className="ac-page-header">
        <div className="ac-page-header__left">
          <div className="ac-page-header__title">Performance Reports</div>
          <div className="ac-page-header__desc">Generate and export GPU performance reports</div>
        </div>
        <div className="ac-page-header__right" style={{gap: 8}}>
          <button onClick={() => fetchReports()} className="ac-btn ac-btn--ghost ac-btn--sm">
            <IconRefresh style={{display: 'inline', width: 14, height: 14, marginRight: 6}} />
            Refresh
          </button>
          <button onClick={() => setShowBuilder(!showBuilder)} className="ac-btn ac-btn--primary ac-btn--sm">
            {showBuilder ? 'Cancel' : 'New Report'}
          </button>
        </div>
      </div>

      {error && (
        <div className="ac-banner ac-banner--error">
          {error}
          <button onClick={clearError} className="ac-banner__close">&times;</button>
        </div>
      )}

      {showBuilder && (
        <div className="ac-page-card">
          <div className="ac-page-card__body" style={{display: 'flex', flexDirection: 'column', gap: 16}}>
            <h3 style={{color: 'var(--ac-text-primary)', fontSize: 13, fontWeight: 600}}>Report Builder</h3>

            <div>
              <label className="ac-label">Report Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Gaming Session Report"
                className="ac-input ac-input--wide"
                style={{maxWidth: 400}}
              />
            </div>

            <div style={{display: 'flex', alignItems: 'center', gap: 12}}>
              <div>
                <label className="ac-label">Time Range</label>
                <div style={{display: 'flex', gap: 4}}>
                  <input
                    type="number"
                    value={rangeValue}
                    min={1}
                    onChange={(e) => setRangeValue(Number(e.target.value))}
                    className="ac-input ac-input--sm"
                    style={{width: 80, textAlign: 'center'}}
                  />
                  <select
                    value={rangeType}
                    onChange={(e) => setRangeType(e.target.value as 'minutes' | 'hours' | 'days')}
                    className="ac-input ac-input--sm ac-select"
                  >
                    <option value="minutes">Minutes</option>
                    <option value="hours">Hours</option>
                    <option value="days">Days</option>
                  </select>
                </div>
              </div>
            </div>

            <div>
              <label className="ac-label">Metrics to Include</label>
              <div style={{display: 'flex', flexWrap: 'wrap', gap: 12}}>
                <label className="ac-checkbox">
                  <input type="checkbox" checked={includeTemp} onChange={(e) => setIncludeTemp(e.target.checked)} style={{accentColor: 'var(--ac-accent-cyan)', width: 14, height: 14}} />
                  <span className="ac-checkbox__label">Temperature</span>
                </label>
                <label className="ac-checkbox">
                  <input type="checkbox" checked={includeClocks} onChange={(e) => setIncludeClocks(e.target.checked)} style={{accentColor: 'var(--ac-accent-cyan)', width: 14, height: 14}} />
                  <span className="ac-checkbox__label">Clocks</span>
                </label>
                <label className="ac-checkbox">
                  <input type="checkbox" checked={includeFan} onChange={(e) => setIncludeFan(e.target.checked)} style={{accentColor: 'var(--ac-accent-cyan)', width: 14, height: 14}} />
                  <span className="ac-checkbox__label">Fan</span>
                </label>
                <label className="ac-checkbox">
                  <input type="checkbox" checked={includePower} onChange={(e) => setIncludePower(e.target.checked)} style={{accentColor: 'var(--ac-accent-cyan)', width: 14, height: 14}} />
                  <span className="ac-checkbox__label">Power</span>
                </label>
                <label className="ac-checkbox">
                  <input type="checkbox" checked={includeUtil} onChange={(e) => setIncludeUtil(e.target.checked)} style={{accentColor: 'var(--ac-accent-cyan)', width: 14, height: 14}} />
                  <span className="ac-checkbox__label">Utilization</span>
                </label>
              </div>
            </div>

            <button onClick={handleGenerate} disabled={generating || !name.trim()} className="ac-btn ac-btn--primary" style={{alignSelf: 'flex-start', padding: '6px 24px', fontSize: 13}}>
              {generating ? 'Generating...' : 'Generate Report'}
            </button>
          </div>
        </div>
      )}

      {loading && !reports.length ? (
        <div style={{display: 'flex', height: 128, alignItems: 'center', justifyContent: 'center'}}>
          <div className="ac-spinner" />
        </div>
      ) : reports.length === 0 ? (
        <div className="ac-empty">
          <IconFile className="ac-empty__icon" />
          <div className="ac-empty__text">No reports yet. Generate your first performance report.</div>
        </div>
      ) : (
        <div style={{display: 'flex', flexDirection: 'column', gap: 8}}>
          {reports.map((r) => (
            <div
              key={r.id}
              className="ac-page-card"
              style={{cursor: 'pointer'}}
              onClick={() => loadReport(r.id)}
            >
              <div className="ac-page-card__body">
                <div className="ac-page-header">
                  <div className="ac-page-header__left" style={{display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 12, minWidth: 0}}>
                    <div style={{display: 'flex', width: 36, height: 36, alignItems: 'center', justifyContent: 'center', borderRadius: 8, background: 'rgba(0,170,220,0.1)', flexShrink: 0}}>
                      <IconFile style={{width: 18, height: 18, color: 'var(--ac-accent-cyan-bright)'}} />
                    </div>
                    <div style={{minWidth: 0}}>
                      <p style={{color: 'var(--ac-text-primary)', fontSize: 13, fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'}}>{r.name}</p>
                      <p style={{color: 'var(--ac-text-secondary)', fontSize: 12}}>
                        {formatDate(r.created_at)} &middot; {r.gpu_count} GPU{r.gpu_count !== 1 ? 's' : ''} &middot; {r.sample_count} samples &middot; {formatSize(r.file_size)}
                      </p>
                    </div>
                  </div>
                  <div className="ac-page-header__right" style={{gap: 8}}>
                    <span className="ac-badge ac-badge--blue" style={{textTransform: 'none', fontSize: 12}}>{r.format}</span>
                    <button
                      onClick={(e) => { e.stopPropagation(); removeReport(r.id); }}
                      className="ac-btn ac-btn--ghost ac-btn--icon"
                      style={{color: 'rgba(255,68,68,0.6)'}}
                    >
                      <IconTrash2 style={{width: 14, height: 14}} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {currentReport && (
        <div className="ac-page-card">
          <div className="ac-page-card__header" style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
            <div>
              <h3 style={{color: 'var(--ac-text-primary)', fontSize: 13, fontWeight: 600}}>{currentReport.name}</h3>
              <p style={{color: 'var(--ac-text-secondary)', fontSize: 12}}>{formatDate(currentReport.created_at)}</p>
            </div>
            <div className="ac-page-card__actions" style={{gap: 8}}>
              <button
                onClick={async () => {
                  const { exportReportCsv } = await import('../services/reportingService');
                  const csv = await exportReportCsv(currentReport.id);
                  const blob = new Blob([csv], { type: 'text/csv' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `${currentReport.name.replace(/\s+/g, '_')}.csv`;
                  a.click();
                  URL.revokeObjectURL(url);
                }}
                className="ac-btn ac-btn--secondary ac-btn--sm"
              >
                <IconDownload style={{display: 'inline', width: 14, height: 14, marginRight: 4}} />
                Export CSV
              </button>
            </div>
          </div>

          {currentReport.sections.map((section) => (
            <div key={section.gpu_id} style={{borderBottom: '1px solid var(--ac-border-subtle)', padding: 14}} className={currentReport.sections.indexOf(section) === currentReport.sections.length - 1 ? '' : ''}>
              <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12}}>
                <h4 style={{color: 'var(--ac-text-primary)', fontSize: 13, fontWeight: 500}}>{section.gpu_name}</h4>
                <span style={{color: 'var(--ac-text-secondary)', fontSize: 12}}>
                  {section.sample_count} samples over {section.sampling_duration_secs}s
                </span>
              </div>
              <table style={{width: '100%', fontSize: 13, borderCollapse: 'collapse'}}>
                <thead>
                  <tr style={{color: 'var(--ac-text-secondary)', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.5px'}}>
                    <th style={{padding: '8px 16px 8px 0', textAlign: 'left'}}>Metric</th>
                    <th style={{padding: '8px 8px', textAlign: 'right'}}>Current</th>
                    <th style={{padding: '8px 8px', textAlign: 'right', color: '#60a5fa'}}>Min</th>
                    <th style={{padding: '8px 8px', textAlign: 'right', color: '#f55'}}>Max</th>
                    <th style={{padding: '8px 8px', textAlign: 'right', color: '#34d399'}}>Avg</th>
                    <th style={{padding: '8px 0 8px 8px', textAlign: 'right'}}>Unit</th>
                  </tr>
                </thead>
                <tbody>
                  {section.metrics.map((m) => (
                    <tr key={m.metric} style={{borderTop: '1px solid rgba(255,255,255,0.04)'}}>
                      <td style={{color: 'var(--ac-text-primary)', padding: '8px 16px 8px 0', fontWeight: 500}}>{m.metric}</td>
                      <td className="ac-metric" style={{padding: '8px', textAlign: 'right'}}>{m.current.toFixed(1)}</td>
                      <td className="ac-metric" style={{padding: '8px', textAlign: 'right', color: '#60a5fa'}}>{m.min.toFixed(1)}</td>
                      <td className="ac-metric" style={{padding: '8px', textAlign: 'right', color: '#f55'}}>{m.max.toFixed(1)}</td>
                      <td className="ac-metric" style={{padding: '8px', textAlign: 'right', color: '#34d399'}}>{m.avg.toFixed(1)}</td>
                      <td style={{color: 'var(--ac-text-secondary)', padding: '8px 0 8px 8px', textAlign: 'right'}}>{m.unit}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
