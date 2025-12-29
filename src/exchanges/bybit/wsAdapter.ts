import WebSocket from "ws";
import { WebSocketAdapter } from "../base";
import { PairRequest, TopOfBook } from "../../types";

export function bybitWebSocketAdapter(): WebSocketAdapter {
  const sockets: Record<string, WebSocket> = {};

  return {
    id: "bybit",

    supportsPair(pair: PairRequest): boolean {
      return true;
    },

    subscribe(pair: PairRequest, onUpdate: (book: TopOfBook) => void) {
      const symbol = `${pair.base}${pair.quote}`;
      const ws = new WebSocket("wss://stream.bybit.com/v5/public/spot");

      ws.on("open", () => {
        ws.send(
          JSON.stringify({
            op: "subscribe",
            args: [`tickers.${symbol}`],
          })
        );
      });

      ws.on("message", (msg) => {
        const data = JSON.parse(msg.toString());
        if (!data.data) return;

        const bid = Number(data.data.bid1Price);
        const ask = Number(data.data.ask1Price);
        const bidQty = Number(data.data.bid1Size);
        const askQty = Number(data.data.ask1Size);

        if (!bid || !ask) return;

        onUpdate({ bid, ask, bidQty, askQty, ts: Date.now() });
      });

      sockets[symbol] = ws;
    },

    unsubscribe(pair: PairRequest) {
      const symbol = `${pair.base}${pair.quote}`;
      sockets[symbol]?.close();
      delete sockets[symbol];
    },
  };
}
