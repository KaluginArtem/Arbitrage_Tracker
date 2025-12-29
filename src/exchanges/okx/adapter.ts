import { makeHttp } from "../../utils/http";
import { ExchangeAdapter } from "../base";
import { PairRequest, TopOfBook } from "../../types";
import { toOkxInstId } from "./symbols";

export function okxAdapter(): ExchangeAdapter {
  const http = makeHttp("https://www.okx.com");

  return {
    id: "okx",

    supportsPair(): boolean {
      return true;
    },

    async fetchTopOfBook(pair: PairRequest): Promise<TopOfBook | null> {
      const instId = toOkxInstId(pair);

      try {
        const res = await http.get("/api/v5/market/books", {
          params: { instId, sz: 1 },
        });

        const row = res.data?.data?.[0];
        const bids = row?.bids ?? [];
        const asks = row?.asks ?? [];

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
