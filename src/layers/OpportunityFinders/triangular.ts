import { MarketGraph } from "../MarketGraph/types";
import { OpportunityCandidate } from "./types";

export class TriangularFinder {
  static find(graph: MarketGraph): OpportunityCandidate[] {
    const results: OpportunityCandidate[] = [];
    const assets = graph.assets();

    for (const a of assets) {
      const edgesAB = graph.edgesFrom(a);

      for (const e1 of edgesAB) {
        const b = e1.to;
        const edgesBC = graph.edgesFrom(b);

        for (const e2 of edgesBC) {
          const c = e2.to;

          if (c === a || c === b) continue;

          const edgesCA = graph.edgesFrom(c);
          for (const e3 of edgesCA) {
            if (e3.to !== a) continue;

            // все рёбра на одной бирже
            if (e1.exchange !== e2.exchange || e2.exchange !== e3.exchange) continue;

            const gross = e1.rate * e2.rate * e3.rate;
            if (gross <= 1) continue;

            results.push({
              type: "triangular",
              exchange: e1.exchange,
              path: [e1, e2, e3],
            });
          }
        }
      }
    }

    return results;
  }
}
