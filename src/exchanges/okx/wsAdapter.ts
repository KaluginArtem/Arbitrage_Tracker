import WebSocket from "ws";
import { WebSocketAdapter } from "../base";
import { PairRequest, TopOfBook } from "../../types";

export function okxWebSocketAdapter(): WebSocketAdapter {
  const sockets: Record<string, WebSocket> = {};

  return {
    id: "okx",

    supportsPair(pair: PairRequest): boolean {
      return true;
    },

    subscribe(pair: PairRequest, onUpdate: (book: TopOfBook) => void) {
      const instId = `${pair.base}-${pair.quote}`;
      const ws = new WebSocket("wss://ws.okx.com:8443/ws/v5/public");

      ws.on("open", () => {
        ws.send(
          JSON.stringify({
            op: "subscribe",
            args: [{ channel: "tickers", instId }],
          })
        );
      });

      ws.on("message", (msg) => {
        const res = JSON.parse(msg.toString());
        const d = res.data?.[0];
        if (!d) return;

        const bid = Number(d.bidPx);
        const ask = Number(d.askPx);
        const bidQty = Number(d.bidSz);
        const askQty = Number(d.askSz);

        if (!bid || !ask) return;

        onUpdate({ bid, ask, bidQty, askQty, ts: Date.now() });
      });

      sockets[instId] = ws;
    },

    unsubscribe(pair: PairRequest) {
      const symbol = `${pair.base}-${pair.quote}`;
      sockets[symbol]?.close();
      delete sockets[symbol];
    },
  };
}
