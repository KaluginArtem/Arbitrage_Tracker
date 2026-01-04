import { MarketDataEvent } from "../MarketData/types";
import { StoredQuote } from "./types";

const PRICE_EPS = 1e-8;

export function updateStability(
  prev: StoredQuote | undefined,
  next: MarketDataEvent
): number {
  if (!prev) return 1;

  const sameBid =
    Math.abs(prev.bid - next.bid) < PRICE_EPS &&
    Math.abs(prev.ask - next.ask) < PRICE_EPS;

  return sameBid ? prev.stableTicks + 1 : 1;
}
