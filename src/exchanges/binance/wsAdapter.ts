import WebSocket from "ws";
import { WebSocketAdapter } from "../base";
import { PairRequest, TopOfBook } from "../../types";
import { toBinanceSymbol } from "./symbols";

const BASE_URL = "wss://stream.binance.com:9443/ws";

export function binanceWebSocketAdapter(): WebSocketAdapter {
  const sockets: Record<string, WebSocket> = {};

  return {
    id: "binance",

    supportsPair(pair: PairRequest): boolean {
      return true;
    },

    subscribe(pair: PairRequest, onUpdate: (book: TopOfBook) => void) {
      const symbol = toBinanceSymbol(pair).toLowerCase();
      const streamName = `${symbol}@bookTicker`;

      // 🔧 ЛОГ перед подключением
      
      const ws = new WebSocket(`${BASE_URL}/${streamName}`);

      ws.on("message", (msg) => {
        const data = JSON.parse(msg.toString());

        const bid = Number(data.b);
        const ask = Number(data.a);
        const bidQty = Number(data.B);
        const askQty = Number(data.A);

        if (!bid || !ask) return;

        const book: TopOfBook = {
          bid,
          ask,
          bidQty,
          askQty,
          ts: Date.now(),
        };

        onUpdate(book);
      });

      sockets[symbol] = ws;
    },

    unsubscribe(pair: PairRequest) {
      const symbol = toBinanceSymbol(pair).toLowerCase();
      sockets[symbol]?.close();
      delete sockets[symbol];
    },
  };
}
