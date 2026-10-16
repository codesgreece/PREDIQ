import type { PublicationStatus, SettlementStatus } from "@prisma/client";

export type PerformanceInput = {
  settlementStatus: SettlementStatus;
  publicationStatus: PublicationStatus;
  oddsAtPublication?: unknown;
  stake?: unknown;
};

export type PerformanceMetrics = {
  totalPublished: number;
  settled: number;
  won: number;
  lost: number;
  pending: number;
  voided: number;
  hitRate: number | null;
  profitLoss: number | null;
  roi: number | null;
  roiEligibleCount: number;
  roiIncompleteCount: number;
};

function toNumber(value: unknown): number | null {
  if (value == null) return null;
  const n = typeof value === "number" ? value : Number(value);
  return Number.isFinite(n) ? n : null;
}

/**
 * Hit rate = won / (won + lost) × 100. Pending and void excluded from denominator.
 * ROI only when stake and odds are present for settled WON/LOST rows.
 */
export function calculatePerformance(
  predictions: PerformanceInput[],
): PerformanceMetrics {
  const published = predictions.filter(
    (p) => p.publicationStatus === "PUBLISHED" || p.publicationStatus === "ARCHIVED",
  );

  let won = 0;
  let lost = 0;
  let pending = 0;
  let voided = 0;
  let profit = 0;
  let stakeSum = 0;
  let roiEligible = 0;
  let roiIncomplete = 0;

  for (const p of published) {
    const status = p.settlementStatus as SettlementStatus;
    if (status === "WON") won += 1;
    else if (status === "LOST") lost += 1;
    else if (status === "VOID") voided += 1;
    else pending += 1;

    if (status === "WON" || status === "LOST") {
      const odds = toNumber(p.oddsAtPublication);
      const stake = toNumber(p.stake);
      if (odds == null || stake == null || odds <= 1 || stake <= 0) {
        roiIncomplete += 1;
        continue;
      }
      roiEligible += 1;
      stakeSum += stake;
      profit += status === "WON" ? stake * (odds - 1) : -stake;
    }
  }

  const decided = won + lost;
  const hitRate = decided > 0 ? (won / decided) * 100 : null;
  const hasRoi = roiEligible > 0 && roiIncomplete === 0;
  const profitLoss = hasRoi ? profit : null;
  const roi = hasRoi && stakeSum > 0 ? (profit / stakeSum) * 100 : null;

  return {
    totalPublished: published.length,
    settled: won + lost + voided,
    won,
    lost,
    pending,
    voided,
    hitRate,
    profitLoss,
    roi,
    roiEligibleCount: roiEligible,
    roiIncompleteCount: roiIncomplete,
  };
}
