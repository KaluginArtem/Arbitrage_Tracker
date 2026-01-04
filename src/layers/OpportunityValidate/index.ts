import { OpportunityCandidate } from "../OpportunityFinders/types";
import { ValidatedOpportunity } from "./types";
import { validateTimeSkew } from "./timeSkew";
import { computeMaxSize } from "./liquidity";
import { computeNetRate } from "./profit";
import { validateStability } from "./stability";

export interface ValidatorConfig {
  minProfitPct: number;
  maxTimeSkewMs: number;
  minStableTicks: number;
  minNotional: number;
}

export function validateOpportunity(
  candidate: OpportunityCandidate,
  cfg: ValidatorConfig
): ValidatedOpportunity | null {

  const path = candidate.path;

  if (!validateTimeSkew(path, cfg.maxTimeSkewMs)) return null;
  if (!validateStability(path, cfg.minStableTicks)) return null;

  const maxSize = computeMaxSize(path);
  if (maxSize < cfg.minNotional) return null;

  const netRate = computeNetRate(path);
  const profitPct = (netRate - 1) * 100;
  if (profitPct < cfg.minProfitPct) return null;

  if (candidate.type === "triangular") {
    return {
      type: "triangular",
      exchange: candidate.exchange,
      path,
      maxSize,
      netRate,
      profitPct,
    };
  }

  return {
    type: "cross",
    buyExchange: candidate.buyExchange,
    sellExchange: candidate.sellExchange,
    symbol: candidate.symbol,
    path,
    maxSize,
    netRate,
    profitPct,
  };
}

