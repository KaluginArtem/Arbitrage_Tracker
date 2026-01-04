import { ExchangeId, Universe, UniverseMarket } from "./types";
import { ALL_ASSETS, QUOTE_ASSETS } from "../../config/universe";
import { createExchangeRestClients } from "../../exchanges/rest/index"; // ты создашь
import { canonicalAsset } from "./normalize";

export class UniverseBuilder {
  static async buildLive(exchanges: ExchangeId[]): Promise<Universe> {
    const rest = createExchangeRestClients(exchanges);

    const byExchange = new Map<ExchangeId, UniverseMarket[]>();
    const index = new Map<string, UniverseMarket>();

    // фильтры
    const coins = new Set(ALL_ASSETS.map(canonicalAsset));
    const quotes = new Set(QUOTE_ASSETS.map(canonicalAsset));

    for (const ex of exchanges) {
      const client = rest.get(ex);
      if (!client) continue;

      const rawMarkets = await client.listMarkets(); // REST
      const normalized: UniverseMarket[] = [];

      for (const m of rawMarkets) {
        const base = canonicalAsset(m.base);
        const quote = canonicalAsset(m.quote);

        if (!coins.has(base)) continue;
        if (!quotes.has(quote)) continue;

        const symbol = `${base}/${quote}`;
        normalized.push({
          exchange: ex,
          symbol,
          base,
          quote,
          wsSymbol: m.wsSymbol,
          tickSize: m.tickSize,
          stepSize: m.stepSize,
          minNotional: m.minNotional,
          status: m.status,
        });

        index.set(`${ex}:${symbol}`, normalized[normalized.length - 1]);
      }

      byExchange.set(ex, normalized);
      console.log(`[UNIVERSE] ${ex}: markets=${normalized.length}`);
    }

    const universe: Universe = {
      byExchange,
      has(exchange, symbol) {
        return index.has(`${exchange}:${symbol}`);
      },
      get(exchange, symbol) {
        return index.get(`${exchange}:${symbol}`);
      }
    };

    // полезный лог: сколько общих пар для cross-exchange
    const common = countCommonSymbols(universe);
    console.log(`[UNIVERSE] common symbols across exchanges: ${common}`);

    return universe;
  }
}

function countCommonSymbols(universe: Universe): number {
  const symbolToExchanges = new Map<string, Set<ExchangeId>>();

  for (const [exchange, markets] of universe.byExchange) {
    for (const m of markets) {
      let set = symbolToExchanges.get(m.symbol);
      if (!set) {
        set = new Set();
        symbolToExchanges.set(m.symbol, set);
      }
      set.add(exchange);
    }
  }

  // считаем символы, которые есть минимум на 2 биржах
  return [...symbolToExchanges.values()]
    .filter(set => set.size >= 2)
    .length;
}