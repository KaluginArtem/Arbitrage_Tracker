import { ExchangeId } from "../../types";

export interface MarketDataEvent {
  exchange: ExchangeId;
  symbol: string;
  base: string;
  quote: string;
  bid: number;
  ask: number;
  bidQty: number;
  askQty: number;
  tsLocal: number;
}
