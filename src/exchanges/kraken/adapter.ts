import { makeHttp } from "../../utils/http";
import { ExchangeAdapter } from "../base";
import { PairRequest, TopOfBook } from "../../types";
import { toKrakenPair } from "./symbols";

export function krakenAdapter(): ExchangeAdapter {
  const http = makeHttp("https://api.kraken.com");

  return {
    id: "kraken",

    supportsPair(pair: PairRequest): boolean {
      return toKrakenPair(pair) !== null;
    },

    async fetchTopOfBook(pair: PairRequest): Promise<TopOfBook | null> {
      const krPair = toKrakenPair(pair);
      if (!krPair) return null;

      try {
        const res = await http.get("/0/public/Depth", {
          params: { pair: krPair, count: 1 },
        });

        const result = res.data?.result;
        if (!result) return null;

        const firstKey = Object.keys(result)[0];
        const book = result[firstKey];

        const bids = book?.bids ?? [];
        const asks = book?.asks ?? [];
        if (!bids.length || !asks.length) return null;

        const bid = Number(bids[0][0]);
        const bidQty = Number(bids[0][1]);
        const ask = Number(asks[0][0]);
        const askQty = Number(asks[0][1]);

        if (!bid || !ask) return null;

        return { bid, ask, bidQty, askQty, ts: Date.now() };
      } catch {
        return null;
      }
    },
  };
}
