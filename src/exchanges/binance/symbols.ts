import { PairRequest } from "../../types";

export function toBinanceSymbol(p: PairRequest): string {
  // Binance: BTCUSDT, ETHUSDT
  return `${p.base}${p.quote}`.toUpperCase();
}
