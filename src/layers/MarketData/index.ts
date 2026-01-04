import { MarketDataEvent } from "./types";

type Listener = (event: MarketDataEvent) => void;

export class MarketDataBus {
  private listeners: Listener[] = [];

  subscribe(fn: Listener) {
    this.listeners.push(fn);
  }

  emit(event: MarketDataEvent) {
    for (const fn of this.listeners) {
      fn(event);
    }
  }
}
