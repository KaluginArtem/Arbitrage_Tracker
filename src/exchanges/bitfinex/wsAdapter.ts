import WebSocket from "ws";
import { WebSocketAdapter } from "../base";
import { PairRequest, TopOfBook } from "../../types";

export function bitfinexWebSocketAdapter(): WebSocketAdapter {
  const sockets: Record<string, WebSocket> = {};

  return {
    id: "bitfinex",

    supportsPair(pair: PairRequest): boolean {
      return true;
    },

    subscribe(pair: PairRequest, onUpdate: (book: TopOfBook) => void) {
      const symbol = `t${pair.base}${pair.quote}`.toUpperCase();
      const ws = new WebSocket("wss://api-pub.bitfinex.com/ws/2");

      ws.on("open", () => {
        ws.send(
          JSON.stringify({
            event: "subscribe",
            channel: "ticker",
            symbol,
          })
        );
      });

      ws.on("message", (msg) => {
        const d = JSON.parse(msg.toString());
        if (!Array.isArray(d) || d.length < 2 || typeof d[1] === "string") return;

        const [, [ , bid, bidQty, ask, askQty ]] = d;

        if (!bid || !ask) return;

        onUpdate({ bid, ask, bidQty, askQty, ts: Date.now() });
      });

      sockets[symbol] = ws;
    },

    unsubscribe(pair: PairRequest) {
      const symbol = `t${pair.base}${pair.quote}`.toUpperCase();
      sockets[symbol]?.close();
      delete sockets[symbol];
    },
  };
}
