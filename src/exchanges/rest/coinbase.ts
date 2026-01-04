import axios from "axios";
import { ExchangeRestClient, ListedMarket } from "./base";

type CoinbaseProduct = {
  product_id: string;      // BTC-USD
  base_currency_id: string;
  quote_currency_id: string;
  status: string;          // online/offline
  price_increment?: string;
  base_increment?: string;
  quote_increment?: string;
};

type CoinbaseResp = {
  products: CoinbaseProduct[];
  num_products?: number;
};

export function createCoinbaseRestClient(): ExchangeRestClient {
  const http = axios.create({
    baseURL: "https://api.coinbase.com",
    timeout: 15_000,
    headers: { Accept: "application/json" },
  });

  return {
    id: "coinbase",
    async listMarkets(): Promise<ListedMarket[]> {
      const res = await http.get<CoinbaseResp>("/api/v3/brokerage/market/products");
      const out: ListedMarket[] = [];

      for (const p of res.data?.products ?? []) {
        if (!p.product_id || !p.base_currency_id || !p.quote_currency_id) continue;

        // статус может быть "online"
        out.push({
          base: p.base_currency_id,
          quote: p.quote_currency_id,
          wsSymbol: p.product_id, // BTC-USD (WS/REST обычно так же)
          tickSize: p.price_increment ? Number(p.price_increment) : undefined,
          stepSize: p.base_increment ? Number(p.base_increment) : undefined,
          status: p.status,
        });
      }

      return out;
    }
  };
}
