import { ExchangeId, PairRequest, TopOfBook } from "../types";

export interface ExchangeAdapter {
  id: ExchangeId;

  // Список пар, которые адаптер реально умеет строить в формат биржи
  supportsPair(pair: PairRequest): boolean;

  // Получить top-of-book (bid/ask + qty)
  fetchTopOfBook(pair: PairRequest): Promise<TopOfBook | null>;
}

export interface WebSocketAdapter {
  id: string;

  supportsPair(pair: PairRequest): boolean;

  subscribe(pair: PairRequest, onUpdate: (book: TopOfBook) => void): void;

  unsubscribe(pair: PairRequest): void;
}
