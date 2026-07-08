import { useState } from 'react';
import { controlService } from '../../services';
import { formatFanSpeed } from '@common/utils';

interface FanControlProps {
  gpuId: string;
  currentSpeed: number;
}

export function FanControl({ gpuId, currentSpeed }: FanControlProps) {
  const [speed, setSpeed] = useState(currentSpeed);
  const [applying, setApplying] = useState(false);

  const handleChange = async (value: number) => {
    setSpeed(value);
    setApplying(true);
    try {
      await controlService.setFanSpeed(gpuId, value);
    } catch {
      // revert on error
      setSpeed(currentSpeed);
    } finally {
      setApplying(false);
    }
  };

  return (
    <div className="card flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-surface-400">Fan Speed</span>
        <span className="text-lg font-bold text-surface-100">{formatFanSpeed(speed)}</span>
      </div>
      <input
        type="range"
        min={0}
        max={100}
        step={1}
        value={speed}
        onChange={(e) => handleChange(Number(e.target.value))}
        className="h-2 w-full cursor-pointer appearance-none rounded-full bg-surface-700 accent-primary-500"
      />
      <div className="flex justify-between text-[10px] text-surface-500">
        <span>0%</span>
        <span>50%</span>
        <span>100%</span>
      </div>
      {applying && <span className="text-[10px] text-surface-500">Applying...</span>}
    </div>
  );
}
