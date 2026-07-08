import type { GPUData, GPUInfo } from '../../services';
import { useUiStore } from '../../stores';
import { formatTemperature, formatClockSpeed, formatFanSpeed, formatPowerUsage } from '@common/utils';

interface GpuCardProps {
  gpu: GPUInfo;
  data: GPUData | undefined;
}

export function GpuCard({ gpu, data }: GpuCardProps) {
  const { selectedGpuId, setSelectedGpu } = useUiStore();
  const isSelected = selectedGpuId === gpu.id;

  return (
    <button
      onClick={() => setSelectedGpu(gpu.id)}
      className={`card flex w-full flex-col gap-3 text-left transition-all ${
        isSelected ? 'ring-2 ring-primary-500' : 'hover:border-primary-600'
      }`}
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium uppercase tracking-wider text-surface-400">
          {gpu.vendor}
        </span>
        <span className="text-xs text-surface-500">#{gpu.index}</span>
      </div>

      <div className="text-sm font-semibold text-surface-100">{gpu.name}</div>

      {data ? (
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-red-500" />
            <span className="text-surface-400">Temp</span>
            <span className="ml-auto font-medium text-surface-200">
              {formatTemperature(data.temperature_celsius)}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-blue-500" />
            <span className="text-surface-400">Core</span>
            <span className="ml-auto font-medium text-surface-200">
              {formatClockSpeed(data.core_clock_mhz)}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-green-500" />
            <span className="text-surface-400">Fan</span>
            <span className="ml-auto font-medium text-surface-200">
              {formatFanSpeed(data.fan_speed_percent)}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-yellow-500" />
            <span className="text-surface-400">Power</span>
            <span className="ml-auto font-medium text-surface-200">
              {formatPowerUsage(data.power_watts)}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-purple-500" />
            <span className="text-surface-400">Core Util</span>
            <span className="ml-auto font-medium text-surface-200">
              {data.core_utilization_percent.toFixed(1)}%
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-cyan-500" />
            <span className="text-surface-400">VRAM</span>
            <span className="ml-auto font-medium text-surface-200">
              {((data.memory_used_mb / data.memory_total_mb) * 100).toFixed(0)}%
            </span>
          </div>
        </div>
      ) : (
        <div className="py-2 text-center text-xs text-surface-500">No data</div>
      )}
    </button>
  );
}
