import { PairRequest } from "../../types";

// Пример: btcusdt
export function toBitstampSymbol(pair: PairRequest): string {
  return `${pair.base}${pair.quote}`.toLowerCase();
}
