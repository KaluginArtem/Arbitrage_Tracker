import { MarketDataEvent } from "../MarketData/types";
import { StoredQuote, MarketSnapshot } from "./types";
import { updateStability } from "./quality";
import { isStale } from "./staleness";
import { now } from "../../utils/time";
import { ExchangeId } from "../../types";

export class MarketState {
  private snapshot: MarketSnapshot = new Map();
  private readonly MAX_QUOTE_AGE_MS = 20_000;

  update(event: MarketDataEvent): void {
    const exchange = event.exchange;
    const symbol = event.symbol;

    let exchangeMap = this.snapshot.get(exchange);
    if (!exchangeMap) {
      exchangeMap = new Map();
      this.snapshot.set(exchange, exchangeMap);
    }

    const prev = exchangeMap.get(symbol);

    const stored: StoredQuote = {
      ...event,
      lastUpdated: now(),
      stableTicks: updateStability(prev, event),
    };

    // ✅ log only if changed (or first time)
    const changed =
      !prev ||
      prev.bid !== stored.bid ||
      prev.ask !== stored.ask ||
      prev.bidQty !== stored.bidQty ||
      prev.askQty !== stored.askQty;

    exchangeMap.set(symbol, stored);
  }

  get(exchange: ExchangeId, symbol: string): StoredQuote | null {
    const exMap = this.snapshot.get(exchange);
    if (!exMap) return null;

    const q = exMap.get(symbol);
    if (!q) return null;

    if (isStale(q.lastUpdated, now(), this.MAX_QUOTE_AGE_MS)) return null;
    return q;
  }

  getBySymbol(symbol: string): StoredQuote[] {
    const out: StoredQuote[] = [];
    for (const [, exMap] of this.snapshot) {
      const q = exMap.get(symbol);
      if (!q) continue;
      if (!isStale(q.lastUpdated, now(), this.MAX_QUOTE_AGE_MS)) out.push(q);
    }
    return out;
  }

  getSnapshot(): MarketSnapshot {
    const fresh: MarketSnapshot = new Map();

    for (const [exchange, exMap] of this.snapshot) {
      for (const [symbol, q] of exMap) {
        if (isStale(q.lastUpdated, now(), this.MAX_QUOTE_AGE_MS)) continue;

        let dest = fresh.get(exchange);
        if (!dest) {
          dest = new Map();
          fresh.set(exchange, dest);
        }

        dest.set(symbol, q);
      }
    }

    return fresh;
  }

  cleanup(): void {
    const ts = now();
    for (const [exchange, exMap] of this.snapshot) {
      for (const [symbol, q] of exMap) {
        if (isStale(q.lastUpdated, ts, this.MAX_QUOTE_AGE_MS)) {
          exMap.delete(symbol);
        }
      }
      if (exMap.size === 0) this.snapshot.delete(exchange);
    }
  }
}
