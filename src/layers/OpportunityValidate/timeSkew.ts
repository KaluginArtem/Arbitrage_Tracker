import { GraphEdge } from "../MarketGraph/types";

export function validateTimeSkew(
  path: GraphEdge[],
  maxSkewMs: number
): boolean {
  const timestamps = path.map(e => e.ts);

  const min = Math.min(...timestamps);
  const max = Math.max(...timestamps);

  return (max - min) <= maxSkewMs;
}
