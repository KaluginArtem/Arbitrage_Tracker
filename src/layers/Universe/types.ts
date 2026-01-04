export type ExchangeId = "binance"|"bybit"|"okx"|"kraken"|"bitfinex"|"bitstamp"|"coinbase"|"crypto"|"kucoin";

export interface UniverseMarket {
  exchange: ExchangeId;

  // единый формат для твоего графа
  symbol: string;        // "BTC/USDT"
  base: string;          // "BTC"
  quote: string;         // "USDT"

  // идентификатор для WS этой биржи
  wsSymbol: string;      // Binance: "BTCUSDT", OKX:"BTC-USDT", Crypto:"BTC_USDT", Bitstamp:"btcusdt", ...
  
  // метаданные рынка (потом понадобятся для execution)
  tickSize?: number;
  stepSize?: number;
  minNotional?: number;
  status?: "TRADING" | "ONLINE" | "HALTED" | string;
}

export interface Universe {
  byExchange: Map<ExchangeId, UniverseMarket[]>;
  // быстрый lookup для фильтра и валидации:
  has(exchange: ExchangeId, symbol: string): boolean;
  get(exchange: ExchangeId, symbol: string): UniverseMarket | undefined;
}
