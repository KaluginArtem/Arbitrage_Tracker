import { ValidatedOpportunity } from "../OpportunityValidate/types";

export type ScoredOpportunity =
  (ValidatedOpportunity & { score: number });

export function scoreOpportunity(
  opp: ValidatedOpportunity
): ScoredOpportunity {

  const sizeFactor = Math.log10(1 + opp.maxSize);
  const profitFactor = opp.profitPct;
  const pathPenalty = opp.path.length === 2 ? 0.9 : 1.0; // cross < triangular

  const score =
    profitFactor *
    sizeFactor *
    pathPenalty;

  return {
    ...opp,
    score,
  };
}
