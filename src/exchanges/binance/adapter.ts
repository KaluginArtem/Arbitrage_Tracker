import { makeHttp } from "../../utils/http";
import { ExchangeAdapter } from "../base";
import { PairRequest, TopOfBook } from "../../types";
import { toBinanceSymbol } from "./symbols";

export function binanceAdapter(): ExchangeAdapter {
  const http = makeHttp("https://api.binance.com");

  return {
    id: "binance",

    supportsPair(pair: PairRequest): boolean {
      // Binance почти всегда имеет USDT/USDC на крупных
      return true;
    },

    async fetchTopOfBook(pair: PairRequest): Promise<TopOfBook | null> {
      const symbol = toBinanceSymbol(pair);

      try {
        const res = await http.get("/api/v3/ticker/bookTicker", { params: { symbol } });
        const d = res.data;

        const bid = Number(d.bidPrice);
        const ask = Number(d.askPrice);
        const bidQty = Number(d.bidQty);
        const askQty = Number(d.askQty);

        if (!bid || !ask) return null;

        return { bid, ask, bidQty, askQty, ts: Date.now() };
      } catch {
        return null;
      }
    },
  };
}
