import { GraphEdge } from "../MarketGraph/types";
import { ExchangeId } from "../../types";

export type ValidatedOpportunity =
  | ValidatedTriangular
  | ValidatedCross;

export interface BaseValidated {
  path: GraphEdge[];
  maxSize: number;
  netRate: number;
  profitPct: number;
}

export interface ValidatedTriangular extends BaseValidated {
  type: "triangular";
  exchange: ExchangeId;
}

export interface ValidatedCross extends BaseValidated {
  type: "cross";
  buyExchange: ExchangeId;
  sellExchange: ExchangeId;
  symbol: string;
}
