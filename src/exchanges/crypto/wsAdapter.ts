import WebSocket from "ws";
import { WebSocketAdapter } from "../base";
import { PairRequest, TopOfBook } from "../../types";

export function cryptoComWebSocketAdapter(): WebSocketAdapter {
  const sockets: Record<string, WebSocket> = {};

  return {
    id: "crypto.com",

    supportsPair(pair: PairRequest): boolean {
      return true;
    },

    subscribe(pair: PairRequest, onUpdate: (book: TopOfBook) => void) {
      const symbol = `${pair.base}_${pair.quote}`.toLowerCase();
      const ws = new WebSocket("wss://stream.crypto.com/exchange/v1/market");

      ws.on("open", () => {
        ws.send(
          JSON.stringify({
            id: Date.now(),
            method: "subscribe",
            params: { channels: [`book.${symbol}.5`] },
          })
        );
      });

      ws.on("message", (msg) => {
        const res = JSON.parse(msg.toString());
        const d = res.result?.data?.[0];
        if (!d) return;

        const bid = Number(d.bids[0][0]);
        const bidQty = Number(d.bids[0][1]);
        const ask = Number(d.asks[0][0]);
        const askQty = Number(d.asks[0][1]);

        if (!bid || !ask) return;

        onUpdate({ bid, ask, bidQty, askQty, ts: Date.now() });
      });

      sockets[symbol] = ws;
    },

    unsubscribe(pair: PairRequest) {
      const symbol = `${pair.base}_${pair.quote}`.toLowerCase();
      sockets[symbol]?.close();
      delete sockets[symbol];
    },
  };
}
