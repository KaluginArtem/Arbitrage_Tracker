import { ExchangeId } from "../../layers/Universe/types";

export interface ListedMarket {
  base: string;
  quote: string;
  wsSymbol: string;
  tickSize?: number;
  stepSize?: number;
  minNotional?: number;
  status?: string;
}

export interface ExchangeRestClient {
  id: ExchangeId;
  listMarkets(): Promise<ListedMarket[]>;
}
