export function pct(a: number, b: number): number {
  // (b - a) / a * 100
  return ((b - a) / a) * 100;
}

export function round2(n: number): number {
  return Math.round(n * 100) / 100;
}
