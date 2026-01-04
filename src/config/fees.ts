import { ExchangeId } from "../types";

export type FeeSchedule = {
  // decimals: 0.001 = 0.1%
  taker: number;
  maker?: number;
};

/**
 * IMPORTANT:
 * - Реальные комиссии зависят от твоего VIP/volume tier.
 * - Для арбитража по top-of-book почти всегда используем taker.
 */
export const EXCHANGE_FEES: Record<ExchangeId, FeeSchedule> = {
  binance: { taker: 0.0010 },   // TODO: confirm for your tier
  bybit:   { taker: 0.0010 },   // 0.10% spot taker (tier-0) :contentReference[oaicite:4]{index=4}
  okx:     { taker: 0.0010 },   // TODO: confirm for your tier
  kraken:  { taker: 0.0026 },   // TODO: confirm; tiered on Kraken :contentReference[oaicite:5]{index=5}
  kucoin:  { taker: 0.0010 },   // 0.10% spot :contentReference[oaicite:6]{index=6}
  bitfinex:{ taker: 0.0000 },   // announced 0% (verify applicability) :contentReference[oaicite:7]{index=7}
  bitstamp:{ taker: 0.0030 },   // TODO: confirm for your tier
  coinbase:{ taker: 0.0060 },   // TODO: confirm (tiered)
  crypto:  { taker: 0.00075 },  // TODO: confirm for your tier
};

export function takerFee(ex: ExchangeId): number {
  return EXCHANGE_FEES[ex]?.taker ?? 0;
}
