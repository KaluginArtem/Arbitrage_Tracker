import WebSocket from "ws";
import { WebSocketAdapter } from "../base";
import { PairRequest, TopOfBook } from "../../types";

export function coinbaseWebSocketAdapter(): WebSocketAdapter {
  const sockets: Record<string, WebSocket> = {};

  return {
    id: "coinbase",

    supportsPair(pair: PairRequest): boolean {
      return true;
    },

    subscribe(pair: PairRequest, onUpdate: (book: TopOfBook) => void) {
      const symbol = `${pair.base}-${pair.quote}`;
      const ws = new WebSocket("wss://ws-feed.exchange.coinbase.com");

      ws.on("open", () => {
        ws.send(
          JSON.stringify({
            type: "subscribe",
            channels: [{ name: "ticker", product_ids: [symbol] }],
          })
        );
      });

      ws.on("message", (msg) => {
        const d = JSON.parse(msg.toString());
        if (d.type !== "ticker") return;

        const bid = Number(d.best_bid);
        const ask = Number(d.best_ask);
        const bidQty = 0; // Coinbase WS does not provide qty
        const askQty = 0;

        if (!bid || !ask) return;

        onUpdate({ bid, ask, bidQty, askQty, ts: Date.now() });
      });

      sockets[symbol] = ws;
    },

    unsubscribe(pair: PairRequest) {
      const symbol = `${pair.base}-${pair.quote}`;
      sockets[symbol]?.close();
      delete sockets[symbol];
    },
  };
}
