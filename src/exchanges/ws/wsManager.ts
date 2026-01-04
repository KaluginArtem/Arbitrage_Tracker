import { PairRequest, TopOfBook } from "../../types";
import { WebSocketAdapter } from "../base/base";

export class WebSocketManager {
  private adapters: WebSocketAdapter[] = [];
  private listeners: Record<string, (book: TopOfBook) => void> = {};

  registerAdapter(adapter: WebSocketAdapter) {
    this.adapters.push(adapter);
  }

  subscribeAll(pairs: PairRequest[], onUpdate: (exchangeId: string, pair: PairRequest, book: TopOfBook) => void) {
    for (const adapter of this.adapters) {
      for (const pair of pairs) {
        if (adapter.supportsPair(pair)) {
          adapter.subscribe(pair, (book) => {
            onUpdate(adapter.id, pair, book);
          });
        }
      }
    }
  }

  unsubscribeAll(pairs: PairRequest[]) {
    for (const adapter of this.adapters) {
      for (const pair of pairs) {
        if (adapter.supportsPair(pair)) {
          adapter.unsubscribe(pair);
        }
      }
    }
  }
}