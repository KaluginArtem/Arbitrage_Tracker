import { ExchangeId } from "../../types";

export type Asset = string;

export interface GraphEdge {
  from: Asset;
  to: Asset;

  rate: number;            // conversion multiplier (before fees)
  maxSize: number;         // max executable size IN "from" units

  exchange: ExchangeId;
  symbol: string;
  ts: number;

  // ✅ added for liquidity & debug
  px: number;              // best price used (bid or ask)
  qtyBase: number;         // qty at top-of-book in BASE units
  side: "buy" | "sell";    // buy=quote->base (using ask), sell=base->quote (using bid)
}

export interface MarketGraph {
  // adjacency list
  edgesFrom(asset: Asset): GraphEdge[];
  assets(): Asset[];
}

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
