export const METRICS = [
  { key: 'temperature', label: 'Temperature', color: '#ef4444', unit: '°C' },
  { key: 'core_clock', label: 'Core Clock', color: '#3b82f6', unit: 'MHz' },
  { key: 'memory_clock', label: 'Memory Clock', color: '#06b6d4', unit: 'MHz' },
  { key: 'fan_speed', label: 'Fan Speed', color: '#22c55e', unit: '%' },
  { key: 'power', label: 'Power', color: '#eab308', unit: 'W' },
  { key: 'core_util', label: 'Core Util', color: '#a855f7', unit: '%' },
];

export const METRIC_KEYS = METRICS.map((m) => m.key) as string[];

interface MetricsGridProps {
  aggregated: Record<string, { current: number; min: number; max: number; avg: number } | undefined>;
}

export function MetricsGrid({ aggregated }: MetricsGridProps) {
  return (
    <div className="grid grid-cols-6 gap-2">
      {METRICS.map((metric) => {
        const stats = aggregated[metric.key];
        return (
          <div key={metric.key} className="card p-3 flex flex-col gap-1.5">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: metric.color }} />
              <span className="text-[10px] font-medium text-text-muted uppercase tracking-wider">{metric.label}</span>
            </div>
            {stats ? (
              <>
                <span className="metric-value text-lg text-text-primary">
                  {stats.current.toFixed(1)}
                  <span className="ml-0.5 text-[10px] font-normal text-text-muted">{metric.unit}</span>
                </span>
                <div className="flex gap-2 text-[10px] text-text-muted">
                  <span>↓{stats.min.toFixed(1)}</span>
                  <span>↑{stats.max.toFixed(1)}</span>
                  <span>∅{stats.avg.toFixed(1)}</span>
                </div>
              </>
            ) : (
              <span className="text-sm text-text-dim">--</span>
            )}
          </div>
        );
      })}
    </div>
  );
}
