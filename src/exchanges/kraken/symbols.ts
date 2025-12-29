import { PairRequest } from "../../types";

// Kraken часто использует XBT вместо BTC, а пары выглядят как XBTUSDT или XBTUSD и т.д.
const BASE_MAP: Record<string, string> = {
  BTC: "XBT",
  ETH: "ETH",
  SOL: "SOL",
  XRP: "XRP",
  ADA: "ADA",
  DOT: "DOT",
  AVAX: "AVAX",
  LINK: "LINK",
  LTC: "LTC",
  BCH: "BCH",
  ATOM: "ATOM",
  XLM: "XLM",
  ETC: "ETC",
  FIL: "FIL",
  ICP: "ICP",
  APT: "APT",
  ARB: "ARB",
  OP: "OP",
  NEAR: "NEAR",
  ALGO: "ALGO",
  UNI: "UNI",
  AAVE: "AAVE",
  // и т.д. (если чего-то нет — адаптер просто вернёт null)
};

export function toKrakenPair(p: PairRequest): string | null {
  const base = BASE_MAP[p.base] ?? p.base;
  // Kraken USDT/USDC пары есть не на всё. Мы попробуем base+quote.
  return `${base}${p.quote}`.toUpperCase();
}
