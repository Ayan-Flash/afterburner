import React, { useEffect, useRef, useState } from 'react';

/* ================================================================
   CpuGauge — The centerpiece circular gauge.
   SVG-based with tick marks, concentric rings, gradient arc,
   glow effects, needle sweep, and center value display.
   ================================================================ */

interface CpuGaugeProps {
  /** Current frequency in MHz */
  value: number;
  /** Maximum frequency (for scale) */
  maxValue?: number;
  /** Size of the gauge in pixels */
  size?: number;
}

// Gauge geometry constants
const SWEEP_ANGLE = 270;          // degrees of arc
const START_ANGLE = 135;          // start at bottom-left (degrees from 3 o'clock)
const TICK_COUNT = 60;            // number of tick marks
const MAJOR_TICK_EVERY = 10;      // every Nth tick is major
const OUTER_RADIUS = 0.44;       // fraction of viewBox
const INNER_RADIUS = 0.32;       // inner ring
const TICK_OUTER = 0.45;
const TICK_INNER_MINOR = 0.42;
const TICK_INNER_MAJOR = 0.40;

function polarToCartesian(cx: number, cy: number, r: number, angleDeg: number) {
  const rad = (angleDeg * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

function describeArc(cx: number, cy: number, r: number, startAngle: number, endAngle: number) {
  const start = polarToCartesian(cx, cy, r, endAngle);
  const end = polarToCartesian(cx, cy, r, startAngle);
  const largeArc = endAngle - startAngle > 180 ? 1 : 0;
  return `M ${start.x} ${start.y} A ${r} ${r} 0 ${largeArc} 0 ${end.x} ${end.y}`;
}

export function CpuGauge({ value, maxValue = 5000, size = 300 }: CpuGaugeProps) {
  const [displayValue, setDisplayValue] = useState(value);
  const animRef = useRef<number>();

  // Animate value changes
  useEffect(() => {
    const start = displayValue;
    const end = value;
    const duration = 600;
    const startTime = performance.now();

    const animate = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplayValue(Math.round(start + (end - start) * eased));
      if (progress < 1) {
        animRef.current = requestAnimationFrame(animate);
      }
    };

    animRef.current = requestAnimationFrame(animate);
    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  const vb = 200; // viewBox size
  const cx = vb / 2;
  const cy = vb / 2;
  const fraction = Math.min(Math.max(displayValue / maxValue, 0), 1);
  const valueAngle = START_ANGLE + fraction * SWEEP_ANGLE;

  // Ring radii (in viewBox units)
  const rOuter = vb * OUTER_RADIUS;
  const rMid = vb * 0.39;
  const rInner = vb * INNER_RADIUS;
  const rCenter = vb * 0.26;

  // Arc paths
  const endAngle = START_ANGLE + SWEEP_ANGLE;
  const bgArc = describeArc(cx, cy, rOuter, START_ANGLE, endAngle);
  const valueArc = describeArc(cx, cy, rOuter, START_ANGLE, valueAngle);

  // Determine color based on value fraction
  const getColor = (f: number) => {
    if (f < 0.5) return '#1a66bb';
    if (f < 0.7) return '#3388cc';
    if (f < 0.85) return '#cc6633';
    return '#cc2222';
  };

  const currentColor = getColor(fraction);
  const glowColor = fraction > 0.7 ? 'rgba(200,40,40,0.25)' : 'rgba(30,100,200,0.25)';

  // Generate tick marks
  const ticks: React.ReactNode[] = [];
  for (let i = 0; i <= TICK_COUNT; i++) {
    const angle = START_ANGLE + (i / TICK_COUNT) * SWEEP_ANGLE;
    const isMajor = i % MAJOR_TICK_EVERY === 0;
    const tickFraction = i / TICK_COUNT;
    const isActive = tickFraction <= fraction;

    const outerR = vb * TICK_OUTER;
    const innerR = vb * (isMajor ? TICK_INNER_MAJOR : TICK_INNER_MINOR);
    const p1 = polarToCartesian(cx, cy, outerR, angle);
    const p2 = polarToCartesian(cx, cy, innerR, angle);

    let tickColor = '#222233';
    if (isActive) {
      tickColor = tickFraction < 0.5 ? '#3388bb' : tickFraction < 0.7 ? '#5599cc' : tickFraction < 0.85 ? '#cc7744' : '#cc3333';
    }

    ticks.push(
      <line
        key={`tick-${i}`}
        x1={p1.x}
        y1={p1.y}
        x2={p2.x}
        y2={p2.y}
        stroke={tickColor}
        strokeWidth={isMajor ? 1.5 : 0.8}
        strokeLinecap="round"
      />
    );
  }

  // Generate small dot markers along the arc
  const dots: React.ReactNode[] = [];
  for (let i = 0; i < 30; i++) {
    const angle = START_ANGLE + (i / 30) * SWEEP_ANGLE;
    const dotR = vb * 0.47;
    const p = polarToCartesian(cx, cy, dotR, angle);
    const dotFraction = i / 30;
    const isActive = dotFraction <= fraction;

    dots.push(
      <circle
        key={`dot-${i}`}
        cx={p.x}
        cy={p.y}
        r={0.8}
        fill={isActive ? (dotFraction < 0.5 ? '#3388bb' : '#cc3333') : '#1a1a2a'}
      />
    );
  }

  // Needle indicator position
  const needlePos = polarToCartesian(cx, cy, rOuter + 4, valueAngle);
  const needleInner = polarToCartesian(cx, cy, rOuter - 8, valueAngle);

  // Scale labels position
  const labelMin = polarToCartesian(cx, cy, vb * 0.36, START_ANGLE + 10);
  const labelMax = polarToCartesian(cx, cy, vb * 0.36, endAngle - 10);

  return (
    <div className="ac-gauge-container" style={{ width: size, height: size }}>
      <svg viewBox={`0 0 ${vb} ${vb}`} width={size} height={size}>
        <defs>
          {/* Gradient for value arc */}
          <linearGradient id="gaugeGradient" x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#1155aa" />
            <stop offset="40%" stopColor="#2277cc" />
            <stop offset="60%" stopColor="#cc7733" />
            <stop offset="100%" stopColor="#cc2222" />
          </linearGradient>

          {/* Glow filter */}
          <filter id="gaugeGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="3" />
          </filter>

          {/* Subtle glow for center */}
          <radialGradient id="centerGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor={glowColor} />
            <stop offset="100%" stopColor="transparent" />
          </radialGradient>

          {/* Ring gradients */}
          <radialGradient id="ringGrad1" cx="50%" cy="50%" r="50%">
            <stop offset="80%" stopColor="transparent" />
            <stop offset="100%" stopColor="rgba(20,30,50,0.3)" />
          </radialGradient>
        </defs>

        {/* Ambient glow */}
        <circle cx={cx} cy={cy} r={rOuter + 10} fill={glowColor} filter="url(#gaugeGlow)" />

        {/* Outermost ring */}
        <circle cx={cx} cy={cy} r={rOuter + 2} fill="none" stroke="#181828" strokeWidth="1" />

        {/* Concentric decorative rings */}
        <circle cx={cx} cy={cy} r={rOuter} fill="none" stroke="#1a2030" strokeWidth="2" />
        <circle cx={cx} cy={cy} r={rMid} fill="none" stroke="#151a28" strokeWidth="1" />
        <circle cx={cx} cy={cy} r={rInner} fill="none" stroke="#161a28" strokeWidth="1.5" />
        <circle cx={cx} cy={cy} r={rCenter} fill="none" stroke="#141820" strokeWidth="1" />

        {/* Inner fill */}
        <circle cx={cx} cy={cy} r={rCenter} fill="#0d0d18" />

        {/* Digital trace decorations between rings */}
        {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((angle) => {
          const p1 = polarToCartesian(cx, cy, rInner + 2, angle);
          const p2 = polarToCartesian(cx, cy, rMid - 2, angle);
          return (
            <line
              key={`trace-${angle}`}
              x1={p1.x}
              y1={p1.y}
              x2={p2.x}
              y2={p2.y}
              stroke="#151a28"
              strokeWidth="0.5"
              opacity="0.6"
            />
          );
        })}

        {/* Dot markers */}
        {dots}

        {/* Background arc */}
        <path d={bgArc} fill="none" stroke="#1a1a2a" strokeWidth="4" strokeLinecap="round" />

        {/* Value arc (with gradient) */}
        <path
          d={valueArc}
          fill="none"
          stroke="url(#gaugeGradient)"
          strokeWidth="4"
          strokeLinecap="round"
        />

        {/* Glow copy of value arc */}
        <path
          d={valueArc}
          fill="none"
          stroke={currentColor}
          strokeWidth="6"
          strokeLinecap="round"
          opacity="0.3"
          filter="url(#gaugeGlow)"
        />

        {/* Tick marks */}
        {ticks}

        {/* Needle / indicator */}
        <line
          x1={needleInner.x}
          y1={needleInner.y}
          x2={needlePos.x}
          y2={needlePos.y}
          stroke={currentColor}
          strokeWidth="2"
          strokeLinecap="round"
        />
        <circle
          cx={needlePos.x}
          cy={needlePos.y}
          r="3"
          fill={currentColor}
          filter="url(#gaugeGlow)"
        />

        {/* Center value display */}
        <text
          x={cx}
          y={cy - 8}
          textAnchor="middle"
          dominantBaseline="central"
          fill="#ffffff"
          fontSize="32"
          fontWeight="700"
          fontFamily="'Segoe UI', 'Inter', sans-serif"
          letterSpacing="1"
        >
          {displayValue}
        </text>
        <text
          x={cx}
          y={cy + 16}
          textAnchor="middle"
          dominantBaseline="central"
          fill="#8888a0"
          fontSize="12"
          fontWeight="500"
          fontFamily="'Segoe UI', 'Inter', sans-serif"
        >
          MHz
        </text>
        <text
          x={cx}
          y={cy + 30}
          textAnchor="middle"
          dominantBaseline="central"
          fill="#555568"
          fontSize="10"
          fontWeight="500"
          fontFamily="'Segoe UI', 'Inter', sans-serif"
          letterSpacing="1.5"
        >
          CPU
        </text>

        {/* Scale labels */}
        <text
          x={labelMin.x}
          y={labelMin.y}
          textAnchor="middle"
          dominantBaseline="central"
          fill="#555568"
          fontSize="9"
          fontWeight="500"
        >
          0
        </text>
        <text
          x={labelMax.x}
          y={labelMax.y}
          textAnchor="middle"
          dominantBaseline="central"
          fill="#555568"
          fontSize="9"
          fontWeight="500"
        >
          Max
        </text>
      </svg>
    </div>
  );
}
