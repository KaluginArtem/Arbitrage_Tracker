import { PairRequest } from "../../types";

export function toBybitSymbol(p: PairRequest): string {
  // Bybit v5 spot: BTCUSDT
  return `${p.base}${p.quote}`.toUpperCase();
}
