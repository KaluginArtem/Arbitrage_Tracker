import { GraphEdge } from "../MarketGraph/types";
import { takerFee } from "../../config/fees";

/**
 * Applies taker fee on EACH conversion edge.
 * We treat it as reducing the output amount by (1 - fee).
 */
export function computeNetRate(path: GraphEdge[]): number {
  return path.reduce((acc, e) => {
    const fee = takerFee(e.exchange);
    return acc * e.rate * (1 - fee);
  }, 1);
}
