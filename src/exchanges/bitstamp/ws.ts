import WebSocket from "ws";
import { WsClient, WsEventHandler } from "../base/base";
import { Universe } from "../../layers/Universe/types";
import { buildWsMap } from "../ws/utils";
import { now } from "../../utils/time";

const WS_URL = "wss://ws.bitstamp.net";

export function createBitstampWsClient(
  universe: Universe,
  onEvent: WsEventHandler
): WsClient {
  const wsMap = buildWsMap(universe, "bitstamp");
  let ws: WebSocket;

  let unknownLogged = 0;

  return {
    id: "bitstamp",

    async connect() {
      ws = new WebSocket(WS_URL);

      ws.on("open", () => {
        console.log(`[WS:bitstamp] connected | subscribe=${wsMap.size}`);
        for (const wsSymbol of wsMap.keys()) {
          // wsSymbol обычно типа "btcusd", "ethusdt" (как отдаёт REST)
          ws.send(
            JSON.stringify({
              event: "bts:subscribe",
              data: { channel: `order_book_${wsSymbol}` },
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

        if (!msg?.data || !msg?.channel) return;
        if (msg.event !== "data") return;

        const wsSymbol = String(msg.channel).replace("order_book_", "");
        const meta = wsMap.get(wsSymbol);
        if (!meta) {
          if (unknownLogged++ < 5) {
            console.warn("[WS:bitstamp] unknown wsSymbol:", wsSymbol);
          }
          return;
        }

        const bids = msg.data.bids;
        const asks = msg.data.asks;
        if (!bids?.length || !asks?.length) return;

        const [bid, bidQty] = bids[0];
        const [ask, askQty] = asks[0];

        onEvent({
          exchange: "bitstamp",
          symbol: meta.symbol,
          base: meta.base,
          quote: meta.quote,
          bid: +bid,
          ask: +ask,
          bidQty: +bidQty,
          askQty: +askQty,
          tsLocal: now(),
        });
      });

      ws.on("error", e => console.error("[WS:bitstamp] error", e));
      ws.on("close", (c, r) => console.warn("[WS:bitstamp] closed", c, r?.toString?.()));
    },

    disconnect() {
      ws?.close();
    },
  };
}
