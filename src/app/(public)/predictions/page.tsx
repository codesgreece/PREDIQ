import Link from "next/link";
import { PredictionCard } from "@/components/predictions/prediction-card";
import { prisma } from "@/lib/db";
import { listPublishedPredictions } from "@/lib/predictions/queries";
import { publicPredictionFilterSchema } from "@/lib/validations/prediction";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Predictions",
  description: "Published PREDIQ sports predictions with filters and history.",
};

export default async function PredictionsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const raw = {
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
  };
  const filters = publicPredictionFilterSchema.parse(raw);
  const [result, sports, competitions, countries] = await Promise.all([
    listPublishedPredictions(filters),
    prisma.sport.findMany({ orderBy: { name: "asc" } }),
    prisma.competition.findMany({
      where: { predictions: { some: { publicationStatus: "PUBLISHED" } } },
      orderBy: { name: "asc" },
    }),
    prisma.country.findMany({
      where: {
        competitions: {
          some: { predictions: { some: { publicationStatus: "PUBLISHED" } } },
        },
      },
      orderBy: { name: "asc" },
    }),
  ]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 md:px-6">
      <h1 className="font-[family-name:var(--font-display)] text-4xl">
        Predictions
      </h1>
      <p className="mt-3 max-w-2xl text-[var(--text-muted)]">
        Browse published and settled selections. Drafts are never listed.
      </p>

      <form className="mt-8 grid gap-3 rounded-2xl border border-[var(--border)] bg-[var(--card)]/50 p-4 md:grid-cols-3 lg:grid-cols-4">
        <input
          name="q"
          defaultValue={filters.q || ""}
          placeholder="Search teams or title"
          className="h-10 rounded-md border border-[var(--border)] bg-[var(--bg-secondary)] px-3 text-sm"
        />
        <select
          name="sport"
          defaultValue={filters.sport || ""}
          className="h-10 rounded-md border border-[var(--border)] bg-[var(--bg-secondary)] px-3 text-sm"
        >
          <option value="">All sports</option>
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
          <option value="">All competitions</option>
          {competitions.map((c) => (
            <option key={c.id} value={c.slug}>
              {c.name}
            </option>
          ))}
        </select>
        <select
          name="country"
          defaultValue={filters.country || ""}
          className="h-10 rounded-md border border-[var(--border)] bg-[var(--bg-secondary)] px-3 text-sm"
        >
          <option value="">All countries</option>
          {countries.map((c) => (
            <option key={c.id} value={c.code}>
              {c.name}
            </option>
          ))}
        </select>
        <select
          name="market"
          defaultValue={filters.market || ""}
          className="h-10 rounded-md border border-[var(--border)] bg-[var(--bg-secondary)] px-3 text-sm"
        >
          <option value="">All markets</option>
          <option value="MATCH_RESULT_1X2">1X2</option>
          <option value="DOUBLE_CHANCE">Double chance</option>
          <option value="OVER_UNDER">Over/Under</option>
          <option value="BOTH_TEAMS_TO_SCORE">BTTS</option>
          <option value="DRAW_NO_BET">Draw no bet</option>
          <option value="OTHER">Other</option>
        </select>
        <select
          name="status"
          defaultValue={filters.status || ""}
          className="h-10 rounded-md border border-[var(--border)] bg-[var(--bg-secondary)] px-3 text-sm"
        >
          <option value="">All statuses</option>
          <option value="PENDING">Pending</option>
          <option value="WON">Won</option>
          <option value="LOST">Lost</option>
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
        <input
          type="date"
          name="to"
          defaultValue={filters.to ? filters.to.toISOString().slice(0, 10) : ""}
          className="h-10 rounded-md border border-[var(--border)] bg-[var(--bg-secondary)] px-3 text-sm"
        />
        <button className="h-10 rounded-md bg-[var(--neon)] px-4 text-sm font-semibold text-[#04140f] md:col-span-2 lg:col-span-1">
          Apply filters
        </button>
      </form>

      <div className="mt-8 grid gap-4 md:grid-cols-2">
        {result.items.map((p) => (
          <PredictionCard key={p.id} prediction={p} />
        ))}
      </div>

      {!result.items.length ? (
        <div className="mt-8 rounded-2xl border border-dashed border-white/10 p-10 text-center text-[var(--text-muted)]">
          No published predictions match these filters.
        </div>
      ) : null}

      <div className="mt-8 flex items-center justify-between text-sm text-[var(--text-muted)]">
        <span>
          Page {result.page} of {result.pageCount} · {result.total} published
        </span>
        <div className="flex gap-3">
          {result.page > 1 ? (
            <Link
              href={`/predictions?page=${result.page - 1}`}
              className="text-[var(--neon)]"
            >
              Previous
            </Link>
          ) : null}
          {result.page < result.pageCount ? (
            <Link
              href={`/predictions?page=${result.page + 1}`}
              className="text-[var(--neon)]"
            >
              Next
            </Link>
          ) : null}
        </div>
      </div>
    </div>
  );
}
