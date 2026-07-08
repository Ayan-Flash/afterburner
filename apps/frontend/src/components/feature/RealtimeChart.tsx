import { useMemo } from 'react';
import type { ExportedSample } from '../../services';

interface RealtimeChartProps {
  data: ExportedSample[];
  metric: keyof ExportedSample;
  color: string;
  label: string;
  unit: string;
  height?: number;
}

export function RealtimeChart({ data, metric, color, label, unit, height = 120 }: RealtimeChartProps) {
  const points = useMemo(() => {
    if (data.length === 0) return '';

    const values = data.map((d) => Number(d[metric]));
    const min = Math.min(...values);
    const max = Math.max(...values);
    const range = max - min || 1;
    const width = 100;
    const step = width / (values.length - 1);

    return values
      .map((v, i) => `${(i * step).toFixed(1)},${(100 - ((v - min) / range) * 90 - 5).toFixed(1)}`)
      .join(' ');
  }, [data, metric]);

  const currentValue = data.length > 0 ? Number(data[data.length - 1][metric]) : 0;

  return (
    <div className="card flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: color }} />
          <span className="text-xs font-medium text-surface-400">{label}</span>
        </div>
        <span className="text-sm font-bold text-surface-100">
          {currentValue.toFixed(1)}
          <span className="ml-0.5 text-xs font-normal text-surface-500">{unit}</span>
        </span>
      </div>

      <svg
        viewBox="0 0 100 100"
        className="w-full"
        style={{ height }}
        preserveAspectRatio="none"
      >
        {points && (
          <polyline
            fill="none"
            stroke={color}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            points={points}
          />
        )}
      </svg>
    </div>
  );
}
