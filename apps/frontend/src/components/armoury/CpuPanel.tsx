
import { PanelFrame } from './PanelFrame';

/* ================================================================
   CpuPanel — "CPU Core 0" info panel with frequency bar,
   voltage, and temperature metrics.
   ================================================================ */

interface CpuPanelProps {
  coreIndex?: number;
  frequency: number;    // MHz
  voltage: number;      // Volts
  temperature: number;  // Celsius
  maxFrequency?: number;
}

export function CpuPanel({
  coreIndex = 0,
  frequency,
  voltage,
  temperature,
  maxFrequency = 5000,
}: CpuPanelProps) {
  const freqPercent = Math.min((frequency / maxFrequency) * 100, 100);
  const segmentCount = 20;
  const activeSegments = Math.round((freqPercent / 100) * segmentCount);

  return (
    <PanelFrame title={`CPU Core ${coreIndex}`} className="ac-panel--flex1 ac-info-panel">
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

      {/* Voltage */}
      <div className="ac-info-row">
        <span className="ac-info-row__label">CPU Core Voltage</span>
        <span className="ac-info-row__value">{voltage.toFixed(3)}V</span>
      </div>

      {/* Temperature */}
      <div className="ac-info-row">
        <span className="ac-info-row__label">Temperature</span>
        <span className="ac-info-row__value">{temperature}°C</span>
      </div>
    </PanelFrame>
  );
}
