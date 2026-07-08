
export const METRICS = [
  { key: 'temperature', label: 'Temperature', color: '#ef4444', unit: '°C' },
  { key: 'core_clock', label: 'Core Clock', color: '#3b82f6', unit: 'MHz' },
  { key: 'memory_clock', label: 'Memory Clock', color: '#06b6d4', unit: 'MHz' },
  { key: 'fan_speed', label: 'Fan Speed', color: '#22c55e', unit: '%' },
  { key: 'power', label: 'Power', color: '#eab308', unit: 'W' },
  { key: 'core_util', label: 'Core Util', color: '#a855f7', unit: '%' },
];

const METRIC_KEYS = METRICS.map((m) => m.key) as string[];

interface MetricsGridProps {
  aggregated: Record<string, { current: number; min: number; max: number; avg: number } | undefined>;
}

export function MetricsGrid({ aggregated }: MetricsGridProps) {
  return (
    <div className="grid grid-cols-3 gap-3">
      {METRICS.map((metric) => {
        const stats = aggregated[metric.key];
        return (
          <div key={metric.key} className="card flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <span
                className="h-2.5 w-2.5 rounded-full"
                style={{ backgroundColor: metric.color }}
              />
              <span className="text-xs font-medium text-surface-400">{metric.label}</span>
            </div>
            {stats ? (
              <div className="flex items-baseline gap-1">
                <span className="text-xl font-bold text-surface-100">
                  {stats.current.toFixed(1)}
                </span>
                <span className="text-xs text-surface-500">{metric.unit}</span>
              </div>
            ) : (
              <div className="text-sm text-surface-500">--</div>
            )}
            {stats && (
              <div className="flex gap-3 text-[10px] text-surface-500">
                <span>min {stats.min.toFixed(1)}</span>
                <span>max {stats.max.toFixed(1)}</span>
                <span>avg {stats.avg.toFixed(1)}</span>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

export { METRIC_KEYS };
