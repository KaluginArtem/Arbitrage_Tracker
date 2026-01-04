import { MarketSnapshot } from "../MarketState/types";
import { OpportunityCandidate } from "./types";
import { GraphEdge } from "../MarketGraph/types";

export class CrossExchangeFinder {
  static find(snapshot: MarketSnapshot): OpportunityCandidate[] {
    const bySymbol = new Map<string, any[]>();

    for (const [, exMap] of snapshot) {
      for (const q of exMap.values()) {
        const arr = bySymbol.get(q.symbol);
        if (arr) arr.push(q);
        else bySymbol.set(q.symbol, [q]);
      }
    }

    const out: OpportunityCandidate[] = [];

    for (const [symbol, quotes] of bySymbol) {
      if (quotes.length < 2) continue;

      for (const buy of quotes) {
        if (!buy.ask || !buy.askQty) continue;

        for (const sell of quotes) {
          if (!sell.bid || !sell.bidQty) continue;

          if (buy.exchange === sell.exchange) continue;

          // бумажный чек (без fees, slippage)
          if (buy.ask >= sell.bid) continue;

          // BUY: quote -> base @ ask
          const buyEdge: GraphEdge = {
            from: buy.quote,
            to: buy.base,
            rate: 1 / buy.ask,
            exchange: buy.exchange,
            symbol,
            ts: buy.tsLocal,

            px: buy.ask,
            qtyBase: buy.askQty,
            side: "buy",

            // max executable size in "from" units = quote
            maxSize: buy.ask * buy.askQty,
          };

          // SELL: base -> quote @ bid
          const sellEdge: GraphEdge = {
            from: sell.base,
            to: sell.quote,
            rate: sell.bid,
            exchange: sell.exchange,
            symbol,
            ts: sell.tsLocal,

            px: sell.bid,
            qtyBase: sell.bidQty,
            side: "sell",

            // max executable size in "from" units = base
            maxSize: sell.bidQty,
          };

          out.push({
            type: "cross",
            buyExchange: buy.exchange,
            sellExchange: sell.exchange,
            symbol,
            path: [buyEdge, sellEdge],
          });
        }
      }
    }

    return out;
  }
}
