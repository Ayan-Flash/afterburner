import { useEffect, useState } from 'react';

/* ================================================================
   useCpuData — Simulated CPU telemetry.

   The Rust backend currently only monitors the GPU, so the CPU
   panel/gauge/core-cards are driven by realistic simulated values
   that drift over time around the reference figures. Swap this for
   a real `cpuService` (Tauri invoke) when backend CPU monitoring
   lands — the shape below is what the UI consumes.
   ================================================================ */

export interface CpuCoreData {
  coreIndex: number;
  frequency: number; // MHz
}

export interface CpuData {
  /** Package/aggregate frequency shown in the big gauge (MHz) */
  frequency: number;
  voltage: number; // V
  temperature: number; // °C
  maxFrequency: number; // MHz (gauge scale)
  cores: CpuCoreData[];
}

// Baseline values pulled from the reference image.
const BASE_CORES = [4139, 4163, 2094, 2759];
const BASE_PACKAGE = 3467;

function drift(base: number, spread: number, seed: number, t: number): number {
  // Deterministic-ish smooth wander (no Math.random — plays nicely with
  // reduced-motion/testing and avoids jitter).
  const wave = Math.sin(t / 1400 + seed) * 0.6 + Math.sin(t / 600 + seed * 2) * 0.4;
  return Math.round(base + wave * spread);
}

export function useCpuData(): CpuData {
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setTick((n) => n + 1), 1000);
    return () => clearInterval(id);
  }, []);

  const now = tick * 1000;
  const cores = BASE_CORES.map((base, i) => ({
    coreIndex: i,
    frequency: drift(base, 180, i + 1, now),
  }));

  return {
    frequency: drift(BASE_PACKAGE, 220, 0, now),
    voltage: 0.976 + Math.sin(now / 2000) * 0.02,
    temperature: 31 + Math.round(Math.sin(now / 3000) * 2),
    maxFrequency: 5000,
    cores,
  };
}
