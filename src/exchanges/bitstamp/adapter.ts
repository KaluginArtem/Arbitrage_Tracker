import { makeHttp } from "../../utils/http";
import { ExchangeAdapter } from "../base";
import { PairRequest, TopOfBook } from "../../types";
import { toBitstampSymbol } from "./symbols";

export function bitstampAdapter(): ExchangeAdapter {
  const http = makeHttp("https://www.bitstamp.net/api/v2");

  return {
    id: "bitstamp",

    supportsPair(): boolean {
      return true;
    },

    async fetchTopOfBook(pair: PairRequest): Promise<TopOfBook | null> {
      const symbol = toBitstampSymbol(pair);
      try {
        const res = await http.get(`/ticker/${symbol}`);
        const bid = Number(res.data.bid);
        const ask = Number(res.data.ask);
        const bidQty = Number(res.data.volume); // битстамп не возвращает bidQty напрямую
        const askQty = bidQty;

        if (!bid || !ask) return null;
        return { bid, ask, bidQty, askQty, ts: Date.now() };
      } catch {
        return null;
      }
    },
  };
}
