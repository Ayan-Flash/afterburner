
import { PanelFrame } from './PanelFrame';

/* ================================================================
   FanPanel — "Fan Speed" panel with 4 mode icons:
   Silence, Standard, Turbo, Full speed
   ================================================================ */

interface FanPanelProps {
  activeMode?: 'silence' | 'standard' | 'turbo' | 'full';
  onModeChange?: (mode: string) => void;
}

// Fan/propeller SVG icon
function FanIcon({ speed, size = 36 }: { speed: number; size?: number }) {
  const animDuration = speed === 0 ? 0 : Math.max(0.3, 2 - speed * 0.5);

  return (
    <svg width={size} height={size} viewBox="0 0 36 36" fill="none">
      <g
        style={{
          transformOrigin: '18px 18px',
          animation: speed > 0 ? `ac-spin ${animDuration}s linear infinite` : 'none',
        }}
      >
        {/* Fan blades */}
        <path d="M18 6 C18 6 22 12 18 18 C14 12 18 6 18 6Z" fill="currentColor" opacity="0.7" />
        <path d="M30 18 C30 18 24 22 18 18 C24 14 30 18 30 18Z" fill="currentColor" opacity="0.7" />
        <path d="M18 30 C18 30 14 24 18 18 C22 24 18 30 18 30Z" fill="currentColor" opacity="0.7" />
        <path d="M6 18 C6 18 12 14 18 18 C12 22 6 18 6 18Z" fill="currentColor" opacity="0.7" />
        {/* Center hub */}
        <circle cx="18" cy="18" r="3" fill="currentColor" opacity="0.9" />
      </g>
      <style>{`
        @keyframes ac-spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </svg>
  );
}

const modes = [
  { id: 'silence', label: 'Silence', speed: 0 },
  { id: 'standard', label: 'Standard', speed: 1 },
  { id: 'turbo', label: 'Turbo', speed: 2 },
  { id: 'full', label: 'Full speed', speed: 3 },
] as const;

export function FanPanel({ activeMode = 'standard', onModeChange }: FanPanelProps) {
  return (
    <PanelFrame title="Fan Speed">
      <div className="ac-fan-modes">
        {modes.map((mode) => (
          <button
            key={mode.id}
            className={`ac-fan-mode ${activeMode === mode.id ? 'ac-fan-mode--active' : ''}`}
            onClick={() => onModeChange?.(mode.id)}
          >
            <FanIcon speed={mode.speed} />
            <span className="ac-fan-mode__label">{mode.label}</span>
          </button>
        ))}
      </div>
    </PanelFrame>
  );
}
