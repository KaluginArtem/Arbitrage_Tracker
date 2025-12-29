import Decimal from "decimal.js";
import { ExchangeQuote } from "../types";
import { getRate } from "../utils/conversionRates";

export function normalizeQuotes(quotes: ExchangeQuote[]): ExchangeQuote[] {
  return quotes.map(q => {
    const rate = getRate(q.pair.quote, "USDT");
    if (!rate) return q;

    const ask = new Decimal(q.book.ask).mul(rate);
    const bid = new Decimal(q.book.bid).mul(rate);
    const askQty = new Decimal(q.book.askQty);
    const bidQty = new Decimal(q.book.bidQty);

    return {
      ...q,
      convertedToUSDT: {
        bid: bid.toDecimalPlaces(10).toNumber(),
        ask: ask.toDecimalPlaces(10).toNumber(),
        bidQty: bidQty.toNumber(),
        askQty: askQty.toNumber(),
        ts: q.book.ts,
      },
    };
  });
}
