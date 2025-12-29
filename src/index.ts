import "dotenv/config";
import { CONFIG } from "./config";
import { buildPairs } from "./scanner/scanOnce";
import { findOppsForPair } from "./scanner/arbitrage";
import { formatBatch } from "./utils/format";
import { getWebSocketAdapters } from "./exchanges/websocketFactory";
import { ExchangeId, ExchangeQuote, PairRequest, TopOfBook } from "./types";

type QuotesMap = Map<string, ExchangeQuote[]>;
const quotesMap: QuotesMap = new Map();

function updateQuotesMap(exchange: ExchangeId, pair: PairRequest, book: TopOfBook) {
  const key = `${pair.base}_${pair.quote}`;
  const existing = quotesMap.get(key) || [];

  const updated = existing.filter(q => q.exchange !== exchange);
  updated.push({ exchange, pair, book });

  quotesMap.set(key, updated);
}

function evaluateArbitrage(pair: PairRequest) {
  const key = `${pair.base}_${pair.quote}`;
  const quotes = quotesMap.get(key);
  if (!quotes || quotes.length < 2) return;

  const results = findOppsForPair(quotes, pair);
  if (results.length === 0) return;

  const best = results.sort((a, b) => b.spreadPct - a.spreadPct)[0];

  if (best.spreadPct >= CONFIG.MIN_SPREAD_PCT) {
    console.log("========================================");
    console.log(`📈 Arbitrage opportunity (${pair.base}/${pair.quote})`);
    console.log(formatBatch([best]));
    console.log("");
  }
}

function main() {
  console.log("🚀 Crypto arbitrage scanner (WebSocket mode)\n");

  const pairs = buildPairs();
  const adapters = getWebSocketAdapters();

  console.log(`Subscribing to ${pairs.length} pairs on ${adapters.length} exchanges...`);

  for (const pair of pairs) {
    for (const adapter of adapters) {
      if (!adapter.supportsPair(pair)) continue;

      try {
        adapter.subscribe(pair, (book: TopOfBook) => {
          updateQuotesMap(adapter.id as ExchangeId, pair, book);
          evaluateArbitrage(pair);
        });
      } catch (err) {
        console.error(`❌ WS error on ${adapter.id} (${pair.base}/${pair.quote}):`, err);
      }
    }
  }
}

main();
