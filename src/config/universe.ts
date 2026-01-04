// =========================
// BASE / QUOTE ASSETS
// =========================

// База (мейджоры + стейблы + фиат где доступно)
export const CORE_ASSETS = [
  "BTC",
  "ETH",

  "USDT",
  "USDC",
  "DAI",
  "FDUSD",

  "EUR",
  "GBP",
] as const;

// Топ-альты с высокой ликвидностью
export const TOP_ALTS = [
  "SOL",
  "BNB",
  "XRP",
  "ADA",
  "DOGE",
  "TRX",
  "TON",
  "DOT",
  "AVAX",
  "LINK",
  "MATIC", // POL обрабатывается на уровне symbols
  "LTC",
  "BCH",
  "ATOM",
  "XLM",
  "ETC",
  "FIL",
  "ICP",
  "APT",
  "ARB",
  "OP",
  "NEAR",
  "ALGO",
  "UNI",
  "AAVE",
  "SUSHI",
  "RUNE",
  "INJ",
  "SEI",
  "SUI",
  "TIA",
  "PEPE",
  "SHIB",
  "WIF",
  "BONK",
] as const;

// “Рабочие” токены (проверять стакан!)
export const WORKING_TOKENS = [
  "IMX",
  "GALA",
  "SAND",
  "MANA",
  "AXS",
  "FTM",
  "ENA",
] as const;

// =========================
// FINAL UNIVERSE
// =========================

export const ALL_ASSETS = [
  ...CORE_ASSETS,
  ...TOP_ALTS,
  ...WORKING_TOKENS,
] as const;

// Quote whitelist — КРИТИЧНО
export const QUOTE_ASSETS = [
  "USDT",
  "USDC",
  "USD",
  "BTC",
  "ETH",
  "EUR",
  "GBP",
] as const;

export type Asset = typeof ALL_ASSETS[number];
export type QuoteAsset = typeof QUOTE_ASSETS[number];
