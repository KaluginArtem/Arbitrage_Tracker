export function isStale(
  lastUpdated: number,
  now: number,
  maxAgeMs: number
): boolean {
  return now - lastUpdated > maxAgeMs;
}
