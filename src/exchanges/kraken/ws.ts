import WebSocket from "ws";
import { WsClient, WsEventHandler } from "../base/base";
import { Universe } from "../../layers/Universe/types";
import { buildWsMap } from "../ws/utils";
import { now } from "../../utils/time";
import { canonicalKrakenSymbol } from "../../layers/Universe/normalize";

const WS_URL = "wss://ws.kraken.com";
const CHUNK = 50;

export function createKrakenWsClient(
  universe: Universe,
  onEvent: WsEventHandler
): WsClient {
  const wsMap = buildWsMap(universe, "kraken");
  let ws: WebSocket;

  return {
    id: "kraken",

    async connect() {
      ws = new WebSocket(WS_URL);

      ws.on("open", () => {
        const pairs = [...wsMap.keys()];
        console.log(`[WS:kraken] connected | subscribe=${pairs.length} tickers`);

        for (let i = 0; i < pairs.length; i += CHUNK) {
          ws.send(JSON.stringify({
            event: "subscribe",
            pair: pairs.slice(i, i + CHUNK),
            subscription: { name: "ticker" },
          }));
        }
      });

      ws.on("message", raw => {
        let msg: any;
        try {
          msg = JSON.parse(raw.toString());
        } catch {
          return;
        }

        // system / heartbeat / subscriptionStatus
        if (!Array.isArray(msg)) return;

        // format: [channelId, data, channelName, pair]
        const data = msg[1];
        const rawPair = msg[3];
        if (!data || !rawPair) return;

        const pair = canonicalKrakenSymbol(rawPair);
        const meta = wsMap.get(pair);
        if (!meta) return;

        if (!data.b || !data.a) return;

        onEvent({
          exchange: "kraken",
          symbol: meta.symbol,
          base: meta.base,
          quote: meta.quote,
          bid: +data.b[0],
          ask: +data.a[0],
          bidQty: +data.b[2], // volume
          askQty: +data.a[2],
          tsLocal: now(),
        });
      });

      ws.on("error", e => console.error("[WS:kraken] error", e));
      ws.on("close", () => console.warn("[WS:kraken] closed"));
    },

    disconnect() {
      ws?.close();
    },
  };
}
