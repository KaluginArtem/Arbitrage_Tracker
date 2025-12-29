import { makeHttp } from "../../utils/http";
import { ExchangeAdapter } from "../base";
import { PairRequest, TopOfBook } from "../../types";
import { toBybitSymbol } from "./symbols";

export function bybitAdapter(): ExchangeAdapter {
  const http = makeHttp("https://api.bybit.com");

  return {
    id: "bybit",

    supportsPair(): boolean {
      return true;
    },

    async fetchTopOfBook(pair: PairRequest): Promise<TopOfBook | null> {
      const symbol = toBybitSymbol(pair);

      try {
        const res = await http.get("/v5/market/orderbook", {
          params: { category: "spot", symbol, limit: 1 },
        });

        const data = res.data?.result;
        const bids = data?.b ?? [];
        const asks = data?.a ?? [];

        if (!bids.length || !asks.length) return null;

        const [bidP, bidQ] = bids[0];
        const [askP, askQ] = asks[0];

        const bid = Number(bidP);
        const ask = Number(askP);
        const bidQty = Number(bidQ);
        const askQty = Number(askQ);

        if (!bid || !ask) return null;

        return { bid, ask, bidQty, askQty, ts: Date.now() };
      } catch {
        return null;
      }
    },
  };
}
