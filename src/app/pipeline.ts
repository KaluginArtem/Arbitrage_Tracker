import { createWsClients } from "../exchanges";
import { MarketDataBus } from "../layers/MarketData";
import { MarketState } from "../layers/MarketState/store";
import { UniverseBuilder } from "../layers/Universe";
import { MarketGraphBuilder } from "../layers/MarketGraph/builder";
import { TriangularFinder } from "../layers/OpportunityFinders/triangular";
import { CrossExchangeFinder } from "../layers/OpportunityFinders/crossExchange";
import { validateOpportunity } from "../layers/OpportunityValidate/index";
import { VALIDATOR_CFG } from "../layers/OpportunityValidate/config"; // ✅ добавь
import { scoreOpportunity } from "../layers/Scoring";
import { CONFIG } from "../config/config";
import { GraphEdge } from "../layers/MarketGraph/types";

const isNotNull = <T,>(v: T | null | undefined): v is T => v != null; // ✅ type guard

const edgeInfo = (e: GraphEdge) =>
  `${e.from}->${e.to} px=${e.px} qtyBase=${e.qtyBase}`;

export async function startPipeline() {
  console.log("🚀 Starting arbitrage system");

  console.log("🌐 Building universe...");
  const universe = await UniverseBuilder.buildLive([...CONFIG.EXCHANGES]);
  console.log("✅ Universe ready");

  const marketDataBus = new MarketDataBus();
  const marketState = new MarketState();

  marketDataBus.subscribe(event => {
    marketState.update(event);
  });

  const wsClients = createWsClients({
    universe,
    onEvent: event => marketDataBus.emit(event),
  });

  for (const client of wsClients) {
    await client.connect();
    console.log(`✅ WS connected: ${client.id}`);
  }

  console.log("📡 WebSocket connections established");

  setInterval(() => {
    const snapshot = marketState.getSnapshot();
    const graph = MarketGraphBuilder.build(snapshot);

    const triangular = TriangularFinder.find(graph);
    const cross = CrossExchangeFinder.find(snapshot);
    const candidates = [...triangular, ...cross];

    // ✅ (1) передаём cfg
    // ✅ (2) фильтруем type-guard, чтобы TS понял non-null
    const validated = candidates
      .map(c => validateOpportunity(c, VALIDATOR_CFG))
      .filter(isNotNull);

    const scored = validated
      .map(scoreOpportunity) // теперь value точно ValidatedOpportunity
      .sort((a, b) => b.score - a.score)
      .slice(0, 10);

    for (const [ex, pairs] of snapshot) {
      console.log(
        `[SNAPSHOT] ${ex}: ${pairs.size} pairs ->`,
        [...pairs.keys()].slice(0, 5) // первые 5 для читаемости
      );
    }
    console.log(
      `tick | ex=${snapshot.size} | cand=${candidates.length} | valid=${validated.length}`
    );

    if (scored.length > 0) {
      console.log("🔥 TOP OPPORTUNITIES");

      for (const o of scored) {
        const pathStr = o.path.map(edgeInfo).join(" | ");

        if (o.type === "triangular") {
          console.log( `T: ` +
            `[${o.exchange}] ${pathStr} ` +
            `net=${o.profitPct.toFixed(3)}% ` +
            `sizeMax=${o.maxSize.toFixed(4)} ` +
            `score=${o.score.toFixed(2)}`
          );
        } else {
          console.log( `C: ` +
            `[${o.buyExchange} → ${o.sellExchange}] ${o.symbol} ` +
            `${pathStr} ` +
            `net=${o.profitPct.toFixed(3)}% ` +
            `sizeMax=${o.maxSize.toFixed(4)} ` +
            `score=${o.score.toFixed(2)}`
          );
        }
      }

      console.log("—".repeat(70));
    }
  }, 3000);
}
