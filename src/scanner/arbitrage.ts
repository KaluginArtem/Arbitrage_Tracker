import { ArbitrageOpportunity, ExchangeQuote, PairRequest } from "../types";
import { pct } from "../utils/math";
import { CONFIG } from "../config";

export function findOppsForPair(quotes: ExchangeQuote[], pair: PairRequest): ArbitrageOpportunity[] {
  // buy = минимальный ask
  // sell = максимальный bid
  const valid = quotes.filter((q) => q.pair.base === pair.base && q.pair.quote === pair.quote);

  if (valid.length < 2) return [];

  const buyFrom = valid.reduce((best, cur) => (cur.book.ask < best.book.ask ? cur : best));
  const sellTo = valid.reduce((best, cur) => (cur.book.bid > best.book.bid ? cur : best));

  // если buy и sell одна и та же биржа — смысла нет
  if (buyFrom.exchange === sellTo.exchange) return [];

  if (sellTo.book.bid <= buyFrom.book.ask) return [];

  const spreadPct = pct(buyFrom.book.ask, sellTo.book.bid);

  // оценим доступный “объём” по top-of-book:
  // сколько базовой монеты реально можно купить/продать по лучшим ценам
  const baseQty = Math.min(buyFrom.book.askQty, sellTo.book.bidQty);
  const estNotional = baseQty * buyFrom.book.ask; // в quote валюте

  if (spreadPct < CONFIG.MIN_SPREAD_PCT) return [];
  if (estNotional < CONFIG.MIN_USDT_NOTIONAL) return [];

  return [{
    pair,
    buyFrom,
    sellTo,
    spreadPct,
    estNotionalUSDT: estNotional,
  }];
}
