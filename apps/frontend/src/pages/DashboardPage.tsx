import { useEffect, useRef } from 'react';
import { useGpuStore, useUiStore } from '../stores';
import { GpuCard } from '../components/composite/GpuCard';
import { MetricsGrid, METRICS, METRIC_KEYS } from '../components/feature/MetricsGrid';
import { RealtimeChart } from '../components/feature/RealtimeChart';
import { AlertPanel } from '../components/feature/AlertPanel';

export function DashboardPage() {
  const { gpus, currentData, history, aggregated, fetchGpus, fetchData, fetchHistory } = useGpuStore();
  const { selectedGpuId } = useUiStore();
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    fetchGpus();
  }, []);

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
  }, [selectedGpuId]);

  const samples = selectedGpuId ? history.get(selectedGpuId) ?? [] : [];
  const aggr = selectedGpuId ? aggregated.get(selectedGpuId) : null;

  const aggrMap: Record<string, { current: number; min: number; max: number; avg: number } | undefined> = {};
  if (aggr) {
    METRIC_KEYS.forEach((key) => {
      aggrMap[key] = aggr[key as keyof typeof aggr] as any;
    });
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {gpus.map((gpu) => (
          <GpuCard key={gpu.id} gpu={gpu} data={currentData.get(gpu.id)} />
        ))}
      </div>

      <MetricsGrid aggregated={aggrMap} />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 xl:grid-cols-3">
        {METRICS.map((metric) => (
          <RealtimeChart
            key={metric.key}
            data={samples}
            metric={metric.key as any}
            color={metric.color}
            label={metric.label}
            unit={metric.unit}
            height={100}
          />
        ))}
      </div>

      <AlertPanel />
    </div>
  );
}
