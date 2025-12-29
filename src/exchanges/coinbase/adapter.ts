import { makeHttp } from "../../utils/http";
import { ExchangeAdapter } from "../base";
import { PairRequest, TopOfBook } from "../../types";
import { toCoinbaseSymbol } from "./symbols";

export function coinbaseAdapter(): ExchangeAdapter {
  const http = makeHttp("https://api.exchange.coinbase.com");

  return {
    id: "coinbase",

    supportsPair(): boolean {
      return true;
    },

    async fetchTopOfBook(pair: PairRequest): Promise<TopOfBook | null> {
      const symbol = toCoinbaseSymbol(pair);
      try {
        const res = await http.get(`/products/${symbol}/book`, {
          params: { level: 1 },
        });

        const bid = Number(res.data.bids?.[0]?.[0]);
        const ask = Number(res.data.asks?.[0]?.[0]);
        const bidQty = Number(res.data.bids?.[0]?.[1]);
        const askQty = Number(res.data.asks?.[0]?.[1]);

        if (!bid || !ask) return null;
        return { bid, ask, bidQty, askQty, ts: Date.now() };
      } catch {
        return null;
      }
    },
  };
}
