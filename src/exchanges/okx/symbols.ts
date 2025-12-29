import { PairRequest } from "../../types";

export function toOkxInstId(p: PairRequest): string {
  // OKX: BTC-USDT
  return `${p.base}-${p.quote}`.toUpperCase();
}
