import type { Metadata } from "next";
import { PerformanceOverview } from "@/components/metrics/performance-overview";
import { prisma } from "@/lib/db";
import { calculatePerformance } from "@/lib/metrics/performance";
import { publicMetricsWhere } from "@/lib/predictions/queries";
import { el } from "@/lib/i18n/el";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: el.statistics.title,
  description: el.statistics.subtitle,
};

const marketLabels: Record<string, string> = {
  MATCH_RESULT_1X2: el.markets.MATCH_RESULT_1X2,
  DOUBLE_CHANCE: el.markets.DOUBLE_CHANCE,
  OVER_UNDER: el.markets.OVER_UNDER,
  BOTH_TEAMS_TO_SCORE: el.markets.BOTH_TEAMS_TO_SCORE,
  DRAW_NO_BET: el.markets.DRAW_NO_BET,
  OTHER: el.markets.OTHER,
};

export default async function StatisticsPage() {
  const published = await prisma.prediction.findMany({
    where: publicMetricsWhere(),
    select: {
      settlementStatus: true,
      oddsAtPublication: true,
      stake: true,
      publicationStatus: true,
      marketType: true,
      competitionId: true,
      competition: { select: { name: true } },
    },
  });
  const metrics = calculatePerformance(published);

  const byMarket = new Map<string, typeof published>();
  for (const p of published) {
    const list = byMarket.get(p.marketType) || [];
    list.push(p);
    byMarket.set(p.marketType, list);
  }

  return (
    <div className="section-shell py-12">
      <h1 className="section-title">{el.statistics.title}</h1>
      <p className="section-subtitle">{el.statistics.subtitle}</p>
      <div className="mt-10">
        <PerformanceOverview metrics={metrics} />
      </div>
      {byMarket.size ? (
        <div className="mt-10 grid gap-4 md:grid-cols-2">
          {[...byMarket.entries()].map(([market, rows]) => {
            const m = calculatePerformance(rows);
            return (
              <div key={market} className="surface-card p-5">
                <h2 className="font-[family-name:var(--font-display)] text-lg">
                  {marketLabels[market] || market.replaceAll("_", " ")}
                </h2>
                <p className="mt-2 text-sm text-[var(--text-muted)]">
                  {m.totalPublished} {el.predictions.publishedCount} ·{" "}
                  {el.performance.hitRate}{" "}
                  {m.hitRate == null ? "—" : `${m.hitRate.toFixed(1)}%`}
                </p>
              </div>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
