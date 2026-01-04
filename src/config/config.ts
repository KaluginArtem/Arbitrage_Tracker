import { ExchangeId } from "../types";

export const CONFIG = {
  ENV: process.env.NODE_ENV ?? "dev",

  // Биржи, которые участвуют в системе
  EXCHANGES: [
    "binance",
    "bybit",
    "okx",
    "kraken",
    "kucoin",
    "bitfinex",
    "bitstamp",
    "coinbase",
    "crypto",
  ] as const satisfies readonly ExchangeId[],
};
