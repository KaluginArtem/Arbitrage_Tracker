import axios, { AxiosResponse } from "axios";
import { ExchangeRestClient, ListedMarket } from "./base";

type BybitInstr = {
  status: string;
  symbol: string;         // BTCUSDT
  baseCoin: string;
  quoteCoin: string;
  lotSizeFilter?: { basePrecision?: string; qtyStep?: string; minOrderQty?: string };
  priceFilter?: { tickSize?: string };
  minNotional?: string;
};

type BybitResp = {
  retCode: number;
  retMsg: string;
  result?: {
    category: "spot";
    list: BybitInstr[];
    nextPageCursor?: string;
  };
};

export function createBybitRestClient(): ExchangeRestClient {
  const http = axios.create({
    baseURL: "https://api.bybit.com",
    timeout: 15_000,
  });

  return {
    id: "bybit",
    async listMarkets(): Promise<ListedMarket[]> {
      const out: ListedMarket[] = [];
      let cursor: string | undefined = undefined;

      // pagination
      while (true) {
        const res: AxiosResponse<BybitResp> = await http.get<BybitResp>("/v5/market/instruments-info", {
          params: { category: "spot", limit: 500, cursor }
        });

        const list = res.data?.result?.list ?? [];
        for (const i of list) {
          // status бывает "Trading" / "Online" — фильтр делаем мягко
          if (!i.symbol || !i.baseCoin || !i.quoteCoin) continue;

          const stepSize = i.lotSizeFilter?.qtyStep ? Number(i.lotSizeFilter.qtyStep) : undefined;
          const tickSize = i.priceFilter?.tickSize ? Number(i.priceFilter.tickSize) : undefined;

          out.push({
            base: i.baseCoin,
            quote: i.quoteCoin,
            wsSymbol: i.symbol, // BTCUSDT (и для WS topic orderbook.1.BTCUSDT)
            stepSize,
            tickSize,
            minNotional: i.minNotional ? Number(i.minNotional) : undefined,
            status: i.status,
          });
        }

        const next = res.data?.result?.nextPageCursor;
        if (!next) break;
        cursor = next;
      }

      return out;
    }
  };
}
