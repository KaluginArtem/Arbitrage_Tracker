import axios from "axios";
import { ExchangeRestClient, ListedMarket } from "./base";

type KrakenPair = {
  wsname?: string;      // XBT/USD
  base: string;         // XXBT
  quote: string;        // ZUSD
  altname: string;      // XBTUSD
  status?: string;
  pair_decimals?: number;
  lot_decimals?: number;
  ordermin?: string;
};

type KrakenResp = { error: string[]; result: Record<string, KrakenPair> };

export function createKrakenRestClient(): ExchangeRestClient {
  const http = axios.create({
    baseURL: "https://api.kraken.com",
    timeout: 15_000,
  });

  return {
    id: "kraken",
    async listMarkets(): Promise<ListedMarket[]> {
      const res = await http.get<KrakenResp>("/0/public/AssetPairs");
      if ((res.data?.error ?? []).length) {
        throw new Error(`Kraken AssetPairs error: ${res.data.error.join(",")}`);
      }

      const out: ListedMarket[] = [];
      const pairs = res.data?.result ?? {};

      for (const k of Object.keys(pairs)) {
        const p = pairs[k];
        if (!p.wsname) continue;

        const [base, quote] = p.wsname.split("/");
        if (!base || !quote) continue;

        out.push({
          base,
          quote,
          wsSymbol: p.wsname, // XBT/USD — WS удобно подписывать так же
          stepSize: undefined,
          tickSize: undefined,
          minNotional: p.ordermin ? Number(p.ordermin) : undefined,
          status: p.status,
        });
      }

      return out;
    }
  };
}
