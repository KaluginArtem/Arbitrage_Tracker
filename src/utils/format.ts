import { ArbitrageOpportunity } from "../types";
import { round2 } from "./math";

export function formatOpp(o: ArbitrageOpportunity): string {
  const pair = `${o.pair.base}/${o.pair.quote}`;
  return [
    `📈 *${pair}*  spread: *${round2(o.spreadPct)}%*`,
    `Buy:  ${o.buyFrom.exchange}  ask=${o.buyFrom.book.ask} (qty=${o.buyFrom.book.askQty})`,
    `Sell: ${o.sellTo.exchange}  bid=${o.sellTo.book.bid} (qty=${o.sellTo.book.bidQty})`,
    `≈ notional: ${round2(o.estNotionalUSDT)} ${o.pair.quote}`,
  ].join("\n");
}

export function formatBatch(opps: ArbitrageOpportunity[]): string {
  if (opps.length === 0) return "Нет возможностей по заданным условиям.";
  const top = opps.slice(0, 15); // чтобы не спамить
  return top.map((o) => formatOpp(o)).join("\n\n");
}
