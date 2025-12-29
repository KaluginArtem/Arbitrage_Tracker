import { makeHttp } from "../../utils/http";
import { ExchangeAdapter } from "../base";
import { PairRequest, TopOfBook } from "../../types";
import { toCryptoSymbol } from "./symbols";

export function cryptoComAdapter(): ExchangeAdapter {
  const http = makeHttp("https://api.crypto.com/v2");

  return {
    id: "crypto",

    supportsPair(): boolean {
      return true;
    },

    async fetchTopOfBook(pair: PairRequest): Promise<TopOfBook | null> {
      const symbol = toCryptoSymbol(pair);
      try {
        const res = await http.get("/public/get-book", {
          params: { instrument_name: symbol, depth: 1 },
        });

        const data = res.data?.result?.data?.[0];
        const bid = Number(data?.bids?.[0]?.[0]);
        const bidQty = Number(data?.bids?.[0]?.[1]);
        const ask = Number(data?.asks?.[0]?.[0]);
        const askQty = Number(data?.asks?.[0]?.[1]);

        if (!bid || !ask) return null;
        return { bid, ask, bidQty, askQty, ts: Date.now() };
      } catch {
        return null;
      }
    },
  };
}
