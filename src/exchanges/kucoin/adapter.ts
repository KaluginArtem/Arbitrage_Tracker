import { makeHttp } from "../../utils/http";
import { ExchangeAdapter } from "../base";
import { PairRequest, TopOfBook } from "../../types";
import { toKucoinSymbol } from "./symbols";

export function kucoinAdapter(): ExchangeAdapter {
  const http = makeHttp("https://api.kucoin.com");

  return {
    id: "kucoin",

    supportsPair(): boolean {
      return true;
    },

    async fetchTopOfBook(pair: PairRequest): Promise<TopOfBook | null> {
      const symbol = toKucoinSymbol(pair);

      try {
        const res = await http.get("/api/v1/market/orderbook/level1", {
          params: { symbol },
        });

        const d = res.data?.data;
        if (!d) return null;

        const bid = Number(d.bestBid);
        const ask = Number(d.bestAsk);
        const bidQty = Number(d.bestBidSize);
        const askQty = Number(d.bestAskSize);

        if (!bid || !ask) return null;

        return { bid, ask, bidQty, askQty, ts: Date.now() };
      } catch {
        return null;
      }
    },
  };
}
