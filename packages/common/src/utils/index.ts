export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

export function formatTemperature(celsius: number): string {
  return `${celsius.toFixed(1)}°C`;
}

export function formatClockSpeed(mhz: number): string {
  if (mhz >= 1000) {
    return `${(mhz / 1000).toFixed(2)} GHz`;
  }
  return `${mhz.toFixed(0)} MHz`;
}

export function formatFanSpeed(percent: number): string {
  return `${percent.toFixed(0)}%`;
}

export function formatPowerUsage(watts: number): string {
  return `${watts.toFixed(1)} W`;
}

export function formatPercent(value: number): string {
  return `${value.toFixed(1)}%`;
}
