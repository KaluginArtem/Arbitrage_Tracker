import WebSocket from "ws";
import { WsClient, WsEventHandler } from "../base/base";
import { Universe } from "../../layers/Universe";
import { buildWsMap } from "../ws/utils";
import { now } from "../../utils/time";

const WS_URL = "wss://stream.crypto.com/v2/market";

export function createCryptoComWsClient(
  universe: Universe,
  onEvent: WsEventHandler
): WsClient {
  const wsMap = buildWsMap(universe, "crypto");
  let ws: WebSocket;

  return {
    id: "crypto",

    async connect() {
      ws = new WebSocket(WS_URL);

      ws.on("open", () => {
        console.log(`[WS:crypto] subscribe ${wsMap.size}`);
        ws.send(JSON.stringify({
          id: 1,
          method: "subscribe",
          params: {
            channels: [...wsMap.keys()].map(
              s => `book.${s}.1`
            ),
          },
        }));
      });

      ws.on("message", raw => {
        const msg = JSON.parse(raw.toString());
        const data = msg.result?.data;
        if (!Array.isArray(data)) return;

        for (const d of data) {
          const meta = wsMap.get(d.instrument_name);
          if (!meta) continue;

          const bid = d.bids?.[0];
          const ask = d.asks?.[0];
          if (!bid || !ask) continue;

          onEvent({
            exchange: "crypto",
            symbol: meta.symbol,
            base: meta.base,
            quote: meta.quote,
            bid: +bid[0],
            ask: +ask[0],
            bidQty: +bid[1],
            askQty: +ask[1],
            tsLocal: now(),
          });
        }
      });

      ws.on("error", e => console.error("[WS:crypto] error", e));
      ws.on("close", () => console.warn("[WS:crypto] closed"));
    },

    disconnect() {
      ws?.close();
    },
  };
}
