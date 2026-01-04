import axios from "axios";
import { ExchangeRestClient, ListedMarket } from "./base";

type KucoinSymbol = {
  symbol: string;        // BTC-USDT
  baseCurrency: string;
  quoteCurrency: string;
  enableTrading: boolean;
  priceIncrement?: string; // tick
  baseIncrement?: string;  // step
  baseMinSize?: string;    // min qty
};

type KucoinResp = { code: string; data: KucoinSymbol[] };

export function createKucoinRestClient(): ExchangeRestClient {
  const http = axios.create({
    baseURL: "https://api.kucoin.com",
    timeout: 15_000,
  });

  return {
    id: "kucoin",
    async listMarkets(): Promise<ListedMarket[]> {
      const res = await http.get<KucoinResp>("/api/v2/symbols");
      const out: ListedMarket[] = [];

      for (const s of res.data?.data ?? []) {
        if (!s.enableTrading) continue;
        if (!s.symbol || !s.baseCurrency || !s.quoteCurrency) continue;

        out.push({
          base: s.baseCurrency,
          quote: s.quoteCurrency,
          wsSymbol: s.symbol, // BTC-USDT (WS тоже часто BTC-USDT)
          tickSize: s.priceIncrement ? Number(s.priceIncrement) : undefined,
          stepSize: s.baseIncrement ? Number(s.baseIncrement) : undefined,
          minNotional: s.baseMinSize ? Number(s.baseMinSize) : undefined,
          status: s.enableTrading ? "TRADING" : "OFF",
        });
      }

      return out;
    }
  };
}
