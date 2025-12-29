import WebSocket from "ws";
import Decimal from "decimal.js";
import { sleep } from "./sleep";

type Pair = `${string}/${string}`;

const PAIRS: Pair[] = [
  "BTC/USDT",
  "ETH/USDT",
  "USDC/USDT",
  "DAI/USDT",
  "FDUSD/USDT"
];

const conversionRates: Map<Pair, Decimal> = new Map();

export function getRate(from: string, to: string): Decimal | null {
  if (from === to) return new Decimal(1);

  const direct = `${from}/${to}` as Pair;
  if (conversionRates.has(direct)) return conversionRates.get(direct)!;

  const inverse = `${to}/${from}` as Pair;
  if (conversionRates.has(inverse)) {
    return new Decimal(1).div(conversionRates.get(inverse)!);
  }

  return null;
}

export async function initConversionRates(): Promise<void> {
  for (const pair of PAIRS) {
    const [base, quote] = pair.split("/");

    const symbol = `${base}${quote}`.toLowerCase();
    const url = `wss://stream.binance.com:9443/ws/${symbol}@bookTicker`;

    const ws = new WebSocket(url);
    ws.on("message", (raw) => {
      try {
        const data = JSON.parse(raw.toString());
        const bid = new Decimal(data.b);
        const ask = new Decimal(data.a);

        const mid = bid.plus(ask).div(2);
        conversionRates.set(pair, mid);
      } catch (err) {
        console.warn(`Error parsing conversion rate for ${pair}`);
      }
    });

    ws.on("error", () => console.warn(`WebSocket error for ${pair}`));
  }

  await sleep(2000); // небольшая задержка на прогрузку
}
