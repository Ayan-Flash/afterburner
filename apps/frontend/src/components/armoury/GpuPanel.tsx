import { useEffect } from 'react';
import { motion, useSpring, useTransform } from 'framer-motion';
import { PanelFrame } from './PanelFrame';

/* ================================================================
   GpuPanel — selected GPU info panel. Visually identical
   to CpuPanel. Replaces the Aura Sync panel from the original.
   ================================================================ */

interface GpuPanelProps {
  gpuName: string;
  frequency: number | null;    // MHz (core clock)
  voltage: number | null; // Volts — null when the GPU/driver does not expose it
  temperature: number | null;  // Celsius
  usage: number | null;        // percent
  vramUsed: number | null;     // GB
  vramTotal: number | null;    // GB
  memoryClock?: number | null; // MHz
  maxFrequency?: number;
}

function SpringValue({ value, unit = '', decimals = 0 }: { value: number; unit?: string; decimals?: number }) {
  const spring = useSpring(value, { stiffness: 80, damping: 17, mass: 0.5 });
  useEffect(() => {
    spring.set(value);
  }, [value, spring]);

  const display = useTransform(spring, (v) => `${v.toFixed(decimals)}${unit}`);
  return <motion.span>{display}</motion.span>;
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
  const freqPercent = frequency != null ? Math.min((frequency / maxFrequency) * 100, 100) : 0;
  const segmentCount = 20;
  const activeSegments = Math.round((freqPercent / 100) * segmentCount);

  return (
    <PanelFrame title={`GPU ${gpuName}`} className="ac-panel--flex1 ac-info-panel">
      {/* Frequency row */}
      <div className="ac-info-row">
        <span className="ac-info-row__label">Frequency</span>
        <span className="ac-info-row__value">
          {frequency != null && frequency > 0 ? (
            <SpringValue value={frequency} unit="MHz" />
          ) : (
            'N/A'
          )}
        </span>
      </div>

      {/* Segmented frequency bar with Framer Motion transitions */}
      <div className="ac-freq-bar ac-freq-bar--segmented">
        {Array.from({ length: segmentCount }, (_, i) => {
          const isActive = i < activeSegments;
          return (
            <motion.div
              key={i}
              className={`ac-freq-bar__segment ${isActive ? 'ac-freq-bar__segment--active' : ''}`}
              animate={{
                opacity: isActive ? 1 : 0.15,
                scaleY: isActive ? 1 : 0.85,
                backgroundColor: isActive ? 'rgba(59, 152, 232, 1)' : 'rgba(59, 152, 232, 0.1)'
              }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
            />
          );
        })}
      </div>

      {/* GPU Voltage */}
      <div className="ac-info-row">
        <span className="ac-info-row__label">GPU Voltage</span>
        <span className="ac-info-row__value">
          {voltage != null && voltage > 0 ? (
            <SpringValue value={voltage} unit="V" decimals={3} />
          ) : (
            'N/A'
          )}
        </span>
      </div>

      {/* Temperature */}
      <div className="ac-info-row">
        <span className="ac-info-row__label">Temperature</span>
        <span className="ac-info-row__value">
          {temperature != null && temperature > 0 ? (
            <SpringValue value={temperature} unit="°C" />
          ) : (
            'N/A'
          )}
        </span>
      </div>

      {/* Usage */}
      <div className="ac-info-row">
        <span className="ac-info-row__label">Usage</span>
        <span className="ac-info-row__value">
          {usage != null ? (
            <SpringValue value={usage} unit="%" />
          ) : (
            'N/A'
          )}
        </span>
      </div>

      {/* VRAM */}
      <div className="ac-info-row">
        <span className="ac-info-row__label">VRAM</span>
        <span className="ac-info-row__value">
          {vramUsed != null && vramTotal != null && vramTotal > 0 ? (
            <>
              <SpringValue value={vramUsed} unit="" decimals={1} />/{vramTotal}GB
            </>
          ) : (
            'N/A'
          )}
        </span>
      </div>

      {/* Memory Clock (if available) */}
      {memoryClock !== undefined && (
        <div className="ac-info-row">
          <span className="ac-info-row__label">GPU Memory Clock</span>
          <span className="ac-info-row__value">
            {memoryClock != null && memoryClock > 0 ? (
              <SpringValue value={memoryClock} unit="MHz" />
            ) : (
              'N/A'
            )}
          </span>
        </div>
      )}
    </PanelFrame>
  );
}
