export const estimate1RM = (weight: number, reps: number): number => {
  if (reps <= 0 || weight <= 0) return 0;
  if (reps === 1) return weight;
  return Math.round(weight * (1 + reps / 30) * 100) / 100;
};

export const kgToLbs = (kg: number): number => Math.round(kg * 2.20462 * 100) / 100;
export const lbsToKg = (lbs: number): number => Math.round((lbs / 2.20462) * 100) / 100;

export const formatWeight = (value: number, unit: 'kg' | 'lbs'): string => {
  const v = unit === 'lbs' ? kgToLbs(value) : value;
  return `${Number.isInteger(v) ? v.toFixed(0) : v.toFixed(1)} ${unit}`;
};

export const formatVolume = (value: number, unit: 'kg' | 'lbs'): string => {
  const v = unit === 'lbs' ? kgToLbs(value) : value;
  if (v >= 1000) return `${(v / 1000).toFixed(1)}k ${unit}`;
  return `${Math.round(v)} ${unit}`;
};

export const formatDuration = (totalSeconds: number): string => {
  if (totalSeconds <= 0) return '0:00';
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = Math.floor(totalSeconds % 60);
  if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  return `${m}:${String(s).padStart(2, '0')}`;
};

export const clamp = (n: number, min: number, max: number): number =>
  Math.max(min, Math.min(max, n));

export const sumBy = <T>(arr: T[], fn: (x: T) => number): number =>
  arr.reduce((acc, x) => acc + fn(x), 0);
