import { MarketDataEvent } from "../MarketData/types";
import { ExchangeId } from "../../types";

export interface StoredQuote extends MarketDataEvent {
  lastUpdated: number;
  stableTicks: number;
}

export type Symbol = string; // BTC/USDT

export type MarketSnapshot = Map<ExchangeId, Map<Symbol, StoredQuote>>;
