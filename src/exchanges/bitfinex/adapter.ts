import { makeHttp } from "../../utils/http";
import { ExchangeAdapter } from "../base";
import { PairRequest, TopOfBook } from "../../types";
import { toBitfinexSymbol } from "./symbols";

export function bitfinexAdapter(): ExchangeAdapter {
  const http = makeHttp("https://api-pub.bitfinex.com");

  return {
    id: "bitfinex",

    supportsPair(): boolean {
      return true;
    },

    async fetchTopOfBook(pair: PairRequest): Promise<TopOfBook | null> {
      const symbol = toBitfinexSymbol(pair);
      try {
        const res = await http.get(`/v2/ticker/${symbol}`);
        const [ , bid, , ask, , bidQty, askQty ] = res.data;

        if (!bid || !ask) return null;
        return {
          bid,
          ask,
          bidQty: bidQty || 0,
          askQty: askQty || 0,
          ts: Date.now(),
        };
      } catch {
        return null;
      }
    },
  };
}
