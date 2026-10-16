import Link from "next/link";
import type { Metadata } from "next";
import { PredictionCard } from "@/components/predictions/prediction-card";
import { prisma } from "@/lib/db";
import { listPublishedPredictions, publicMetricsWhere } from "@/lib/predictions/queries";
import { publicPredictionFilterSchema } from "@/lib/validations/prediction";
import { el } from "@/lib/i18n/el";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: el.nav.predictions,
  description: el.predictions.subtitle,
};

export default async function PredictionsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const filters = publicPredictionFilterSchema.parse({
    q: typeof sp.q === "string" ? sp.q : undefined,
    sport: typeof sp.sport === "string" ? sp.sport : undefined,
    competition: typeof sp.competition === "string" ? sp.competition : undefined,
    country: typeof sp.country === "string" ? sp.country : undefined,
    market: typeof sp.market === "string" ? sp.market : undefined,
    status: typeof sp.status === "string" ? sp.status : undefined,
    from: typeof sp.from === "string" ? sp.from : undefined,
    to: typeof sp.to === "string" ? sp.to : undefined,
    page: typeof sp.page === "string" ? sp.page : "1",
    sort: typeof sp.sort === "string" ? sp.sort : "published_desc",
  });

  const [result, sports, competitions, countries] = await Promise.all([
    listPublishedPredictions(filters),
    prisma.sport.findMany({ orderBy: { name: "asc" } }),
    prisma.competition.findMany({
      where: { predictions: { some: publicMetricsWhere() } },
      orderBy: { name: "asc" },
    }),
    prisma.country.findMany({
      where: {
        competitions: {
          some: { predictions: { some: publicMetricsWhere() } },
        },
      },
      orderBy: { name: "asc" },
    }),
  ]);

  return (
    <div className="section-shell py-12">
      <h1 className="section-title">{el.nav.predictions}</h1>
      <p className="section-subtitle">{el.predictions.draftsNever}</p>

      <form className="mt-8 grid gap-3 rounded-2xl border border-[var(--border)] bg-[var(--card)]/60 p-4 md:grid-cols-3 lg:grid-cols-4">
        <input
          name="q"
          defaultValue={filters.q || ""}
          placeholder={el.predictions.search}
          className="h-11 rounded-xl border border-[var(--border)] bg-[var(--bg-secondary)] px-3 text-sm"
        />
        <select
          name="sport"
          defaultValue={filters.sport || ""}
          className="h-11 rounded-xl border border-[var(--border)] bg-[var(--bg-secondary)] px-3 text-sm"
        >
          <option value="">{el.predictions.allSports}</option>
          {sports.map((s) => (
            <option key={s.id} value={s.slug}>
              {s.name}
            </option>
          ))}
        </select>
        <select
          name="competition"
          defaultValue={filters.competition || ""}
          className="h-11 rounded-xl border border-[var(--border)] bg-[var(--bg-secondary)] px-3 text-sm"
        >
          <option value="">{el.predictions.allCompetitions}</option>
          {competitions.map((c) => (
            <option key={c.id} value={c.slug}>
              {c.name}
            </option>
          ))}
        </select>
        <select
          name="country"
          defaultValue={filters.country || ""}
          className="h-11 rounded-xl border border-[var(--border)] bg-[var(--bg-secondary)] px-3 text-sm"
        >
          <option value="">{el.predictions.allCountries}</option>
          {countries.map((c) => (
            <option key={c.id} value={c.code}>
              {c.name}
            </option>
          ))}
        </select>
        <select
          name="market"
          defaultValue={filters.market || ""}
          className="h-11 rounded-xl border border-[var(--border)] bg-[var(--bg-secondary)] px-3 text-sm"
        >
          <option value="">{el.predictions.allMarkets}</option>
          <option value="MATCH_RESULT_1X2">{el.markets.MATCH_RESULT_1X2}</option>
          <option value="DOUBLE_CHANCE">{el.markets.DOUBLE_CHANCE}</option>
          <option value="OVER_UNDER">{el.markets.OVER_UNDER}</option>
          <option value="BOTH_TEAMS_TO_SCORE">{el.markets.BOTH_TEAMS_TO_SCORE}</option>
          <option value="DRAW_NO_BET">{el.markets.DRAW_NO_BET}</option>
          <option value="OTHER">{el.markets.OTHER}</option>
        </select>
        <select
          name="status"
          defaultValue={filters.status || ""}
          className="h-11 rounded-xl border border-[var(--border)] bg-[var(--bg-secondary)] px-3 text-sm"
        >
          <option value="">{el.predictions.allStatuses}</option>
          <option value="PENDING">{el.status.PENDING}</option>
          <option value="WON">{el.status.WON}</option>
          <option value="LOST">{el.status.LOST}</option>
          <option value="VOID">{el.status.VOID}</option>
        </select>
        <input
          type="date"
          name="from"
          defaultValue={filters.from ? filters.from.toISOString().slice(0, 10) : ""}
          className="h-11 rounded-xl border border-[var(--border)] bg-[var(--bg-secondary)] px-3 text-sm"
        />
        <input
          type="date"
          name="to"
          defaultValue={filters.to ? filters.to.toISOString().slice(0, 10) : ""}
          className="h-11 rounded-xl border border-[var(--border)] bg-[var(--bg-secondary)] px-3 text-sm"
        />
        <button className="h-11 rounded-xl bg-[var(--neon)] px-4 text-sm font-semibold text-[#04140f] md:col-span-2 lg:col-span-1">
          {el.predictions.apply}
        </button>
      </form>

      <div className="mt-8 grid gap-4 md:grid-cols-2">
        {result.items.map((p) => (
          <PredictionCard key={p.id} prediction={p} />
        ))}
      </div>

      {!result.items.length ? (
        <div className="mt-8 surface-card border-dashed p-10 text-center text-[var(--text-muted)]">
          {el.predictions.emptyFiltered}
        </div>
      ) : null}

      <div className="mt-8 flex items-center justify-between text-sm text-[var(--text-muted)]">
        <span>
          {el.predictions.page} {result.page} {el.predictions.of} {result.pageCount} ·{" "}
          {result.total} {el.predictions.publishedCount}
        </span>
        <div className="flex gap-3">
          {result.page > 1 ? (
            <Link href={`/predictions?page=${result.page - 1}`} className="text-[var(--neon)]">
              {el.predictions.previous}
            </Link>
          ) : null}
          {result.page < result.pageCount ? (
            <Link href={`/predictions?page=${result.page + 1}`} className="text-[var(--neon)]">
              {el.predictions.next}
            </Link>
          ) : null}
        </div>
      </div>
    </div>
  );
}
