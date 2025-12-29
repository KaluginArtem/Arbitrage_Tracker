import { PairRequest } from "../../types";

export function toKucoinSymbol(p: PairRequest): string {
  // KuCoin: BTC-USDT
  return `${p.base}-${p.quote}`.toUpperCase();
}
