import axios from "axios";
import { ExchangeRestClient, ListedMarket } from "./base";

type BitstampPair = {
  name: string;                 // "btcusdt" или "BTC/USD" в разных версиях
  url_symbol?: string;          // "btcusdt"
  trading?: string;             // "Enabled"/...
  minimum_order?: string;       // min size
  base_decimals?: number;
  counter_decimals?: number;
};

export function createBitstampRestClient(): ExchangeRestClient {
  const http = axios.create({
    baseURL: "https://www.bitstamp.net",
    timeout: 15_000,
  });

  return {
    id: "bitstamp",
    async listMarkets(): Promise<ListedMarket[]> {
      // самый распространённый публичный endpoint:
      const res = await http.get<BitstampPair[]>("/api/v2/trading-pairs-info/");
      const list = res.data ?? [];

      const out: ListedMarket[] = [];

      for (const p of list) {
        const enabled = (p.trading ?? "").toLowerCase().includes("enabled");
        if (!enabled) continue;

        // нормализуем в BASE/QUOTE
        const raw = (p.name || p.url_symbol || "").toUpperCase();
        const urlSym = (p.url_symbol || p.name || "").toLowerCase();

        // часто name = "BTC/USD" или "btcusdt"
        let base = "";
        let quote = "";

        if (raw.includes("/")) {
          const [b, q] = raw.split("/");
          base = b;
          quote = q;
        } else {
          const QUOTES = ["USDT","USD","EUR","BTC","ETH","GBP"];
          const q = QUOTES.find(x => raw.endsWith(x));
          if (!q) continue;
          base = raw.slice(0, raw.length - q.length);
          quote = q;
        }

        if (!base || !quote) continue;

        out.push({
          base,
          quote,
          wsSymbol: urlSym, // для WS у Bitstamp часто order_book_btcusdt
          minNotional: p.minimum_order ? Number(p.minimum_order) : undefined,
          status: "TRADING",
        });
      }

      return out;
    }
  };
}
