import type { GPUData, GPUInfo } from '../../services';
import { useUiStore } from '../../stores';
import { formatClockSpeed, formatFanSpeed, formatPowerUsage } from '@common/utils';

interface GpuCardProps {
  gpu: GPUInfo;
  data: GPUData | undefined;
}

function MiniGauge({ value, max, color, label }: { value: number; max: number; color: string; label: string }) {
  const pct = Math.min(value / max, 1);
  const circumference = 2 * Math.PI * 16;
  const offset = circumference * (1 - pct);
  return (
    <div className="flex flex-col items-center gap-0.5">
      <svg width="40" height="40" viewBox="0 0 40 40" className="-rotate-90">
        <circle cx="20" cy="20" r="16" fill="none" stroke="currentColor" strokeWidth="3" className="text-gpu-700" />
        <circle cx="20" cy="20" r="16" fill="none" stroke={color} strokeWidth="3" strokeLinecap="round"
          strokeDasharray={circumference} strokeDashoffset={offset} />
      </svg>
      <span className="text-[8px] font-medium text-text-muted uppercase tracking-wider">{label}</span>
    </div>
  );
}

export function GpuCard({ gpu, data }: GpuCardProps) {
  const { selectedGpuId, setSelectedGpu } = useUiStore();
  const isSelected = selectedGpuId === gpu.id;

  const tempColor = data ? (data.temperature_celsius > 80 ? 'text-temp-hot' : data.temperature_celsius > 65 ? 'text-temp-warm' : 'text-temp-cool') : 'text-text-muted';

  return (
    <button
      onClick={() => setSelectedGpu(gpu.id)}
      className={`card p-4 text-left transition-all duration-200 ${
        isSelected
          ? 'ring-1 ring-accent/50 border-accent/30 bg-accent-subtle shadow-gpu'
          : 'card-hover'
      }`}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <span className="text-[10px] font-semibold uppercase tracking-widest text-text-muted">{gpu.vendor}</span>
            <span className="text-[10px] text-text-dim font-mono">#{gpu.index}</span>
          </div>
          <div className="text-sm font-semibold text-text-primary truncate">{gpu.name}</div>
        </div>
        {data && (
          <div className="flex items-baseline gap-0.5 flex-shrink-0">
            <span className={`text-2xl font-bold tabular-nums ${tempColor}`}>
              {data.temperature_celsius.toFixed(0)}
            </span>
            <span className="text-xs text-text-muted">°C</span>
          </div>
        )}
      </div>

      {data ? (
        <>
          <div className="grid grid-cols-4 gap-1 mb-3">
            <MiniGauge value={data.core_utilization_percent} max={100} color="#f04747" label="GPU" />
            <MiniGauge value={data.memory_used_mb} max={data.memory_total_mb} color="#22d3ee" label="VRAM" />
            <MiniGauge value={data.power_watts} max={450} color="#f59e0b" label="PWR" />
            <MiniGauge value={data.fan_speed_percent} max={100} color="#a78bfa" label="FAN" />
          </div>

          <div className="flex flex-wrap gap-x-4 gap-y-1 text-[11px]">
            <span className="text-text-muted">Core <span className="metric-value text-text-primary">{formatClockSpeed(data.core_clock_mhz)}</span></span>
            <span className="text-text-muted">VRAM <span className="metric-value text-text-primary">{formatClockSpeed(data.memory_clock_mhz)}</span></span>
            <span className="text-text-muted">Fan <span className="metric-value text-text-primary">{formatFanSpeed(data.fan_speed_percent)}</span></span>
            <span className="text-text-muted">Power <span className="metric-value text-text-primary">{formatPowerUsage(data.power_watts)}</span></span>
          </div>
        </>
      ) : (
        <div className="py-4 text-center text-xs text-text-muted">Waiting for data...</div>
      )}
    </button>
  );
}
