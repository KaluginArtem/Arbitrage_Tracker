import { ExchangeAdapter } from "./base";

import { binanceAdapter } from "./binance/adapter";
import { bybitAdapter } from "./bybit/adapter";
import { okxAdapter } from "./okx/adapter";
import { krakenAdapter } from "./kraken/adapter";
import { kucoinAdapter } from "./kucoin/adapter";
import { bitfinexAdapter } from "./bitfinex/adapter";
import { bitstampAdapter } from "./bitstamp/adapter";
import { coinbaseAdapter } from "./coinbase/adapter";
import { cryptoComAdapter } from "./crypto/adapter";

export function getAdapters(): ExchangeAdapter[] {
  return [
    binanceAdapter(),
    bybitAdapter(),
    okxAdapter(),
    krakenAdapter(),
    kucoinAdapter(),
    bitfinexAdapter(),
    bitstampAdapter(),
    coinbaseAdapter(),
    cryptoComAdapter(),
  ];
}
