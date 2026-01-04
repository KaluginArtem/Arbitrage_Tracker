import { MarketDataEvent } from "../../layers/MarketData/types";

export interface WsClient {
  id: string;
  connect(): Promise<void>;
  disconnect(): void;
}

export type WsEventHandler = (event: MarketDataEvent) => void;
