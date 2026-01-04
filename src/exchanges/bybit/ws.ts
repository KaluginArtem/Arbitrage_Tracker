import WebSocket from "ws";
import { WsClient, WsEventHandler } from "../base/base";
import { Universe } from "../../layers/Universe/types";
import { buildWsMap } from "../ws/utils";
import { now } from "../../utils/time";

const WS_URL = "wss://stream.bybit.com/v5/public/spot";
const CHUNK_SIZE = 10;

export function createBybitWsClient(
  universe: Universe,
  onEvent: WsEventHandler
): WsClient {
  const wsMap = buildWsMap(universe, "bybit");
  let ws: WebSocket;
  let unknownLogged = 0;

  return {
    id: "bybit",

    async connect() {
      ws = new WebSocket(WS_URL);

      ws.on("open", () => {
        const symbols = [...wsMap.keys()];
        console.log(`[WS:bybit] connected | symbols=${symbols.length}`);

        for (let i = 0; i < symbols.length; i += CHUNK_SIZE) {
          const chunk = symbols.slice(i, i + CHUNK_SIZE);
          ws.send(
            JSON.stringify({
              op: "subscribe",
              args: chunk.map(s => `orderbook.1.${s}`),
            })
          );
        }
      });

      ws.on("message", raw => {
        let msg: any;
        try {
          msg = JSON.parse(raw.toString());
        } catch {
          return;
        }

        // ignore acks / heartbeats
        if (msg?.success === true || msg?.op === "pong") return;

        if (msg?.success === false) {
          console.error("[WS:bybit] error:", msg.ret_msg);
          return;
        }

        const data = msg?.data;
        if (!data) return;

        const items = Array.isArray(data) ? data : [data];

        for (const d of items) {
          const wsSymbol = d.s;
          const meta = wsMap.get(wsSymbol);
          if (!meta) {
            if (unknownLogged++ < 5) {
              console.warn("[WS:bybit] unknown symbol:", wsSymbol);
            }
            continue;
          }

          const [bid, bidQty] = d.b?.[0] ?? [];
          const [ask, askQty] = d.a?.[0] ?? [];
          if (!bid || !ask) continue;

          onEvent({
            exchange: "bybit",
            symbol: meta.symbol,
            base: meta.base,
            quote: meta.quote,
            bid: +bid,
            ask: +ask,
            bidQty: +bidQty,
            askQty: +askQty,
            tsLocal: now(),
          });
        }
      });

      ws.on("error", e => console.error("[WS:bybit] error", e));
      ws.on("close", () => console.warn("[WS:bybit] closed"));
    },

    disconnect() {
      ws?.close();
    },
  };
}
