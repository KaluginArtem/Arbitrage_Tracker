import axios from "axios";
import { ExchangeRestClient, ListedMarket } from "./base";

type BitfinexConfResp = any; // ответ массивами, типизировать можно позже

export function createBitfinexRestClient(): ExchangeRestClient {
  const http = axios.create({
    baseURL: "https://api-pub.bitfinex.com",
    timeout: 15_000,
  });

  return {
    id: "bitfinex",
    async listMarkets(): Promise<ListedMarket[]> {
      // /v2/conf/pub:list:pair:exchange
      const res = await http.get<BitfinexConfResp>("/v2/conf/pub:list:pair:exchange");
      const data = res.data;

      // формат: [ [ "BTCUSD","ETHUSD", ... ] ]
      const pairs: string[] = Array.isArray(data) && Array.isArray(data[0]) ? data[0] : [];

      const out: ListedMarket[] = [];
      for (const p of pairs) {
        // Bitfinex pairs обычно без разделителя: BTCUSD / BTCUST / ETHBTC / ...
        // Для WS обычно "tBTCUSD", "tBTCUST" и т.п.
        const wsSymbol = `t${p}`;

        // Разбор base/quote: эвристика по хвосту (как у тебя), но на REST-уровне это ок
        const QUOTES = ["USDT","USD","BTC","ETH","EUR","GBP"];
        const q = QUOTES.find(x => p.endsWith(x));
        if (!q) continue;

        const base = p.slice(0, p.length - q.length);
        if (!base) continue;

        out.push({
          base,
          quote: q,
          wsSymbol,     // tBTCUSDT / tETHBTC ...
          status: "TRADING",
        });
      }

      return out;
    }
  };
}
