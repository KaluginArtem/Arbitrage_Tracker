import { PairRequest } from "../../types";

// Пример: BTC-USDT
export function toCoinbaseSymbol(pair: PairRequest): string {
  return `${pair.base}-${pair.quote}`.toUpperCase();
}
