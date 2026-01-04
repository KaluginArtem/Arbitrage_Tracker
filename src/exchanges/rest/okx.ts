import axios from "axios";
import { ExchangeRestClient, ListedMarket } from "./base";

type OkxInst = {
  instId: string;     // BTC-USDT
  instType: string;   // SPOT
  baseCcy: string;
  quoteCcy: string;
  tickSz?: string;
  lotSz?: string;
  state?: string;     // live
};

type OkxResp = { code: string; msg: string; data: OkxInst[] };

export function createOkxRestClient(): ExchangeRestClient {
  const http = axios.create({
    baseURL: "https://www.okx.com",
    timeout: 15_000,
  });

  return {
    id: "okx",
    async listMarkets(): Promise<ListedMarket[]> {
      const res = await http.get<OkxResp>("/api/v5/public/instruments", {
        params: { instType: "SPOT" }
      });

      const out: ListedMarket[] = [];
      for (const i of res.data?.data ?? []) {
        if (i.instType !== "SPOT") continue;
        if (!i.instId || !i.baseCcy || !i.quoteCcy) continue;

        out.push({
          base: i.baseCcy,
          quote: i.quoteCcy,
          wsSymbol: i.instId, // BTC-USDT (и для WS books instId)
          tickSize: i.tickSz ? Number(i.tickSz) : undefined,
          stepSize: i.lotSz ? Number(i.lotSz) : undefined,
          status: i.state,
        });
      }

      return out;
    }
  };
}
