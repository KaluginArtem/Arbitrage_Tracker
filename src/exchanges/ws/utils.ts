import { Universe } from "../../layers/Universe";

export function buildWsMap(
  universe: Universe,
  exchange: string
) {
  const markets = universe.byExchange.get(exchange as any) ?? [];

  const map = new Map<
    string,
    { base: string; quote: string; symbol: string }
  >();

  for (const m of markets) {
    map.set(m.wsSymbol, {
      base: m.base,
      quote: m.quote,
      symbol: `${m.base}/${m.quote}`,
    });
  }

  return map;
}
