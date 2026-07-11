
import { PanelFrame } from './PanelFrame';

/* ================================================================
   GpuPanel — "GPU RTX 3060" info panel. Visually identical
   to CpuPanel. Replaces the Aura Sync panel from the original.
   ================================================================ */

interface GpuPanelProps {
  gpuName: string;      // e.g. "RTX 3060"
  frequency: number;    // MHz (core clock)
  voltage: number;      // Volts
  temperature: number;  // Celsius
  usage: number;        // percent
  vramUsed: number;     // GB
  vramTotal: number;    // GB
  memoryClock?: number; // MHz
  maxFrequency?: number;
}

export function GpuPanel({
  gpuName,
  frequency,
  voltage,
  temperature,
  usage,
  vramUsed,
  vramTotal,
  memoryClock,
  maxFrequency = 2500,
}: GpuPanelProps) {
  const freqPercent = Math.min((frequency / maxFrequency) * 100, 100);
  const segmentCount = 20;
  const activeSegments = Math.round((freqPercent / 100) * segmentCount);

  return (
    <PanelFrame title={`GPU ${gpuName}`} className="ac-panel--flex1 ac-info-panel">
      {/* Frequency row */}
      <div className="ac-info-row">
        <span className="ac-info-row__label">Frequency</span>
        <span className="ac-info-row__value">{frequency}MHz</span>
      </div>

      {/* Segmented frequency bar */}
      <div className="ac-freq-bar ac-freq-bar--segmented">
        {Array.from({ length: segmentCount }, (_, i) => (
          <div
            key={i}
            className={`ac-freq-bar__segment ${i < activeSegments ? 'ac-freq-bar__segment--active' : ''}`}
          />
        ))}
      </div>

      {/* GPU Voltage */}
      <div className="ac-info-row">
        <span className="ac-info-row__label">GPU Voltage</span>
        <span className="ac-info-row__value">{voltage.toFixed(3)}V</span>
      </div>

      {/* Temperature */}
      <div className="ac-info-row">
        <span className="ac-info-row__label">Temperature</span>
        <span className="ac-info-row__value">{temperature}°C</span>
      </div>

      {/* Usage */}
      <div className="ac-info-row">
        <span className="ac-info-row__label">Usage</span>
        <span className="ac-info-row__value">{usage}%</span>
      </div>

      {/* VRAM */}
      <div className="ac-info-row">
        <span className="ac-info-row__label">VRAM</span>
        <span className="ac-info-row__value">{vramUsed.toFixed(1)}/{vramTotal}GB</span>
      </div>

      {/* Memory Clock (if available) */}
      {memoryClock !== undefined && (
        <div className="ac-info-row">
          <span className="ac-info-row__label">GPU Memory Clock</span>
          <span className="ac-info-row__value">{memoryClock}MHz</span>
        </div>
      )}
    </PanelFrame>
  );
}
