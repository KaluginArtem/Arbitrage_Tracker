import WebSocket from "ws";
import { WebSocketAdapter } from "../base";
import { PairRequest, TopOfBook } from "../../types";

export function krakenWebSocketAdapter(): WebSocketAdapter {
  const sockets: Record<string, WebSocket> = {};

  return {
    id: "kraken",

    supportsPair(pair: PairRequest): boolean {
      return true;
    },

    subscribe(pair: PairRequest, onUpdate: (book: TopOfBook) => void) {
      const pairName = `${pair.base}/${pair.quote}`.toUpperCase();
      const ws = new WebSocket("wss://ws.kraken.com");

      ws.on("open", () => {
        ws.send(
          JSON.stringify({
            event: "subscribe",
            pair: [pairName],
            subscription: { name: "ticker" },
          })
        );
      });

      ws.on("message", (msg) => {
        const data = JSON.parse(msg.toString());
        if (!Array.isArray(data) || data.length < 2) return;

        const d = data[1];
        const bid = Number(d.b[0]);
        const ask = Number(d.a[0]);
        const bidQty = Number(d.b[1]);
        const askQty = Number(d.a[1]);

        if (!bid || !ask) return;

        onUpdate({ bid, ask, bidQty, askQty, ts: Date.now() });
      });

      sockets[pairName] = ws;
    },

    unsubscribe(pair: PairRequest) {
      const pairName = `${pair.base}/${pair.quote}`.toUpperCase();
      sockets[pairName]?.close();
      delete sockets[pairName];
    },
  };
}
