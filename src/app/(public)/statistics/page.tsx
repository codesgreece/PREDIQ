import type { Metadata } from "next";
import { PerformanceOverview } from "@/components/metrics/performance-overview";
import { prisma } from "@/lib/db";
import { calculatePerformance } from "@/lib/metrics/performance";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Statistics",
  description: "Aggregate PREDIQ performance statistics from published records.",
};

export default async function StatisticsPage() {
  const published = await prisma.prediction.findMany({
    where: { publicationStatus: "PUBLISHED" },
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
    <div className="mx-auto max-w-6xl px-4 py-12 md:px-6">
      <h1 className="font-[family-name:var(--font-display)] text-4xl">
        Statistics
      </h1>
      <p className="mt-3 max-w-2xl text-[var(--text-muted)]">
        Aggregates are computed from actual published prediction records. Empty
        datasets do not invent success rates.
      </p>
      <div className="mt-10">
        <PerformanceOverview metrics={metrics} />
      </div>
      <div className="mt-10 grid gap-4 md:grid-cols-2">
        {[...byMarket.entries()].map(([market, rows]) => {
          const m = calculatePerformance(rows);
          return (
            <div
              key={market}
              className="rounded-xl border border-[var(--border)] bg-[var(--card)]/50 p-5"
            >
              <h2 className="text-lg">{market.replaceAll("_", " ")}</h2>
              <p className="mt-2 text-sm text-[var(--text-muted)]">
                {m.totalPublished} published · hit rate{" "}
                {m.hitRate == null ? "—" : `${m.hitRate.toFixed(1)}%`}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
