import WebSocket from "ws";
import { WsClient, WsEventHandler } from "../base/base";
import { Universe } from "../../layers/Universe/types";
import { buildWsMap } from "../ws/utils";
import { now } from "../../utils/time";

const WS_URL = "wss://advanced-trade-ws.coinbase.com";

export function createCoinbaseWsClient(
  universe: Universe,
  onEvent: WsEventHandler
): WsClient {
  const wsMap = buildWsMap(universe, "coinbase");
  let ws: WebSocket;
  let unknownLogged = 0;

  return {
    id: "coinbase",

    async connect() {
      ws = new WebSocket(WS_URL);

      ws.on("open", () => {
        const products = [...wsMap.keys()];
        console.log(`[WS:coinbase] connected | subscribe ticker=${products.length}`);

        ws.send(
          JSON.stringify({
            type: "subscribe",
            channel: "ticker", // ✅ вместо level2
            product_ids: products,
          })
        );
      });

      ws.on("message", raw => {
        let msg: any;
        try {
          msg = JSON.parse(raw.toString());
        } catch {
          return;
        }

        if (!msg?.events) return;

        for (const e of msg.events) {
          const tickers = e.tickers;
          if (!tickers?.length) continue;

          for (const t of tickers) {
            const productId = t.product_id;
            const meta = wsMap.get(productId);
            if (!meta) {
              if (unknownLogged++ < 5) console.warn("[WS:coinbase] unknown product:", productId);
              continue;
            }

            if (!t.best_bid || !t.best_ask) continue;

            onEvent({
              exchange: "coinbase",
              symbol: meta.symbol,
              base: meta.base,
              quote: meta.quote,
              bid: +t.best_bid,
              ask: +t.best_ask,
              bidQty: +(t.best_bid_quantity ?? 0),
              askQty: +(t.best_ask_quantity ?? 0),
              tsLocal: now(),
            });
          }
        }
      });

      ws.on("error", e => console.error("[WS:coinbase] error", e));
      ws.on("close", (c, r) => console.warn("[WS:coinbase] closed", c, r?.toString?.()));
    },

    disconnect() {
      ws?.close();
    },
  };
}
