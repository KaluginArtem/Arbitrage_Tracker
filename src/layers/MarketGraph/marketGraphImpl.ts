import { Asset, GraphEdge, MarketGraph } from "./types";

export class MarketGraphImpl implements MarketGraph {
  private adj = new Map<Asset, GraphEdge[]>();

  constructor(edges: GraphEdge[]) {
    for (const e of edges) {
      if (!this.adj.has(e.from)) {
        this.adj.set(e.from, []);
      }
      this.adj.get(e.from)!.push(e);
    }
  }

  edgesFrom(asset: Asset): GraphEdge[] {
    return this.adj.get(asset) ?? [];
  }

  assets(): Asset[] {
    return Array.from(this.adj.keys());
  }
}
