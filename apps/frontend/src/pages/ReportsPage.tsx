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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="section-header">
          <h2 className="text-lg font-semibold text-text-primary">Performance Reports</h2>
          <p className="text-sm text-text-secondary mt-1">Generate and export GPU performance reports</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => fetchReports()} className="btn-ghost text-xs px-3 py-1.5">
            <IconRefresh className="w-3.5 h-3.5 mr-1.5 inline" />
            Refresh
          </button>
          <button onClick={() => setShowBuilder(!showBuilder)} className="btn-primary text-xs px-4 py-1.5">
            {showBuilder ? 'Cancel' : 'New Report'}
          </button>
        </div>
      </div>

      {error && (
        <div className="px-4 py-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
          {error}
          <button onClick={clearError} className="float-right text-red-400/70 hover:text-red-400">&times;</button>
        </div>
      )}

      {showBuilder && (
        <div className="card p-5 space-y-4">
          <h3 className="text-sm font-semibold text-text-primary">Report Builder</h3>

          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1">Report Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Gaming Session Report"
              className="w-full max-w-md px-3 py-2 rounded-lg bg-gpu-800 border border-gpu-700 text-text-primary text-sm focus:outline-none focus:border-accent-primary"
            />
          </div>

          <div className="flex items-center gap-3">
            <div>
              <label className="block text-xs font-medium text-text-secondary mb-1">Time Range</label>
              <div className="flex gap-1">
                <input
                  type="number"
                  value={rangeValue}
                  min={1}
                  onChange={(e) => setRangeValue(Number(e.target.value))}
                  className="w-20 px-2 py-2 rounded-lg bg-gpu-800 border border-gpu-700 text-text-primary text-sm text-center focus:outline-none focus:border-accent-primary"
                />
                <select
                  value={rangeType}
                  onChange={(e) => setRangeType(e.target.value as any)}
                  className="px-2 py-2 rounded-lg bg-gpu-800 border border-gpu-700 text-text-primary text-sm focus:outline-none focus:border-accent-primary"
                >
                  <option value="minutes">Minutes</option>
                  <option value="hours">Hours</option>
                  <option value="days">Days</option>
                </select>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-text-secondary mb-2">Metrics to Include</label>
            <div className="flex flex-wrap gap-3">
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input type="checkbox" checked={includeTemp} onChange={(e) => setIncludeTemp(e.target.checked)} className="rounded accent-accent-primary" />
                <span className="text-sm text-text-primary">Temperature</span>
              </label>
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input type="checkbox" checked={includeClocks} onChange={(e) => setIncludeClocks(e.target.checked)} className="rounded accent-accent-primary" />
                <span className="text-sm text-text-primary">Clocks</span>
              </label>
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input type="checkbox" checked={includeFan} onChange={(e) => setIncludeFan(e.target.checked)} className="rounded accent-accent-primary" />
                <span className="text-sm text-text-primary">Fan</span>
              </label>
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input type="checkbox" checked={includePower} onChange={(e) => setIncludePower(e.target.checked)} className="rounded accent-accent-primary" />
                <span className="text-sm text-text-primary">Power</span>
              </label>
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input type="checkbox" checked={includeUtil} onChange={(e) => setIncludeUtil(e.target.checked)} className="rounded accent-accent-primary" />
                <span className="text-sm text-text-primary">Utilization</span>
              </label>
            </div>
          </div>

          <button onClick={handleGenerate} disabled={generating || !name.trim()} className="btn-primary text-sm px-6 py-2">
            {generating ? 'Generating...' : 'Generate Report'}
          </button>
        </div>
      )}

      {loading && !reports.length ? (
        <div className="flex items-center justify-center h-32">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-accent-primary" />
        </div>
      ) : reports.length === 0 ? (
        <div className="card p-8 text-center">
          <IconFile className="w-12 h-12 mx-auto text-text-muted mb-3" />
          <p className="text-text-secondary text-sm">No reports yet. Generate your first performance report.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {reports.map((r) => (
            <div
              key={r.id}
              className="card p-4 flex items-center justify-between cursor-pointer hover:border-accent-primary/30 transition-colors"
              onClick={() => loadReport(r.id)}
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-9 h-9 rounded-lg bg-accent-primary/10 flex items-center justify-center shrink-0">
                  <IconFile className="w-4.5 h-4.5 text-accent-primary" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-text-primary truncate">{r.name}</p>
                  <p className="text-xs text-text-secondary">
                    {formatDate(r.created_at)} &middot; {r.gpu_count} GPU{r.gpu_count !== 1 ? 's' : ''} &middot; {r.sample_count} samples &middot; {formatSize(r.file_size)}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-xs px-2 py-0.5 rounded bg-gpu-800 text-text-secondary">{r.format}</span>
                <button
                  onClick={(e) => { e.stopPropagation(); removeReport(r.id); }}
                  className="btn-ghost text-xs p-1.5 text-red-400/60 hover:text-red-400"
                >
                  <IconTrash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {currentReport && (
        <div className="card">
          <div className="p-4 border-b border-gpu-800 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-text-primary">{currentReport.name}</h3>
              <p className="text-xs text-text-secondary">{formatDate(currentReport.created_at)}</p>
            </div>
            <div className="flex gap-2">
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
                className="btn-secondary text-xs px-3 py-1.5"
              >
                <IconDownload className="w-3.5 h-3.5 mr-1 inline" />
                Export CSV
              </button>
            </div>
          </div>

          {currentReport.sections.map((section) => (
            <div key={section.gpu_id} className="p-4 border-b border-gpu-800 last:border-0">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-medium text-text-primary">{section.gpu_name}</h4>
                <span className="text-xs text-text-secondary">
                  {section.sample_count} samples over {section.sampling_duration_secs}s
                </span>
              </div>
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-xs text-text-secondary uppercase tracking-wider">
                    <th className="text-left py-2 pr-4">Metric</th>
                    <th className="text-right px-2">Current</th>
                    <th className="text-right px-2 text-blue-400">Min</th>
                    <th className="text-right px-2 text-red-400">Max</th>
                    <th className="text-right px-2 text-emerald-400">Avg</th>
                    <th className="text-right pl-2">Unit</th>
                  </tr>
                </thead>
                <tbody>
                  {section.metrics.map((m) => (
                    <tr key={m.metric} className="border-t border-gpu-800/50">
                      <td className="py-2 pr-4 text-text-primary font-medium">{m.metric}</td>
                      <td className="py-2 px-2 text-right text-text-primary font-mono">{m.current.toFixed(1)}</td>
                      <td className="py-2 px-2 text-right text-blue-400 font-mono">{m.min.toFixed(1)}</td>
                      <td className="py-2 px-2 text-right text-red-400 font-mono">{m.max.toFixed(1)}</td>
                      <td className="py-2 px-2 text-right text-emerald-400 font-mono">{m.avg.toFixed(1)}</td>
                      <td className="py-2 pl-2 text-right text-text-secondary">{m.unit}</td>
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
