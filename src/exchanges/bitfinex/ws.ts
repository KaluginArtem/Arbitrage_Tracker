import WebSocket from "ws";
import { WsClient, WsEventHandler } from "../base/base";
import { now } from "../../utils/time";
import { Universe } from "../../layers/Universe";
import { buildWsMap } from "../ws/utils";

const WS_URL = "wss://api-pub.bitfinex.com/ws/2";

export function createBitfinexWsClient(
  universe: Universe,
  onEvent: WsEventHandler
): WsClient {
  const wsMap = buildWsMap(universe, "bitfinex");
  const chanMap = new Map<number, string>();
  let ws: WebSocket;

  return {
    id: "bitfinex",

    async connect() {
      ws = new WebSocket("wss://api-pub.bitfinex.com/ws/2");

      ws.on("open", () => {
        for (const wsSymbol of wsMap.keys()) {
          ws.send(JSON.stringify({
            event: "subscribe",
            channel: "ticker",
            symbol: wsSymbol,
          }));
        }
      });

      ws.on("message", raw => {
        const msg = JSON.parse(raw.toString());

        if (msg.event === "subscribed") {
          chanMap.set(msg.chanId, msg.symbol);
          return;
        }

        if (!Array.isArray(msg)) return;
        if (msg[1] === "hb") return;

        const symbol = chanMap.get(msg[0]);
        if (!symbol) return;

        const meta = wsMap.get(symbol);
        if (!meta) return;

        const [bid, bidQty, ask, askQty] = msg[1];
        if (!bid || !ask) return;

        onEvent({
          exchange: "bitfinex",
          symbol: meta.symbol,
          base: meta.base,
          quote: meta.quote,
          bid,
          ask,
          bidQty,
          askQty,
          tsLocal: Date.now(),
        });
      });
    },

    disconnect() {
      ws?.close();
    },
  };
}

function parseBitfinexSymbol(sym: string): {
  base: string;
  quote: string;
  symbol: string;
} | null {
  // tBTCUSDT, tETHUSD, tETHGBP
  if (!sym.startsWith("t")) return null;

  const clean = sym.slice(1);
  const QUOTES = ["USDT", "USD", "BTC", "ETH", "EUR", "GBP"];

  for (const q of QUOTES) {
    if (clean.endsWith(q)) {
      const base = clean.slice(0, -q.length);
      return {
        base,
        quote: q,
        symbol: `${base}/${q}`,
      };
    }
  }

  return null;
}
