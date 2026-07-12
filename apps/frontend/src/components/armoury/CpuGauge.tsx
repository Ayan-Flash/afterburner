import { useEffect } from 'react';
import { motion, useSpring, useTransform } from 'framer-motion';

/* ================================================================
   CpuGauge — Futuristic cyberpunk speedometer with Framer Motion.

   All value-driven animations (needle sweep, arc fill, value counter,
   glow color) run on spring physics for silky-smooth, natural motion.
   ================================================================ */

interface CpuGaugeProps {
  value: number;
  maxValue?: number;
  size?: number;
}

const SWEEP = 270;
const START = 135;
const TICKS = 72;

function polar(cx: number, cy: number, r: number, deg: number) {
  const rad = (deg * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

function arc(cx: number, cy: number, r: number, a1: number, a2: number) {
  const s = polar(cx, cy, r, a2);
  const e = polar(cx, cy, r, a1);
  const large = a2 - a1 > 180 ? 1 : 0;
  return `M ${s.x} ${s.y} A ${r} ${r} 0 ${large} 0 ${e.x} ${e.y}`;
}

/** Spring-animated digital counter. */
function AnimatedValue({ value }: { value: number }) {
  const spring = useSpring(0, { stiffness: 80, damping: 20, mass: 0.5 });

  useEffect(() => { spring.set(value); }, [value, spring]);

  const rounded = useTransform(spring, (v) => Math.round(v));

  return <motion.tspan>{rounded}</motion.tspan>;
}

/** The SVG needle, animated via Framer Motion spring. */
function Needle({
  cx, cy, rOuter, rInner, angle, color, colorBright,
}: {
  cx: number; cy: number; rOuter: number; rInner: number;
  angle: number; color: string; colorBright: string;
}) {
  const springAngle = useSpring(angle, { stiffness: 60, damping: 18, mass: 0.6 });
  const rotation = useTransform(springAngle, (a) => a);

  useEffect(() => { springAngle.set(angle); }, [angle, springAngle]);

  // Pre-calculate needle geometry at angle=0 (pointing right), then rotate the group
  const tipR = rOuter - 2;
  const baseR = 8;
  const midR = rInner;

  const tip = { x: cx + tipR, y: cy };
  const base1 = { x: cx, y: cy - baseR };
  const base2 = { x: cx, y: cy + baseR };
  const mid = { x: cx + midR, y: cy };

  return (
    <motion.g
      style={{
        transformOrigin: `${cx}px ${cy}px`,
        rotate: rotation,
        filter: `drop-shadow(0 0 6px ${color})`,
      }}
    >
      <polygon
        points={`${tip.x},${tip.y} ${base1.x},${base1.y} ${mid.x},${mid.y} ${base2.x},${base2.y}`}
        fill={colorBright} opacity="0.9"
      />
      <circle cx={tip.x} cy={tip.y} r="2.5" fill={colorBright} opacity="0.95" />
    </motion.g>
  );
}

export function CpuGauge({ value, maxValue = 5000, size = 340 }: CpuGaugeProps) {
  const V = 220;
  const cx = V / 2;
  const cy = V / 2;

  // Spring-animated fraction for arc, ticks, colors
  const rawFrac = Math.min(Math.max(value / maxValue, 0), 1);
  const fracSpring = useSpring(rawFrac, { stiffness: 70, damping: 18, mass: 0.5 });
  useEffect(() => { fracSpring.set(rawFrac); }, [rawFrac, fracSpring]);

  // We need a static snapshot for SVG path generation — use the target value
  // and let the needle animate independently via its own spring
  const frac = rawFrac;
  const valAngle = START + frac * SWEEP;
  const endAngle = START + SWEEP;

  // Radii
  const rOuter = 98;
  const rArc = 90;
  const rMid = 82;
  const rInner = 72;
  const rCenter = 55;

  // Color
  const hue = frac < 0.5 ? 200 : frac < 0.7 ? 180 - (frac - 0.5) * 600 : frac < 0.85 ? 30 - (frac - 0.7) * 100 : 0;
  const sat = frac < 0.5 ? 80 : 90;
  const color = `hsl(${hue}, ${sat}%, 55%)`;
  const colorBright = `hsl(${hue}, ${sat + 10}%, 70%)`;
  const glowAlpha = 0.15 + frac * 0.2;

  // Tick marks
  const ticks: React.ReactNode[] = [];
  for (let i = 0; i <= TICKS; i++) {
    const a = START + (i / TICKS) * SWEEP;
    const tf = i / TICKS;
    const isActive = tf <= frac;
    const isMajor = i % 12 === 0;
    const isMid = i % 6 === 0 && !isMajor;

    const len = isMajor ? 10 : isMid ? 6 : 3.5;
    const p1 = polar(cx, cy, rOuter, a);
    const p2 = polar(cx, cy, rOuter - len, a);

    let tickColor = 'rgba(40,50,70,0.5)';
    if (isActive) {
      if (tf < 0.5) tickColor = 'rgba(60,160,240,0.9)';
      else if (tf < 0.7) tickColor = 'rgba(0,210,220,0.9)';
      else if (tf < 0.85) tickColor = 'rgba(240,160,40,0.9)';
      else tickColor = 'rgba(230,50,50,0.9)';
    }

    ticks.push(
      <line key={`t${i}`} x1={p1.x} y1={p1.y} x2={p2.x} y2={p2.y}
        stroke={tickColor} strokeWidth={isMajor ? 2 : isMid ? 1.2 : 0.7}
        strokeLinecap="round" />
    );
  }

  // Scale labels
  const scaleLabels: React.ReactNode[] = [];
  const labelCount = 6;
  for (let i = 0; i <= labelCount; i++) {
    const a = START + (i / labelCount) * SWEEP;
    const p = polar(cx, cy, rOuter + 10, a);
    const mhz = Math.round((i / labelCount) * maxValue);
    const label = mhz >= 1000 ? `${(mhz / 1000).toFixed(mhz % 1000 === 0 ? 0 : 1)}k` : `${mhz}`;
    scaleLabels.push(
      <text key={`sl${i}`} x={p.x} y={p.y} textAnchor="middle" dominantBaseline="central"
        fill="rgba(130,150,180,0.6)" fontSize="7" fontFamily="'Segoe UI', system-ui, sans-serif" fontWeight="500">
        {label}
      </text>
    );
  }

  // Outer dots
  const dots: React.ReactNode[] = [];
  for (let i = 0; i < 48; i++) {
    const a = START + (i / 48) * SWEEP;
    const p = polar(cx, cy, rOuter + 4, a);
    const df = i / 48;
    const active = df <= frac;
    dots.push(
      <circle key={`d${i}`} cx={p.x} cy={p.y} r={active ? 1 : 0.6}
        fill={active ? colorBright : 'rgba(40,50,70,0.3)'}
        opacity={active ? 0.9 : 0.4} />
    );
  }

  // Circuit decorations
  const circuits: React.ReactNode[] = [];
  const circuitAngles = [160, 195, 235, 280, 325, 365];
  circuitAngles.forEach((a, i) => {
    const p1 = polar(cx, cy, rCenter + 2, a);
    const p2 = polar(cx, cy, rInner - 4, a);
    circuits.push(
      <line key={`c${i}`} x1={p1.x} y1={p1.y} x2={p2.x} y2={p2.y}
        stroke="rgba(50,70,100,0.2)" strokeWidth="0.5" />
    );
    circuits.push(
      <circle key={`cn${i}`} cx={p2.x} cy={p2.y} r="1.2"
        fill="none" stroke="rgba(50,80,120,0.25)" strokeWidth="0.5" />
    );
  });
  circuits.push(
    <line key="ch1" x1={cx - 30} y1={cy + 22} x2={cx + 30} y2={cy + 22}
      stroke="rgba(50,70,100,0.12)" strokeWidth="0.4" />,
    <line key="ch2" x1={cx - 20} y1={cy + 26} x2={cx + 20} y2={cy + 26}
      stroke="rgba(50,70,100,0.08)" strokeWidth="0.4" />
  );

  // Hexagonal
  const hexR = 14;
  const hexPoints = Array.from({ length: 6 }, (_, i) => {
    const a = 60 * i - 30;
    const p = polar(cx, cy - 36, hexR, a);
    return `${p.x},${p.y}`;
  }).join(' ');

  return (
    <motion.div
      className="ac-gauge-container"
      style={{ width: size, height: size }}
      initial={{ opacity: 0, scale: 0.85 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
    >
      <motion.div
        animate={{
          filter: `drop-shadow(0 0 ${20 + frac * 20}px hsla(${hue}, 80%, 40%, ${glowAlpha}))`,
        }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
        style={{ lineHeight: 0 }}
      >
        <svg viewBox={`0 0 ${V} ${V}`} width={size} height={size} style={{ overflow: 'visible' }}>
          <defs>
            <linearGradient id="arcGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#1a66cc" />
              <stop offset="35%" stopColor="#00ccdd" />
              <stop offset="60%" stopColor="#33cc88" />
              <stop offset="80%" stopColor="#ddaa22" />
              <stop offset="100%" stopColor="#cc2222" />
            </linearGradient>
            <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
            </filter>
            <filter id="glowStrong" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="5" result="blur" />
              <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
            </filter>
            <radialGradient id="centerGrad" cx="50%" cy="40%" r="60%">
              <stop offset="0%" stopColor="#1a1e2e" />
              <stop offset="100%" stopColor="#0e1018" />
            </radialGradient>
          </defs>

          {/* === BACKGROUND RINGS === */}
          <path d={arc(cx, cy, rOuter + 2, START, endAngle)}
            fill="none" stroke="rgba(30,40,60,0.3)" strokeWidth="1" />
          <path d={arc(cx, cy, rArc, START, endAngle)}
            fill="none" stroke="rgba(25,30,45,0.6)" strokeWidth="7" strokeLinecap="round" />
          <path d={arc(cx, cy, rMid, START, endAngle)}
            fill="none" stroke="rgba(20,28,40,0.4)" strokeWidth="2" />
          <path d={arc(cx, cy, rInner, START, endAngle)}
            fill="none" stroke="rgba(25,35,50,0.3)" strokeWidth="1.5" />
          <circle cx={cx} cy={cy} r={rCenter} fill="none"
            stroke="rgba(30,45,65,0.2)" strokeWidth="0.8" strokeDasharray="3 2" />

          {/* === CIRCUIT DECORATION === */}
          {circuits}
          <polygon points={hexPoints} fill="none" stroke="rgba(40,60,90,0.15)" strokeWidth="0.6" />

          {/* === ACTIVE ARC === */}
          {frac > 0.005 && (
            <>
              <motion.path
                d={arc(cx, cy, rArc, START, valAngle)}
                fill="none" stroke={color} strokeWidth="10" strokeLinecap="round"
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.15 }}
                transition={{ duration: 0.5 }}
                filter="url(#glowStrong)" />
              <motion.path
                d={arc(cx, cy, rArc, START, valAngle)}
                fill="none" stroke="url(#arcGrad)" strokeWidth="6" strokeLinecap="round"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }} />
              <path d={arc(cx, cy, rArc - 3, START, valAngle)}
                fill="none" stroke={colorBright} strokeWidth="0.8" strokeLinecap="round" opacity="0.4" />
            </>
          )}

          {/* === TICK MARKS === */}
          {ticks}

          {/* === SCALE LABELS === */}
          {scaleLabels}

          {/* === OUTER DOTS === */}
          {dots}

          {/* === NEEDLE (spring-animated) === */}
          <Needle cx={cx} cy={cy} rOuter={rOuter} rInner={rInner}
            angle={valAngle} color={color} colorBright={colorBright} />

          {/* Needle center cap */}
          <motion.circle cx={cx} cy={cy} r="6" fill="#1a1e2e"
            animate={{ stroke: color }} transition={{ duration: 0.6 }} strokeWidth="1.5" />
          <circle cx={cx} cy={cy} r="2.5" fill={colorBright} opacity="0.7" />

          {/* === CENTER READOUT === */}
          <circle cx={cx} cy={cy} r={rCenter - 4} fill="url(#centerGrad)" opacity="0.9" />

          {/* Value — spring-animated counter */}
          <text x={cx} y={cy - 6} textAnchor="middle" dominantBaseline="central"
            fill="#f0f2f8" fontSize="36" fontWeight="800"
            fontFamily="'Segoe UI', system-ui, sans-serif"
            style={{ filter: `drop-shadow(0 0 8px ${color})` }}>
            <AnimatedValue value={value} />
          </text>

          {/* Unit */}
          <text x={cx} y={cy + 16} textAnchor="middle" fill="rgba(140,160,190,0.8)"
            fontSize="11" fontWeight="600" fontFamily="'Segoe UI', system-ui, sans-serif"
            letterSpacing="1.5">
            MHz
          </text>

          {/* Label */}
          <text x={cx} y={cy + 28} textAnchor="middle" fill="rgba(100,120,150,0.5)"
            fontSize="9" fontWeight="500" fontFamily="'Segoe UI', system-ui, sans-serif"
            letterSpacing="2">
            CPU
          </text>

          {/* Bottom scale */}
          <text x={polar(cx, cy, rInner - 8, START + 12).x}
                y={polar(cx, cy, rInner - 8, START + 12).y}
            textAnchor="middle" fill="rgba(100,130,170,0.5)" fontSize="8" fontWeight="600">
            0
          </text>
          <text x={polar(cx, cy, rInner - 8, endAngle - 12).x}
                y={polar(cx, cy, rInner - 8, endAngle - 12).y}
            textAnchor="middle" fill="rgba(100,130,170,0.5)" fontSize="8" fontWeight="600">
            Max
          </text>

          {/* Ambient pulse ring */}
          <circle cx={cx} cy={cy} r={rArc} fill="none"
            stroke={color} strokeWidth="0.5" opacity="0.15">
            <animate attributeName="r" values={`${rArc};${rArc + 3};${rArc}`}
              dur="2s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="0.15;0.05;0.15"
              dur="2s" repeatCount="indefinite" />
          </circle>
        </svg>
      </motion.div>
    </motion.div>
  );
}
