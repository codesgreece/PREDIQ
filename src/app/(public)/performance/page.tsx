import type { Metadata } from "next";
import { PredictionCard } from "@/components/predictions/prediction-card";
import { PerformanceOverview } from "@/components/metrics/performance-overview";
import { prisma } from "@/lib/db";
import { calculatePerformance } from "@/lib/metrics/performance";
import { listPublishedPredictions } from "@/lib/predictions/queries";
import { publicPredictionFilterSchema } from "@/lib/validations/prediction";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Performance History",
  description:
    "Transparent PREDIQ prediction record including wins, losses, and pending selections.",
};

export default async function PerformancePage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const filters = publicPredictionFilterSchema.parse({
    sport: typeof sp.sport === "string" ? sp.sport : undefined,
    competition: typeof sp.competition === "string" ? sp.competition : undefined,
    market: typeof sp.market === "string" ? sp.market : undefined,
    status: typeof sp.status === "string" ? sp.status : undefined,
    from: typeof sp.from === "string" ? sp.from : undefined,
    to: typeof sp.to === "string" ? sp.to : undefined,
    page: typeof sp.page === "string" ? sp.page : "1",
    pageSize: "12",
    sort: "published_desc",
  });

  const [listed, allForMetrics, sports, competitions] = await Promise.all([
    listPublishedPredictions(filters),
    prisma.prediction.findMany({
      where: {
        publicationStatus: "PUBLISHED",
        ...(filters.sport ? { sport: { slug: filters.sport } } : {}),
        ...(filters.competition
          ? { competition: { slug: filters.competition } }
          : {}),
        ...(filters.market ? { marketType: filters.market } : {}),
        ...(filters.status ? { settlementStatus: filters.status } : {}),
        ...(filters.from || filters.to
          ? {
              publishedAt: {
                ...(filters.from ? { gte: filters.from } : {}),
                ...(filters.to ? { lte: filters.to } : {}),
              },
            }
          : {}),
      },
      select: {
        settlementStatus: true,
        oddsAtPublication: true,
        stake: true,
        publicationStatus: true,
      },
    }),
    prisma.sport.findMany(),
    prisma.competition.findMany({
      where: { predictions: { some: { publicationStatus: "PUBLISHED" } } },
      orderBy: { name: "asc" },
    }),
  ]);

  const metrics = calculatePerformance(allForMetrics);

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 md:px-6">
      <h1 className="font-[family-name:var(--font-display)] text-4xl">
        Performance history
      </h1>
      <p className="mt-3 max-w-2xl text-[var(--text-muted)]">
        Full published record, including losses. Historical results are not
        silently rewritten.
      </p>

      <form className="mt-8 grid gap-3 rounded-2xl border border-[var(--border)] bg-[var(--card)]/50 p-4 md:grid-cols-3 lg:grid-cols-6">
        <select
          name="sport"
          defaultValue={filters.sport || ""}
          className="h-10 rounded-md border border-[var(--border)] bg-[var(--bg-secondary)] px-3 text-sm"
        >
          <option value="">Sport</option>
          {sports.map((s) => (
            <option key={s.id} value={s.slug}>
              {s.name}
            </option>
          ))}
        </select>
        <select
          name="competition"
          defaultValue={filters.competition || ""}
          className="h-10 rounded-md border border-[var(--border)] bg-[var(--bg-secondary)] px-3 text-sm"
        >
          <option value="">Competition</option>
          {competitions.map((c) => (
            <option key={c.id} value={c.slug}>
              {c.name}
            </option>
          ))}
        </select>
        <select
          name="market"
          defaultValue={filters.market || ""}
          className="h-10 rounded-md border border-[var(--border)] bg-[var(--bg-secondary)] px-3 text-sm"
        >
          <option value="">Market</option>
          <option value="MATCH_RESULT_1X2">1X2</option>
          <option value="OVER_UNDER">Over/Under</option>
          <option value="BOTH_TEAMS_TO_SCORE">BTTS</option>
          <option value="DOUBLE_CHANCE">Double chance</option>
          <option value="DRAW_NO_BET">Draw no bet</option>
        </select>
        <select
          name="status"
          defaultValue={filters.status || ""}
          className="h-10 rounded-md border border-[var(--border)] bg-[var(--bg-secondary)] px-3 text-sm"
        >
          <option value="">Result</option>
          <option value="WON">Won</option>
          <option value="LOST">Lost</option>
          <option value="PENDING">Pending</option>
          <option value="VOID">Void</option>
        </select>
        <input
          type="date"
          name="from"
          defaultValue={
            filters.from ? filters.from.toISOString().slice(0, 10) : ""
          }
          className="h-10 rounded-md border border-[var(--border)] bg-[var(--bg-secondary)] px-3 text-sm"
        />
        <button className="h-10 rounded-md bg-[var(--neon)] text-sm font-semibold text-[#04140f]">
          Filter
        </button>
      </form>

      <div className="mt-10">
        <PerformanceOverview metrics={metrics} title="Recorded metrics" />
      </div>

      <div className="mt-10 grid gap-4 md:grid-cols-2">
        {listed.items.map((p) => (
          <PredictionCard key={p.id} prediction={p} />
        ))}
      </div>
      {!listed.items.length ? (
        <div className="mt-8 rounded-2xl border border-dashed border-white/10 p-10 text-center text-[var(--text-muted)]">
          No published predictions in this period.
        </div>
      ) : null}
    </div>
  );
}
