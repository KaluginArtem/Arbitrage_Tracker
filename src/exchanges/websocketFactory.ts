import { WebSocketAdapter } from "./base";

import { binanceWebSocketAdapter } from "./binance/wsAdapter";
import { bybitWebSocketAdapter } from "./bybit/wsAdapter";
import { okxWebSocketAdapter } from "./okx/wsAdapter";
import { krakenWebSocketAdapter } from "./kraken/wsAdapter";
import { kucoinWebSocketAdapter } from "./kucoin/wsAdapter";
import { bitfinexWebSocketAdapter } from "./bitfinex/wsAdapter";
import { bitstampWebSocketAdapter } from "./bitstamp/wsAdapter";
import { coinbaseWebSocketAdapter } from "./coinbase/wsAdapter";
import { cryptoComWebSocketAdapter } from "./crypto/wsAdapter";

export function getWebSocketAdapters(): WebSocketAdapter[] {
  return [
    binanceWebSocketAdapter(),
    bybitWebSocketAdapter(),
    okxWebSocketAdapter(),
    krakenWebSocketAdapter(),
    kucoinWebSocketAdapter(),
    bitfinexWebSocketAdapter(),
    bitstampWebSocketAdapter(),
    coinbaseWebSocketAdapter(),
    cryptoComWebSocketAdapter(),
  ];
}
