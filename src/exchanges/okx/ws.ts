import WebSocket from "ws";
import { WsClient, WsEventHandler } from "../base/base";
import { Universe } from "../../layers/Universe/types";
import { buildWsMap } from "../ws/utils";
import { now } from "../../utils/time";

const WS_URL = "wss://ws.okx.com:8443/ws/v5/public";

export function createOkxWsClient(
  universe: Universe,
  onEvent: WsEventHandler
): WsClient {
  const wsMap = buildWsMap(universe, "okx");
  let ws: WebSocket;

  let unknownLogged = 0;

  return {
    id: "okx",

    async connect() {
      ws = new WebSocket(WS_URL);

      ws.on("open", () => {
        console.log(`[WS:okx] connected | subscribe=${wsMap.size}`);

        // OKX лимитит размер сообщения — лучше батчить
        const instIds = [...wsMap.keys()];
        const chunkSize = 50;

        for (let i = 0; i < instIds.length; i += chunkSize) {
          const chunk = instIds.slice(i, i + chunkSize);
          ws.send(
            JSON.stringify({
              op: "subscribe",
              args: chunk.map(instId => ({
                channel: "books5",     // 👈 топ книги
                instId,                // типа "BTC-USDT"
              })),
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

        // ping/pong/ack
        if (!msg?.data || !msg?.arg) return;

        const instId = msg.arg.instId; // 👈 ВАЖНО: instId здесь
        const meta = wsMap.get(instId);
        if (!meta) {
          if (unknownLogged++ < 5) console.warn("[WS:okx] unknown instId:", instId);
          return;
        }

        const d = msg.data?.[0];
        if (!d) return;

        const bid = d.bids?.[0];
        const ask = d.asks?.[0];
        if (!bid || !ask) return;

        onEvent({
          exchange: "okx",
          symbol: meta.symbol,
          base: meta.base,
          quote: meta.quote,
          bid: +bid[0],
          ask: +ask[0],
          bidQty: +bid[1],
          askQty: +ask[1],
          tsLocal: now(),
        });
      });

      ws.on("error", e => console.error("[WS:okx] error", e));
      ws.on("close", (c, r) => console.warn("[WS:okx] closed", c, r?.toString?.()));
    },

    disconnect() {
      ws?.close();
    },
  };
}
