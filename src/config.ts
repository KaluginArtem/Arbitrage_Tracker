export const CONFIG = {
  MIN_SPREAD_PCT: 0.020,        // минимальный спред для алерта (в %)
  MIN_USDT_NOTIONAL: 25,       // минимальный "размер" по лучшей цене (чтобы не ловить фейк-спреды)
  SCAN_INTERVAL_MS: 60_000,    // раз в минуту (потом можно менять)

  TELEGRAM: {
    TOKEN: process.env.TELEGRAM_BOT_TOKEN || "",
    CHAT_ID: process.env.TELEGRAM_CHAT_ID || "",
  },

  EXCHANGES: ["binance", "bybit", "okx", "kraken", "kucoin"] as const,

  // Базовый список активов (тикеры). Котируем в USDT/USDC (где доступно).
  COINS: [
    "BTC","ETH",
    "SOL","BNB","XRP","ADA","DOGE","TRX","TON","DOT","AVAX","LINK","MATIC","POL",
    "LTC","BCH","ATOM","XLM","ETC","FIL","ICP","APT","ARB","OP","NEAR","ALGO",
    "UNI","AAVE","SUSHI","RUNE","INJ","SEI","SUI","TIA","PEPE","SHIB","WIF","BONK",
    "IMX","GALA","SAND","MANA","AXS","FTM","ENA",
  ] as const,

  // Какие котировки проверяем
  QUOTES: ["USDT", "USDC"] as const,
};
