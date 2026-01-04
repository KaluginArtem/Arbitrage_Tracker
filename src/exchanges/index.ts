import { Universe } from "../layers/Universe";
import { WsEventHandler } from "./base/base";

import { createBinanceWsClient } from "./binance/ws";
import { createBybitWsClient } from "./bybit/ws";
import { createOkxWsClient } from "./okx/ws";
import { createKrakenWsClient } from "./kraken/ws";
import { createBitfinexWsClient } from "./bitfinex/ws";
import { createBitstampWsClient } from "./bitstamp/ws";
import { createCoinbaseWsClient } from "./coinbase/ws";
import { createCryptoComWsClient } from "./crypto/ws";

import { WsClient } from "./base/base";

interface CreateWsClientsOpts {
  onEvent: WsEventHandler;
  universe: Universe;
}
export function createWsClients(opts: { onEvent: WsEventHandler; universe: Universe }): WsClient[] {
  const { onEvent, universe } = opts;

  return [
    createBinanceWsClient(universe, onEvent),
    createBitfinexWsClient(universe, onEvent),
    createBybitWsClient(universe, onEvent),
    createOkxWsClient(universe, onEvent),
    createKrakenWsClient(universe, onEvent),
    createBitstampWsClient(universe, onEvent),
    createCoinbaseWsClient(universe, onEvent),
    createCryptoComWsClient(universe, onEvent),
  ];
}
