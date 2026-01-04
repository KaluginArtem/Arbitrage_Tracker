import axios from "axios";
import { ExchangeRestClient, ListedMarket } from "./base";

type BinanceFilter =
  | { filterType: "LOT_SIZE"; stepSize: string; minQty: string; maxQty: string }
  | { filterType: "PRICE_FILTER"; tickSize: string; minPrice: string; maxPrice: string }
  | { filterType: "MIN_NOTIONAL"; minNotional: string }
  | { filterType: "NOTIONAL"; minNotional?: string; notional?: string }
  | { filterType: string; [k: string]: any };

type BinanceSymbol = {
  symbol: string;
  status: string;
  baseAsset: string;
  quoteAsset: string;
  isSpotTradingAllowed?: boolean;
  filters: BinanceFilter[];
};

type BinanceExchangeInfo = { symbols: BinanceSymbol[] };

function filterMap(filters: BinanceFilter[]) {
  return new Map(filters.map(f => [f.filterType, f]));
}

export function createBinanceRestClient(): ExchangeRestClient {
  const http = axios.create({
    baseURL: "https://api.binance.com",
    timeout: 15_000,
  });

  return {
    id: "binance",
    async listMarkets(): Promise<ListedMarket[]> {
      const res = await http.get<BinanceExchangeInfo>("/api/v3/exchangeInfo");
      const symbols = res.data?.symbols ?? [];

      const out: ListedMarket[] = [];

      for (const s of symbols) {
        if (s.status !== "TRADING") continue;
        if (s.isSpotTradingAllowed === false) continue;

        const fm = filterMap(s.filters ?? []);
        const lot = fm.get("LOT_SIZE") as Extract<BinanceFilter, { filterType: "LOT_SIZE" }> | undefined;
        const price = fm.get("PRICE_FILTER") as Extract<BinanceFilter, { filterType: "PRICE_FILTER" }> | undefined;

        const mn =
          (fm.get("MIN_NOTIONAL") as Extract<BinanceFilter, { filterType: "MIN_NOTIONAL" }> | undefined) ??
          (fm.get("NOTIONAL") as Extract<BinanceFilter, { filterType: "NOTIONAL" }> | undefined);

        const stepSize = lot ? Number(lot.stepSize) : undefined;
        const tickSize = price ? Number(price.tickSize) : undefined;
        const minNotional = mn ? Number((mn as any).minNotional ?? (mn as any).notional) : undefined;

        out.push({
          base: s.baseAsset,
          quote: s.quoteAsset,
          wsSymbol: s.symbol, // BTCUSDT (совпадает с WS)
          stepSize,
          tickSize,
          minNotional,
          status: s.status,
        });
      }

      return out;
    }
  };
}
