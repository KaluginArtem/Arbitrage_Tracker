import { PairRequest } from "../../types";

// Пример: tBTCUSDT
export function toBitfinexSymbol(pair: PairRequest): string {
  return `t${pair.base}${pair.quote}`.toUpperCase();
}
