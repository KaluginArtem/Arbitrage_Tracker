import WebSocket from "ws";
import axios from "axios";
import { WebSocketAdapter } from "../base";
import { PairRequest, TopOfBook } from "../../types";

export function kucoinWebSocketAdapter(): WebSocketAdapter {
  const sockets: Record<string, WebSocket> = {};

  return {
    id: "kucoin",

    supportsPair(pair: PairRequest): boolean {
      return true;
    },

    async subscribe(pair: PairRequest, onUpdate: (book: TopOfBook) => void) {
      const symbol = `${pair.base}-${pair.quote}`;

      const res = await axios.post("https://api.kucoin.com/api/v1/bullet-public");
      const { token, instanceServers } = res.data.data;
      const endpoint = instanceServers[0].endpoint;

      const ws = new WebSocket(`${endpoint}?token=${token}`);

      ws.on("open", () => {
        ws.send(JSON.stringify({
          id: Date.now(),
          type: "subscribe",
          topic: `/market/ticker:${symbol}`,
          response: true
        }));
      });

      ws.on("message", (msg) => {
        const d = JSON.parse(msg.toString());
        if (!d?.data) return;

        const bid = Number(d.data.bestBid);
        const ask = Number(d.data.bestAsk);
        const bidQty = Number(d.data.bestBidSize);
        const askQty = Number(d.data.bestAskSize);

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
