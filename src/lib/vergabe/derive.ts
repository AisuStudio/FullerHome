import { Bundesland, VergabeResult } from "./types";
import { bandForNetBudget } from "./bands";
import { LAND_OBLIGATIONS } from "./obligations";

// ---------------------------------------------------------------------------
// The FullerHome budget slider is a GROSS project budget including planning
// costs (architect/structural/permits, modeled at 8% in the cost model).
// Vergabe thresholds apply to the NET construction value, planning excluded.
// This is a simplification (real net-value assessment follows VgV/VOB/A
// contract-splitting rules) — disclosed in the UI, not hidden.
//   netConstructionValue ≈ grossBudget / 1.19 (VAT) × (1 − 0.08 planning share)
// ---------------------------------------------------------------------------

const VAT_FACTOR = 1.19;
const PLANNING_SHARE = 0.08;

export function grossBudgetToNetConstructionValue(budgetGross: number): number {
  return Math.round((budgetGross / VAT_FACTOR) * (1 - PLANNING_SHARE));
}

export function deriveVergabe(budgetGross: number, land: Bundesland): VergabeResult {
  const budgetNet = grossBudgetToNetConstructionValue(budgetGross);
  const band = bandForNetBudget(budgetNet);
  return { band, budgetNet, landObligation: LAND_OBLIGATIONS[land] };
}
