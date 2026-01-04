import WebSocket from "ws";
import { WsClient, WsEventHandler } from "../base/base";
import { Universe } from "../../layers/Universe/types";
import { now } from "../../utils/time";
import { buildWsMap } from "../ws/utils";


function round(n: string | number, p = 8) {
  return Number(Number(n).toFixed(p));
}

/**
 * Binance bookTicker WebSocket
 *
 * ❗ ВАЖНО:
 * - Binance НЕ гарантирует поле `e` в multi-stream
 * - bookTicker шлёт МНОГО одинаковых обновлений → нужен dedup
 * - Самый стабильный вариант — multi-stream через URL
 */
export function createBinanceWsClient(
  universe: Universe,
  onEvent: WsEventHandler
): WsClient {
  /**
   * wsSymbol (BTCUSDT) -> meta { symbol: BTC/USDT, base, quote }
   */
  const wsMap = buildWsMap(universe, "binance");

  /**
   * Binance требует lowercase stream names
   */
  const streams = Array.from(wsMap.keys()).map(
    s => `${s.toLowerCase()}@bookTicker`
  );

  /**
   * Binance лимит: ~1024 stream на одно соединение
   * У тебя ~177 — безопасно
   */
  const WS_URL =
    "wss://data-stream.binance.vision/stream?streams=" +
    streams.join("/");

  console.log("[WS:binance] streams:", streams.length);

  let ws: WebSocket;

  /**
   * Anti-duplicate cache:
   * wsSymbol -> "bid|ask|bidQty|askQty"
   */
  const last = new Map<string, string>();

  return {
    id: "binance",

    async connect() {
      ws = new WebSocket(WS_URL);

      ws.on("open", () => {
        console.log("[WS:binance] connected");
      });

      ws.on("message", raw => {
        try {
          const msg = JSON.parse(raw.toString());

          /**
           * Формат multi-stream:
           * {
           *   stream: "btcusdt@bookTicker",
           *   data: {
           *     s: "BTCUSDT",
           *     b: "89409.76",
           *     a: "89409.77",
           *     B: "0.123",
           *     A: "0.456"
           *   }
           * }
           */
          if (!msg || typeof msg !== "object") return;
          if (!msg.data || typeof msg.data !== "object") return;

          const d = msg.data;

          // Минимально необходимые поля
          if (
            d.s == null ||
            d.b == null ||
            d.a == null ||
            d.B == null ||
            d.A == null
          ) {
            return;
          }

          const meta = wsMap.get(d.s);
          if (!meta) return;

          /**
           * Anti-duplicate:
           * Binance может слать десятки одинаковых апдейтов
           */
          const signature = `${d.b}|${d.a}|${d.B}|${d.A}`;
          if (last.get(d.s) === signature) return;
          last.set(d.s, signature);

          onEvent({
            exchange: "binance",
            symbol: meta.symbol,
            base: meta.base,
            quote: meta.quote,
            bid: Number(round(d.b, 8)),
            ask: Number(round(d.a, 8)),
            bidQty: Number(round(d.B, 8)),
            askQty: Number(round(d.A, 8)),
            tsLocal: now(),
          });
        } catch (e) {
          console.error("[WS:binance] parse error", e);
        }
      });

      ws.on("close", (code, reason) => {
        console.warn(
          "[WS:binance] closed",
          code,
          reason.toString()
        );
      });

      ws.on("error", err => {
        console.error("[WS:binance] error", err);
      });
    },

    disconnect() {
      ws?.close();
    },
  };
}
