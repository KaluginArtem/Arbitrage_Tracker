export type ExchangeId = "binance" | "bybit" | "okx" | "kraken" | "kucoin" | "crypto" | "bitstamp" | "bitfinex" | "coinbase";

export type Quote = "USDT" | "USDC";

export interface TopOfBook {
  bid: number;      // лучшая цена покупки (мы можем продать по bid)
  ask: number;      // лучшая цена продажи (мы можем купить по ask)
  bidQty: number;   // объём по лучшему bid (в базовой монете)
  askQty: number;   // объём по лучшему ask (в базовой монете)
  ts: number;
}

export interface PairRequest {
  base: string;  // например "BTC"
  quote: Quote;  // например "USDT"
}

export interface ExchangeQuote {
  exchange: ExchangeId;
  pair: PairRequest;
  book: TopOfBook;
}

export interface ArbitrageOpportunity {
  pair: PairRequest;
  buyFrom: ExchangeQuote;   // где покупаем (по ask)
  sellTo: ExchangeQuote;    // где продаём (по bid)
  spreadPct: number;        // “грязный” %
  estNotionalUSDT: number;  // оценка “доступного” объёма по top-of-book в USDT/USDC эквиваленте
}
