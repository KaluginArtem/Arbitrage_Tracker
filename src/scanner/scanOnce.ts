import { ExchangeAdapter } from "../exchanges/base";
import { ExchangeQuote, PairRequest, Quote } from "../types";
import { CONFIG } from "../config";
import { sleep } from "../utils/sleep";

export async function scanAllTopOfBook(adapters: ExchangeAdapter[], pairs: PairRequest[]): Promise<ExchangeQuote[]> {
  const out: ExchangeQuote[] = [];

  for (const pair of pairs) {
    for (const ex of adapters) {
      if (!ex.supportsPair(pair)) continue;

      const book = await ex.fetchTopOfBook(pair);
      if (book) out.push({ exchange: ex.id, pair, book });

      // маленькая пауза, чтобы не долбить API слишком быстро
      await sleep(80);
    }
  }

  return out;
}

export function buildPairs(): PairRequest[] {
  const bases = [
    "BTC", "ETH",
    "SOL", "BNB", "XRP", "ADA", "DOGE", "TRX", "TON", "DOT", "AVAX", "LINK", "MATIC",
    "LTC", "BCH", "ATOM", "XLM", "ETC", "FIL", "ICP", "APT", "ARB", "OP", "NEAR", "ALGO",
    "UNI", "AAVE", "SUSHI", "RUNE", "INJ", "SEI", "SUI", "TIA", "PEPE", "SHIB", "WIF", "BONK",
    "IMX", "GALA", "SAND", "MANA", "AXS", "FTM", "ENA"
  ];
  const quotes: Quote[] = ["USDT", "USDC"];

  const pairs: PairRequest[] = [];

  for (const base of bases) {
    for (const quote of quotes) {
      pairs.push({ base, quote });
    }
  }

  return pairs;
}