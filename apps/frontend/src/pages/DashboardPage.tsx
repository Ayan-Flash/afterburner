import { useEffect, useRef, useState } from 'react';
import { useGpuStore, useUiStore } from '../stores';
import {
  CpuGauge,
  CpuCoreCards,
  CpuPanel,
  GpuPanel,
  FanPanel,
  GameLauncher,
  BottomTabs,
} from '../components/armoury';
import { useCpuData } from '../components/armoury/useCpuData';

/* ================================================================
   DashboardPage — Overdrive dashboard.

   Left column : CPU gauge (centerpiece) + 2x2 CPU core cards.
   Right column: CPU panel + GPU panel (top), Fan + Game.
   Bottom      : metric category tabs.

   CPU metrics come from the live sysinfo-backed backend (see
   useCpuData); GPU metrics come from the live gpuStore backed by
   the Rust monitoring engine.
   ================================================================ */

export function DashboardPage() {
  const { gpus, currentData, fetchData, setFanSpeed } = useGpuStore();
  const { selectedGpuId } = useUiStore();
  const [activeTab, setActiveTab] = useState('frequency');
  const [fanMode, setFanMode] = useState<'silence' | 'standard' | 'turbo' | 'full'>('standard');
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const cpu = useCpuData();

  // Poll the selected GPU once per second for live telemetry.
  useEffect(() => {
    if (!selectedGpuId) return;
    fetchData(selectedGpuId);
    intervalRef.current = setInterval(() => fetchData(selectedGpuId), 1000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [selectedGpuId, fetchData]);

  const handleFanModeChange = async (mode: 'silence' | 'standard' | 'turbo' | 'full') => {
    setFanMode(mode);
    if (selectedGpuId) {
      const speedPct = mode === 'silence' ? 0 : mode === 'standard' ? 35 : mode === 'turbo' ? 70 : 100;
      try {
        await setFanSpeed(selectedGpuId, speedPct);
      } catch (e) {
        console.error("Failed to set fan speed", e);
      }
    }
  };

  const gpu = selectedGpuId ? currentData.get(selectedGpuId) : undefined;
  const gpuInfo = gpus.find((g) => g.id === selectedGpuId) ?? gpus[0];
  const gpuLabel = (gpuInfo?.name ?? 'No GPU').replace(/^NVIDIA\s+/i, '').replace(/^GeForce\s+/i, '');
  const vramTotalMb = gpu?.memory_total_mb ?? gpuInfo?.memory_total_mb ?? null;
  const vramTotal = vramTotalMb ? Math.round(vramTotalMb / 1024) : null;

  return (
    <div className="ac-dashboard">
      <div className="ac-content">
        {/* ---- Left column: gauge + core cards ---- */}
        <div className="ac-left">
          <CpuGauge value={cpu.frequency} maxValue={cpu.maxFrequency} size={340} />
          <div className="ac-cpu-identity">
            <span className="ac-cpu-identity__name">{cpu.model}</span>
            {cpu.logicalCores > 0 && (
              <span className="ac-cpu-identity__cores">
                {cpu.physicalCores > 0 ? `${cpu.physicalCores}C / ` : ''}
                {cpu.logicalCores}T
              </span>
            )}
          </div>
          <CpuCoreCards cores={cpu.cores} />
        </div>

        {/* ---- Right column: info + utility panels ---- */}
        <div className="ac-right">
          <div className="ac-right__top">
            <CpuPanel
              coreIndex={0}
              frequency={cpu.cores[0]?.frequency ?? cpu.frequency}
              voltage={cpu.voltage}
              temperature={cpu.temperature}
              maxFrequency={cpu.maxFrequency}
              isElevated={cpu.isElevated}
            />
            <GpuPanel
              gpuName={gpuLabel}
              frequency={gpu ? Math.round(gpu.core_clock_mhz) : null}
              voltage={gpu && gpu.core_voltage_mv > 0 ? gpu.core_voltage_mv / 1000 : null}
              temperature={gpu ? Math.round(gpu.temperature_celsius) : null}
              usage={gpu ? Math.round(gpu.core_utilization_percent) : null}
              vramUsed={gpu ? gpu.memory_used_mb / 1024 : null}
              vramTotal={vramTotal}
              memoryClock={gpu ? Math.round(gpu.memory_clock_mhz) : null}
            />
          </div>

          <div className="ac-right__bottom">
            <div className="ac-right__col">
              <FanPanel
                activeMode={fanMode}
                onModeChange={(m) => handleFanModeChange(m as typeof fanMode)}
                rpm={gpu && gpu.fan_rpm > 0 ? gpu.fan_rpm : null}
                percent={gpu ? Math.round(gpu.fan_speed_percent) : null}
              />
              <GameLauncher />
            </div>
          </div>
        </div>
      </div>

      <BottomTabs activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
}
