import { PairRequest } from "../../types";

// Пример: BTC_USDT
export function toCryptoSymbol(pair: PairRequest): string {
  return `${pair.base}_${pair.quote}`.toUpperCase();
}
