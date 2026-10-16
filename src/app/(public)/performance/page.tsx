import type { Metadata } from "next";
import { PredictionCard } from "@/components/predictions/prediction-card";
import { PerformanceOverview } from "@/components/metrics/performance-overview";
import { prisma } from "@/lib/db";
import { calculatePerformance } from "@/lib/metrics/performance";
import {
  listPublishedPredictions,
  publicMetricsWhere,
} from "@/lib/predictions/queries";
import { publicPredictionFilterSchema } from "@/lib/validations/prediction";
import { el } from "@/lib/i18n/el";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: el.performance.historyTitle,
  description: el.performance.historySubtitle,
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

  const metricsWhere = publicMetricsWhere({
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
  });

  const [listed, allForMetrics, sports, competitions] = await Promise.all([
    listPublishedPredictions(filters),
    prisma.prediction.findMany({
      where: metricsWhere,
      select: {
        settlementStatus: true,
        oddsAtPublication: true,
        stake: true,
        publicationStatus: true,
      },
    }),
    prisma.sport.findMany({ orderBy: { name: "asc" } }),
    prisma.competition.findMany({
      where: { predictions: { some: publicMetricsWhere() } },
      orderBy: { name: "asc" },
    }),
  ]);

  const metrics = calculatePerformance(allForMetrics);

  return (
    <div className="section-shell page-stack">
      <h1 className="page-title">{el.performance.historyTitle}</h1>
      <p className="section-subtitle">{el.performance.historySubtitle}</p>

      <form className="filter-bar mt-5 md:grid-cols-3 lg:grid-cols-6">
        <select name="sport" defaultValue={filters.sport || ""} className="control">
          <option value="">{el.performance.sport}</option>
          {sports.map((s) => (
            <option key={s.id} value={s.slug}>
              {s.name}
            </option>
          ))}
        </select>
        <select
          name="competition"
          defaultValue={filters.competition || ""}
          className="control"
        >
          <option value="">{el.performance.competition}</option>
          {competitions.map((c) => (
            <option key={c.id} value={c.slug}>
              {c.name}
            </option>
          ))}
        </select>
        <select name="market" defaultValue={filters.market || ""} className="control">
          <option value="">{el.performance.market}</option>
          <option value="MATCH_RESULT_1X2">{el.markets.MATCH_RESULT_1X2}</option>
          <option value="OVER_UNDER">{el.markets.OVER_UNDER}</option>
          <option value="BOTH_TEAMS_TO_SCORE">{el.markets.BOTH_TEAMS_TO_SCORE}</option>
          <option value="DOUBLE_CHANCE">{el.markets.DOUBLE_CHANCE}</option>
          <option value="DRAW_NO_BET">{el.markets.DRAW_NO_BET}</option>
        </select>
        <select name="status" defaultValue={filters.status || ""} className="control">
          <option value="">{el.performance.result}</option>
          <option value="WON">{el.status.WON}</option>
          <option value="LOST">{el.status.LOST}</option>
          <option value="PENDING">{el.status.PENDING}</option>
          <option value="VOID">{el.status.VOID}</option>
        </select>
        <input
          type="date"
          name="from"
          aria-label={el.common.from}
          defaultValue={
            filters.from ? filters.from.toISOString().slice(0, 10) : ""
          }
          className="control"
        />
        <button className="btn-primary">{el.performance.filter}</button>
      </form>

      <div className="mt-6">
        <PerformanceOverview metrics={metrics} title={el.performance.recorded} />
      </div>

      <div className="mt-6 grid gap-3 md:grid-cols-2">
        {listed.items.map((p) => (
          <PredictionCard key={p.id} prediction={p} />
        ))}
      </div>
      {!listed.items.length ? (
        <div className="empty-state mt-5">{el.performance.emptyPeriod}</div>
      ) : null}
    </div>
  );
}
