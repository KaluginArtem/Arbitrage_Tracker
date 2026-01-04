import { GraphEdge } from "../MarketGraph/types";
import { ExchangeId } from "../../types";

export type OpportunityCandidate =
  | TriangularCandidate
  | CrossCandidate;

export interface TriangularCandidate {
  type: "triangular";
  exchange: ExchangeId;
  path: GraphEdge[];
}

export interface CrossCandidate {
  type: "cross";
  buyExchange: ExchangeId;
  sellExchange: ExchangeId;
  symbol: string;
  path: GraphEdge[];
}
