import { GraphEdge } from "../MarketGraph/types";

export function computeMaxSize(path: GraphEdge[]): number {
  let size = Infinity;

  for (const edge of path) {
    size = Math.min(size, edge.maxSize);
  }

  return size;
}
