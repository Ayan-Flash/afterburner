import { useEffect, useRef } from 'react';
import { useGpuStore, useUiStore, useAlertStore } from '../stores';
import { GpuCard } from '../components/composite/GpuCard';
import { MetricsGrid, METRICS, METRIC_KEYS } from '../components/feature/MetricsGrid';
import { RealtimeChart } from '../components/feature/RealtimeChart';
import { AlertPanel } from '../components/feature/AlertPanel';
import type { ExportedSample, MetricStats } from '../services';

// Maps aggregated-metric keys (MetricsGrid/METRICS) to their corresponding
// per-sample field name in ExportedSample, since the two use different keys.
const SAMPLE_KEY: Record<string, keyof ExportedSample> = {
  temperature: 'temp',
  core_clock: 'core',
  memory_clock: 'mem',
  fan_speed: 'fan',
  power: 'power',
  core_util: 'core_util',
};
export function DashboardPage() {
  const { gpus, currentData, history, aggregated, fetchGpus, fetchData, fetchHistory } = useGpuStore();
  const { selectedGpuId } = useUiStore();
  const { alerts } = useAlertStore();
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    fetchGpus();
  }, [fetchGpus]);

  useEffect(() => {
    if (selectedGpuId) {
      fetchHistory(selectedGpuId, 60);
      fetchData(selectedGpuId);

      intervalRef.current = setInterval(() => {
        fetchData(selectedGpuId);
      }, 1000);

      return () => {
        if (intervalRef.current) clearInterval(intervalRef.current);
      };
    }
  }, [selectedGpuId, fetchData, fetchHistory]);

  const samples = selectedGpuId ? history.get(selectedGpuId) ?? [] : [];
  const aggr = selectedGpuId ? aggregated.get(selectedGpuId) : null;

  const aggrMap: Record<string, MetricStats | undefined> = {};
  if (aggr) {
    METRIC_KEYS.forEach((key) => {
      const value = aggr[key as keyof typeof aggr];
      aggrMap[key] = typeof value === 'object' ? value : undefined;
    });
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {gpus.map((gpu) => (
          <GpuCard key={gpu.id} gpu={gpu} data={currentData.get(gpu.id)} />
        ))}
      </div>

      <div>
        <div className="section-header">
          <span className="section-title">Aggregated Metrics</span>
        </div>
        <MetricsGrid aggregated={aggrMap} />
      </div>

      <div>
        <div className="section-header">
          <span className="section-title">Real-Time Charts</span>
          {samples.length > 0 && (
            <span className="text-text-muted font-mono text-[10px]">{samples.length} samples</span>
          )}
        </div>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          {METRICS.map((metric) => (
            <RealtimeChart
              key={metric.key}
              data={samples}
              metric={SAMPLE_KEY[metric.key]}
              color={metric.color}
              label={metric.label}
              unit={metric.unit}
              height={80}
            />
          ))}
        </div>
      </div>

      <div>
        <div className="section-header">
          <span className="section-title">Alert Feed</span>
          {alerts.length > 0 && (
            <span className="text-text-muted text-[10px]">{alerts.length} total</span>
          )}
        </div>
        <AlertPanel />
      </div>
    </div>
  );
}
