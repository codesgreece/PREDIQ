import { describe, expect, it } from "vitest";
import { calculatePerformance } from "@/lib/metrics/performance";

describe("performance metrics", () => {
  it("computes hit rate excluding pending", () => {
    const metrics = calculatePerformance([
      {
        publicationStatus: "PUBLISHED",
        settlementStatus: "WON",
        oddsAtPublication: 2,
        stake: 10,
      },
      {
        publicationStatus: "PUBLISHED",
        settlementStatus: "LOST",
        oddsAtPublication: 2,
        stake: 10,
      },
      {
        publicationStatus: "PUBLISHED",
        settlementStatus: "PENDING",
        oddsAtPublication: 2,
        stake: 10,
      },
    ]);
    expect(metrics.hitRate).toBe(50);
    expect(metrics.pending).toBe(1);
  });

  it("withholds ROI when stake/odds incomplete", () => {
    const metrics = calculatePerformance([
      {
        publicationStatus: "PUBLISHED",
        settlementStatus: "WON",
        oddsAtPublication: 2,
        stake: 10,
      },
      {
        publicationStatus: "PUBLISHED",
        settlementStatus: "LOST",
        oddsAtPublication: null,
        stake: 10,
      },
    ]);
    expect(metrics.roi).toBeNull();
    expect(metrics.profitLoss).toBeNull();
    expect(metrics.roiIncompleteCount).toBe(1);
  });

  it("computes ROI only with complete settled stake/odds", () => {
    const metrics = calculatePerformance([
      {
        publicationStatus: "PUBLISHED",
        settlementStatus: "WON",
        oddsAtPublication: 2,
        stake: 10,
      },
      {
        publicationStatus: "PUBLISHED",
        settlementStatus: "LOST",
        oddsAtPublication: 2,
        stake: 10,
      },
    ]);
    expect(metrics.profitLoss).toBe(0);
    expect(metrics.roi).toBe(0);
  });

  it("ignores drafts in aggregates", () => {
    const metrics = calculatePerformance([
      {
        publicationStatus: "DRAFT",
        settlementStatus: "WON",
        oddsAtPublication: 2,
        stake: 10,
      },
    ]);
    expect(metrics.totalPublished).toBe(0);
    expect(metrics.hitRate).toBeNull();
  });
});
