import axios from "axios";
import { ExchangeRestClient, ListedMarket } from "./base";

type CryptoInstrument = {
  instrument_name: string;   // BTC_USDT
  base_currency: string;
  quote_currency: string;
  price_decimals?: number;
  quantity_decimals?: number;
  // есть и другие поля
};

type CryptoResp = {
  id: number;
  method?: string;
  code?: number;
  result?: {
    instruments: CryptoInstrument[];
  };
};

export function createCryptoComRestClient(): ExchangeRestClient {
  const http = axios.create({
    baseURL: "https://api.crypto.com",
    timeout: 15_000,
  });

  return {
    id: "crypto",
    async listMarkets(): Promise<ListedMarket[]> {
      const res = await http.get<CryptoResp>("/exchange/v1/public/get-instruments");
      const instruments = res.data?.result?.instruments ?? [];

      const out: ListedMarket[] = [];
      for (const i of instruments) {
        if (!i.instrument_name || !i.base_currency || !i.quote_currency) continue;

        out.push({
          base: i.base_currency,
          quote: i.quote_currency,
          wsSymbol: i.instrument_name, // BTC_USDT (WS тоже так использует)
          status: "TRADING",
        });
      }

      return out;
    }
  };
}
