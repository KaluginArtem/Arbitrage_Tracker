import { Asset, QuoteAsset } from "../../config/universe";

export function isValidPair(base: Asset, quote: QuoteAsset): boolean {
  if (base === quote) return false;

  // Стейблы между собой — ТОЛЬКО USDC/USDT
  const stables = ["USDT", "USDC", "DAI", "FDUSD"];
  if (stables.includes(base) && stables.includes(quote)) {
    return (
      (base === "USDT" && quote === "USDC") ||
      (base === "USDC" && quote === "USDT")
    );
  }

  // Фиат ↔ фиат — нет
  const fiats = ["EUR", "GBP"];
  if (fiats.includes(base) && fiats.includes(quote)) return false;

  return true;
}
