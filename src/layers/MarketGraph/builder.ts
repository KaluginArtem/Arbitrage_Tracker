import { MarketSnapshot } from "../MarketState/types";
import { MarketGraph, GraphEdge, MarketGraphImpl } from "./types";
import { EXCHANGE_FEES } from "../../config/fees";

export class MarketGraphBuilder {
  static build(snapshot: MarketSnapshot): MarketGraph {
    const edges: GraphEdge[] = [];

    for (const [, exMap] of snapshot) {
      for (const q of exMap.values()) {
        // q: StoredQuote = { exchange, symbol, base, quote, bid, ask, bidQty, askQty, tsLocal, ... }

        // SELL: base -> quote using best bid
        if (q.bid > 0 && q.bidQty > 0) {
          edges.push({
            from: q.base,
            to: q.quote,
            rate: q.bid,                 // 1 base -> bid quote
            maxSize: q.bidQty,           // in base units (from=base)
            exchange: q.exchange,
            symbol: q.symbol,
            ts: q.tsLocal,
            px: q.bid,
            qtyBase: q.bidQty,
            side: "sell",
          });
        }

        // BUY: quote -> base using best ask
        if (q.ask > 0 && q.askQty > 0) {
          edges.push({
            from: q.quote,
            to: q.base,
            rate: 1 / q.ask,             // 1 quote -> (1/ask) base
            maxSize: q.ask * q.askQty,   // ✅ in quote units (from=quote)
            exchange: q.exchange,
            symbol: q.symbol,
            ts: q.tsLocal,
            px: q.ask,
            qtyBase: q.askQty,
            side: "buy",
          });
        }
      }
    }

    return new MarketGraphImpl(edges);
  }
}
