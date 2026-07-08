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
    <div className="flex flex-col gap-6">
      {selectedGpuId && data && (
        <div className="card">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-surface-200">Current Status</h3>
            <span className="text-xs text-surface-400">{selectedGpuId}</span>
          </div>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-xs text-surface-500">Core Clock</div>
              <div className="text-lg font-bold text-surface-100">{formatClockSpeed(data.core_clock_mhz)}</div>
            </div>
            <div>
              <div className="text-xs text-surface-500">Memory Clock</div>
              <div className="text-lg font-bold text-surface-100">{formatClockSpeed(data.memory_clock_mhz)}</div>
            </div>
            <div>
              <div className="text-xs text-surface-500">Temperature</div>
              <div className="text-lg font-bold text-surface-100">{data.temperature_celsius.toFixed(1)}°C</div>
            </div>
          </div>
        </div>
      )}

      {selectedGpuId && data && (
        <FanControl gpuId={selectedGpuId} currentSpeed={data.fan_speed_percent} />
      )}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="card flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-surface-400">Core Clock Offset</span>
            <span className="text-lg font-bold text-surface-100">{coreOffset >= 0 ? '+' : ''}{coreOffset} MHz</span>
          </div>
          <input
            type="range"
            min={-500}
            max={500}
            step={5}
            value={coreOffset}
            onChange={(e) => handleCoreOffset(Number(e.target.value))}
            className="h-2 w-full cursor-pointer appearance-none rounded-full bg-surface-700 accent-primary-500"
          />
          <div className="flex justify-between text-[10px] text-surface-500">
            <span>-500</span>
            <span>0</span>
            <span>+500</span>
          </div>
        </div>

        <div className="card flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-surface-400">Memory Clock Offset</span>
            <span className="text-lg font-bold text-surface-100">{memOffset >= 0 ? '+' : ''}{memOffset} MHz</span>
          </div>
          <input
            type="range"
            min={-2000}
            max={2000}
            step={10}
            value={memOffset}
            onChange={(e) => handleMemOffset(Number(e.target.value))}
            className="h-2 w-full cursor-pointer appearance-none rounded-full bg-surface-700 accent-primary-500"
          />
          <div className="flex justify-between text-[10px] text-surface-500">
            <span>-2000</span>
            <span>0</span>
            <span>+2000</span>
          </div>
        </div>

        <div className="card flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-surface-400">Power Limit</span>
            <span className="text-lg font-bold text-surface-100">{powerLimit}%</span>
          </div>
          <input
            type="range"
            min={50}
            max={150}
            step={1}
            value={powerLimit}
            onChange={(e) => {
              setPowerLimit(Number(e.target.value));
              if (selectedGpuId) controlService.setPowerLimit(selectedGpuId, Number(e.target.value));
            }}
            className="h-2 w-full cursor-pointer appearance-none rounded-full bg-surface-700 accent-yellow-500"
          />
          <div className="flex justify-between text-[10px] text-surface-500">
            <span>50%</span>
            <span>100%</span>
            <span>150%</span>
          </div>
        </div>

        <div className="card flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-surface-400">Voltage Offset</span>
            <span className="text-lg font-bold text-surface-100">{voltageOffset >= 0 ? '+' : ''}{voltageOffset} mV</span>
          </div>
          <input
            type="range"
            min={-200}
            max={200}
            step={5}
            value={voltageOffset}
            onChange={(e) => {
              setVoltageOffset(Number(e.target.value));
              if (selectedGpuId) controlService.setVoltageOffset(selectedGpuId, Number(e.target.value));
            }}
            className="h-2 w-full cursor-pointer appearance-none rounded-full bg-surface-700 accent-purple-500"
          />
          <div className="flex justify-between text-[10px] text-surface-500">
            <span>-200</span>
            <span>0</span>
            <span>+200</span>
          </div>
        </div>
      </div>
    </div>
  );
}
