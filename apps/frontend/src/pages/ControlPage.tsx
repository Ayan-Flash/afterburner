import { useEffect, useState } from 'react';
import { useGpuStore, useUiStore } from '../stores';
import { FanControl } from '../components/feature/FanControl';
import { formatClockSpeed } from '@common/utils';
import { controlService } from '../services';

export function ControlPage() {
  const { currentData, controlStates, fetchControlState } = useGpuStore();
  const { selectedGpuId } = useUiStore();
  const [coreOffset, setCoreOffset] = useState(0);
  const [memOffset, setMemOffset] = useState(0);
  const [powerLimit, setPowerLimit] = useState(100);
  const [voltageOffset, setVoltageOffset] = useState(0);

  const data = selectedGpuId ? currentData.get(selectedGpuId) : null;
  const control = selectedGpuId ? controlStates.get(selectedGpuId) : null;

  useEffect(() => {
    if (selectedGpuId) {
      fetchControlState(selectedGpuId);
    }
  }, [selectedGpuId]);

  useEffect(() => {
    if (control) {
      setCoreOffset(control.core_clock_offset_mhz);
      setMemOffset(control.memory_clock_offset_mhz);
      setPowerLimit(control.power_limit_percent ?? 100);
      setVoltageOffset(control.voltage_offset_mv);
    }
  }, [control]);

  const handleCoreOffset = async (value: number) => {
    setCoreOffset(value);
    if (selectedGpuId) {
      await controlService.setCoreClockOffset(selectedGpuId, value);
    }
  };

  const handleMemOffset = async (value: number) => {
    setMemOffset(value);
    if (selectedGpuId) {
      await controlService.setMemoryClockOffset(selectedGpuId, value);
    }
  };

  return (
    <div className="flex flex-col gap-5 max-w-4xl">
      {selectedGpuId && data && (
        <div className="card p-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-text-secondary">Current Status</span>
            <span className="text-[10px] font-mono text-text-dim">{selectedGpuId}</span>
          </div>
          <div className="grid grid-cols-4 gap-4">
            {[
              { label: 'Core Clock', value: formatClockSpeed(data.core_clock_mhz), color: 'text-blue-400' },
              { label: 'Memory Clock', value: formatClockSpeed(data.memory_clock_mhz), color: 'text-cyan-400' },
              { label: 'Temperature', value: `${data.temperature_celsius.toFixed(1)}°C`, color: data.temperature_celsius > 80 ? 'text-red-400' : 'text-amber-400' },
              { label: 'Voltage', value: `${data.core_voltage_mv.toFixed(0)} mV`, color: 'text-purple-400' },
            ].map((s) => (
              <div key={s.label} className="text-center">
                <div className="text-[10px] text-text-muted uppercase tracking-wider mb-1">{s.label}</div>
                <div className={`metric-value text-base ${s.color}`}>{s.value}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {selectedGpuId && data && (
        <FanControl gpuId={selectedGpuId} currentSpeed={data.fan_speed_percent} />
      )}

      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        <div className="card p-4 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-text-secondary uppercase tracking-wider">Core Clock Offset</span>
            <span className={`metric-value text-base ${coreOffset >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {coreOffset >= 0 ? '+' : ''}{coreOffset} MHz
            </span>
          </div>
          <input type="range" min={-500} max={500} step={5} value={coreOffset}
            onChange={(e) => handleCoreOffset(Number(e.target.value))}
            className="slider-gpu" />
          <div className="flex justify-between text-[10px] text-text-dim">
            <span>-500</span><span>0</span><span>+500</span>
          </div>
        </div>

        <div className="card p-4 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-text-secondary uppercase tracking-wider">Memory Clock Offset</span>
            <span className={`metric-value text-base ${memOffset >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {memOffset >= 0 ? '+' : ''}{memOffset} MHz
            </span>
          </div>
          <input type="range" min={-2000} max={2000} step={10} value={memOffset}
            onChange={(e) => handleMemOffset(Number(e.target.value))}
            className="slider-gpu" />
          <div className="flex justify-between text-[10px] text-text-dim">
            <span>-2000</span><span>0</span><span>+2000</span>
          </div>
        </div>

        <div className="card p-4 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-text-secondary uppercase tracking-wider">Power Limit</span>
            <span className="metric-value text-base text-amber-400">{powerLimit}%</span>
          </div>
          <input type="range" min={50} max={150} step={1} value={powerLimit}
            onChange={(e) => {
              setPowerLimit(Number(e.target.value));
              if (selectedGpuId) controlService.setPowerLimit(selectedGpuId, Number(e.target.value));
            }}
            className="slider-gpu [&::-webkit-slider-thumb]:bg-amber-500" />
          <div className="flex justify-between text-[10px] text-text-dim">
            <span>50%</span><span>100%</span><span>150%</span>
          </div>
        </div>

        <div className="card p-4 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-text-secondary uppercase tracking-wider">Voltage Offset</span>
            <span className={`metric-value text-base ${voltageOffset >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {voltageOffset >= 0 ? '+' : ''}{voltageOffset} mV
            </span>
          </div>
          <input type="range" min={-200} max={200} step={5} value={voltageOffset}
            onChange={(e) => {
              setVoltageOffset(Number(e.target.value));
              if (selectedGpuId) controlService.setVoltageOffset(selectedGpuId, Number(e.target.value));
            }}
            className="slider-gpu [&::-webkit-slider-thumb]:bg-purple-500" />
          <div className="flex justify-between text-[10px] text-text-dim">
            <span>-200</span><span>0</span><span>+200</span>
          </div>
        </div>
      </div>
    </div>
  );
}
