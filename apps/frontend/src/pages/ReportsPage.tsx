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
          <h2 className="text-text-primary text-lg font-semibold">Performance Reports</h2>
          <p className="text-text-secondary mt-1 text-sm">Generate and export GPU performance reports</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => fetchReports()} className="btn-ghost px-3 py-1.5 text-xs">
            <IconRefresh className="mr-1.5 inline size-3.5" />
            Refresh
          </button>
          <button onClick={() => setShowBuilder(!showBuilder)} className="btn-primary px-4 py-1.5 text-xs">
            {showBuilder ? 'Cancel' : 'New Report'}
          </button>
        </div>
      </div>

      {error && (
        <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
          {error}
          <button onClick={clearError} className="float-right text-red-400/70 hover:text-red-400">&times;</button>
        </div>
      )}

      {showBuilder && (
        <div className="card space-y-4 p-5">
          <h3 className="text-text-primary text-sm font-semibold">Report Builder</h3>

          <div>
            <label className="text-text-secondary mb-1 block text-xs font-medium">Report Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Gaming Session Report"
              className="bg-gpu-800 border-gpu-700 text-text-primary focus:border-accent-primary w-full max-w-md rounded-lg border px-3 py-2 text-sm focus:outline-none"
            />
          </div>

          <div className="flex items-center gap-3">
            <div>
              <label className="text-text-secondary mb-1 block text-xs font-medium">Time Range</label>
              <div className="flex gap-1">
                <input
                  type="number"
                  value={rangeValue}
                  min={1}
                  onChange={(e) => setRangeValue(Number(e.target.value))}
                  className="bg-gpu-800 border-gpu-700 text-text-primary focus:border-accent-primary w-20 rounded-lg border p-2 text-center text-sm focus:outline-none"
                />
                <select
                  value={rangeType}
                  onChange={(e) => setRangeType(e.target.value as 'minutes' | 'hours' | 'days')}
                  className="bg-gpu-800 border-gpu-700 text-text-primary focus:border-accent-primary rounded-lg border p-2 text-sm focus:outline-none"
                >
                  <option value="minutes">Minutes</option>
                  <option value="hours">Hours</option>
                  <option value="days">Days</option>
                </select>
              </div>
            </div>
          </div>

          <div>
            <label className="text-text-secondary mb-2 block text-xs font-medium">Metrics to Include</label>
            <div className="flex flex-wrap gap-3">
              <label className="flex cursor-pointer items-center gap-1.5">
                <input type="checkbox" checked={includeTemp} onChange={(e) => setIncludeTemp(e.target.checked)} className="accent-accent-primary rounded" />
                <span className="text-text-primary text-sm">Temperature</span>
              </label>
              <label className="flex cursor-pointer items-center gap-1.5">
                <input type="checkbox" checked={includeClocks} onChange={(e) => setIncludeClocks(e.target.checked)} className="accent-accent-primary rounded" />
                <span className="text-text-primary text-sm">Clocks</span>
              </label>
              <label className="flex cursor-pointer items-center gap-1.5">
                <input type="checkbox" checked={includeFan} onChange={(e) => setIncludeFan(e.target.checked)} className="accent-accent-primary rounded" />
                <span className="text-text-primary text-sm">Fan</span>
              </label>
              <label className="flex cursor-pointer items-center gap-1.5">
                <input type="checkbox" checked={includePower} onChange={(e) => setIncludePower(e.target.checked)} className="accent-accent-primary rounded" />
                <span className="text-text-primary text-sm">Power</span>
              </label>
              <label className="flex cursor-pointer items-center gap-1.5">
                <input type="checkbox" checked={includeUtil} onChange={(e) => setIncludeUtil(e.target.checked)} className="accent-accent-primary rounded" />
                <span className="text-text-primary text-sm">Utilization</span>
              </label>
            </div>
          </div>

          <button onClick={handleGenerate} disabled={generating || !name.trim()} className="btn-primary px-6 py-2 text-sm">
            {generating ? 'Generating...' : 'Generate Report'}
          </button>
        </div>
      )}

      {loading && !reports.length ? (
        <div className="flex h-32 items-center justify-center">
          <div className="border-accent-primary size-6 animate-spin rounded-full border-b-2" />
        </div>
      ) : reports.length === 0 ? (
        <div className="card p-8 text-center">
          <IconFile className="text-text-muted mx-auto mb-3 size-12" />
          <p className="text-text-secondary text-sm">No reports yet. Generate your first performance report.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {reports.map((r) => (
            <div
              key={r.id}
              className="card hover:border-accent-primary/30 flex cursor-pointer items-center justify-between p-4 transition-colors"
              onClick={() => loadReport(r.id)}
            >
              <div className="flex min-w-0 items-center gap-3">
                <div className="bg-accent-primary/10 flex size-9 shrink-0 items-center justify-center rounded-lg">
                  <IconFile className="w-4.5 h-4.5 text-accent-primary" />
                </div>
                <div className="min-w-0">
                  <p className="text-text-primary truncate text-sm font-medium">{r.name}</p>
                  <p className="text-text-secondary text-xs">
                    {formatDate(r.created_at)} &middot; {r.gpu_count} GPU{r.gpu_count !== 1 ? 's' : ''} &middot; {r.sample_count} samples &middot; {formatSize(r.file_size)}
                  </p>
                </div>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <span className="bg-gpu-800 text-text-secondary rounded px-2 py-0.5 text-xs">{r.format}</span>
                <button
                  onClick={(e) => { e.stopPropagation(); removeReport(r.id); }}
                  className="btn-ghost p-1.5 text-xs text-red-400/60 hover:text-red-400"
                >
                  <IconTrash2 className="size-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {currentReport && (
        <div className="card">
          <div className="border-gpu-800 flex items-center justify-between border-b p-4">
            <div>
              <h3 className="text-text-primary text-sm font-semibold">{currentReport.name}</h3>
              <p className="text-text-secondary text-xs">{formatDate(currentReport.created_at)}</p>
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
                className="btn-secondary px-3 py-1.5 text-xs"
              >
                <IconDownload className="mr-1 inline size-3.5" />
                Export CSV
              </button>
            </div>
          </div>

          {currentReport.sections.map((section) => (
            <div key={section.gpu_id} className="border-gpu-800 border-b p-4 last:border-0">
              <div className="mb-3 flex items-center justify-between">
                <h4 className="text-text-primary text-sm font-medium">{section.gpu_name}</h4>
                <span className="text-text-secondary text-xs">
                  {section.sample_count} samples over {section.sampling_duration_secs}s
                </span>
              </div>
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-text-secondary text-xs uppercase tracking-wider">
                    <th className="py-2 pr-4 text-left">Metric</th>
                    <th className="px-2 text-right">Current</th>
                    <th className="px-2 text-right text-blue-400">Min</th>
                    <th className="px-2 text-right text-red-400">Max</th>
                    <th className="px-2 text-right text-emerald-400">Avg</th>
                    <th className="pl-2 text-right">Unit</th>
                  </tr>
                </thead>
                <tbody>
                  {section.metrics.map((m) => (
                    <tr key={m.metric} className="border-gpu-800/50 border-t">
                      <td className="text-text-primary py-2 pr-4 font-medium">{m.metric}</td>
                      <td className="text-text-primary p-2 text-right font-mono">{m.current.toFixed(1)}</td>
                      <td className="p-2 text-right font-mono text-blue-400">{m.min.toFixed(1)}</td>
                      <td className="p-2 text-right font-mono text-red-400">{m.max.toFixed(1)}</td>
                      <td className="p-2 text-right font-mono text-emerald-400">{m.avg.toFixed(1)}</td>
                      <td className="text-text-secondary py-2 pl-2 text-right">{m.unit}</td>
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
