import WebSocket from "ws";
import { WebSocketAdapter } from "../base";
import { PairRequest, TopOfBook } from "../../types";

export function bitstampWebSocketAdapter(): WebSocketAdapter {
  const sockets: Record<string, WebSocket> = {};

  return {
    id: "bitstamp",

    supportsPair(pair: PairRequest): boolean {
      return true;
    },

    subscribe(pair: PairRequest, onUpdate: (book: TopOfBook) => void) {
      const symbol = `${pair.base}${pair.quote}`.toLowerCase();
      const ws = new WebSocket("wss://ws.bitstamp.net");

      ws.on("open", () => {
        ws.send(
          JSON.stringify({
            event: "bts:subscribe",
            data: { channel: `order_book_${symbol}` },
          })
        );
      });

      ws.on("message", (msg) => {
        const d = JSON.parse(msg.toString());
        if (!d?.data?.bids || !d?.data?.asks) return;

        const bid = Number(d.data.bids[0][0]);
        const bidQty = Number(d.data.bids[0][1]);
        const ask = Number(d.data.asks[0][0]);
        const askQty = Number(d.data.asks[0][1]);

        if (!bid || !ask) return;

        onUpdate({ bid, ask, bidQty, askQty, ts: Date.now() });
      });

      sockets[symbol] = ws;
    },

    unsubscribe(pair: PairRequest) {
      const symbol = `${pair.base}${pair.quote}`.toLowerCase();
      sockets[symbol]?.close();
      delete sockets[symbol];
    },
  };
}
