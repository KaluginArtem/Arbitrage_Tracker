import { ExchangeId } from "../../types";
import { ExchangeRestClient } from "./base";

import { createBinanceRestClient } from "./binance";
import { createBybitRestClient } from "./bybit";
import { createOkxRestClient } from "./okx";
import { createKrakenRestClient } from "./kraken";
import { createKucoinRestClient } from "./kucoin";
import { createBitfinexRestClient } from "./bitfinex";
import { createBitstampRestClient } from "./bitstamp";
import { createCoinbaseRestClient } from "./coinbase";
import { createCryptoComRestClient } from "./crypto";

export function createExchangeRestClients(exchanges: readonly ExchangeId[]) {
  const map = new Map<ExchangeId, ExchangeRestClient>();

  for (const ex of exchanges) {
    switch (ex) {
      case "binance":  map.set("binance", createBinanceRestClient()); break;
      case "bybit":    map.set("bybit", createBybitRestClient()); break;
      case "okx":      map.set("okx", createOkxRestClient()); break;
      case "kraken":   map.set("kraken", createKrakenRestClient()); break;
      case "kucoin":   map.set("kucoin", createKucoinRestClient()); break;
      case "bitfinex": map.set("bitfinex", createBitfinexRestClient()); break;
      case "bitstamp": map.set("bitstamp", createBitstampRestClient()); break;
      case "coinbase": map.set("coinbase", createCoinbaseRestClient()); break;
      case "crypto":   map.set("crypto", createCryptoComRestClient()); break;
      default:
        // если у тебя тип ExchangeId шире
        console.warn(`[REST] no client for ${ex}`);
    }
  }

  return map;
}
