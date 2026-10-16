import Link from "next/link";
import { PredictionCard } from "@/components/predictions/prediction-card";
import { StatusBadge } from "@/components/predictions/status-badge";
import { PerformanceOverview } from "@/components/metrics/performance-overview";
import { Badge } from "@/components/ui/badge";
import { prisma } from "@/lib/db";
import { calculatePerformance } from "@/lib/metrics/performance";
import {
  getFeaturedPrediction,
  listPublishedPredictions,
} from "@/lib/predictions/queries";
import { format } from "date-fns";
import { sanitizeHtml, plainTextToHtml } from "@/lib/sanitize";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [featured, listed, allPublished, latestAnalysis] = await Promise.all([
    getFeaturedPrediction(),
    listPublishedPredictions({ page: 1, pageSize: 6, sort: "published_desc" }),
    prisma.prediction.findMany({
      where: { publicationStatus: "PUBLISHED" },
      select: {
        settlementStatus: true,
        oddsAtPublication: true,
        stake: true,
        publicationStatus: true,
      },
    }),
    prisma.prediction.findMany({
      where: {
        publicationStatus: "PUBLISHED",
        analysisOverview: { not: null },
      },
      include: {
        match: { include: { homeTeam: true, awayTeam: true } },
        competition: true,
      },
      orderBy: { publishedAt: "desc" },
      take: 3,
    }),
  ]);

  const metrics = calculatePerformance(allPublished);

  return (
    <div>
      <section className="relative overflow-hidden">
        <div className="hero-grid pointer-events-none absolute inset-0 opacity-70" />
        <div className="pointer-events-none absolute inset-y-0 right-0 w-1/2 bg-[radial-gradient(circle_at_70%_40%,rgba(32,232,144,0.16),transparent_55%)]" />
        <div className="relative mx-auto grid min-h-[78vh] max-w-6xl items-center gap-10 px-4 py-16 md:px-6 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="animate-rise">
            <p className="mb-4 text-xs uppercase tracking-[0.28em] text-[var(--neon)]">
              PREDIQ · AI SPORTS PREDICTIONS
            </p>
            <h1 className="max-w-xl font-[family-name:var(--font-display)] text-5xl leading-[1.05] text-[var(--text)] md:text-6xl">
              Προγνωστικά με Αξία.
            </h1>
            <p className="mt-5 max-w-lg text-base leading-relaxed text-[var(--text-muted)] md:text-lg">
              Evidence-based sports analysis with AI-assisted research. Every
              selection is manually reviewed and explicitly published — never an
              automatic tip feed.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/predictions"
                className="inline-flex h-12 items-center rounded-md bg-[var(--neon)] px-6 text-sm font-semibold text-[#04140f] transition hover:bg-[var(--teal)]"
              >
                Δες τα προγνωστικά
              </Link>
              <Link
                href="/performance"
                className="inline-flex h-12 items-center rounded-md border border-white/10 px-6 text-sm text-[var(--text)] transition hover:border-[var(--neon)]/40"
              >
                Performance history
              </Link>
            </div>
          </div>
          <div className="animate-rise-delay relative hidden min-h-[360px] lg:block">
            <div className="absolute inset-0 rounded-[2rem] border border-[var(--neon)]/20 bg-[linear-gradient(160deg,rgba(18,29,25,0.95),rgba(8,13,12,0.85))] shadow-[0_0_80px_rgba(32,232,144,0.08)]" />
            <div className="absolute inset-6 rounded-[1.5rem] border border-white/5 bg-[url('data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%22400%22 height=%22400%22 viewBox=%220 0 400 400%22><circle cx=%22200%22 cy=%22200%22 r=%22140%22 fill=%22none%22 stroke=%22%2320E890%22 stroke-opacity=%220.25%22 stroke-width=%222%22/><path d=%22M60 200h280M200 60v280%22 stroke=%22%2300CBA8%22 stroke-opacity=%220.2%22 stroke-width=%221.5%22/><circle cx=%22200%22 cy=%22200%22 r=%2240%22 fill=%22none%22 stroke=%22%2320E890%22 stroke-opacity=%220.35%22/></svg>')] bg-cover" />
            <div className="absolute bottom-10 left-10 right-10">
              <div className="animate-pulse-line h-px w-full bg-gradient-to-r from-transparent via-[var(--neon)] to-transparent" />
              <p className="mt-4 text-sm text-[var(--text-muted)]">
                Premium football analytics surface — published predictions only.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16 md:px-6">
        <div className="mb-6 flex items-end justify-between gap-4">
          <div>
            <h2 className="font-[family-name:var(--font-display)] text-3xl text-[var(--text)]">
              Featured prediction
            </h2>
            <p className="mt-2 text-sm text-[var(--text-muted)]">
              An editorial selection — not a guaranteed outcome.
            </p>
          </div>
        </div>
        {featured ? (
          <div className="glass rounded-2xl p-6 md:p-8">
            <div className="flex flex-wrap items-center gap-3">
              <Badge tone="neon">Editorial pick</Badge>
              <StatusBadge status={featured.settlementStatus} />
              <span className="text-sm text-[var(--text-muted)]">
                {featured.competition.name}
              </span>
            </div>
            <h3 className="mt-4 font-[family-name:var(--font-display)] text-3xl">
              {featured.match.homeTeam.name} vs {featured.match.awayTeam.name}
            </h3>
            <p className="mt-3 text-[var(--text-muted)]">
              {featured.marketLabel}: <span className="text-[var(--text)]">{featured.selection}</span>
              {featured.oddsAtPublication != null
                ? ` @ ${Number(featured.oddsAtPublication).toFixed(2)}`
                : " · odds not recorded"}
            </p>
            {featured.publishedAt ? (
              <p className="mt-2 text-xs text-[var(--text-muted)]">
                Published {format(featured.publishedAt, "dd MMM yyyy")}
              </p>
            ) : null}
            <Link
              href={`/predictions/${featured.slug}`}
              className="mt-6 inline-flex text-sm text-[var(--neon)] hover:underline"
            >
              Open full analysis →
            </Link>
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-white/10 p-10 text-center">
            <p className="text-[var(--text-muted)]">
              No featured published prediction yet.
            </p>
          </div>
        )}
      </section>

      <section className="mx-auto max-w-6xl px-4 py-8 md:px-6">
        <div className="mb-6 flex items-end justify-between">
          <div>
            <h2 className="font-[family-name:var(--font-display)] text-3xl">
              Published predictions
            </h2>
            <p className="mt-2 text-sm text-[var(--text-muted)]">
              Only administrator-approved selections appear here.
            </p>
          </div>
          <Link href="/predictions" className="text-sm text-[var(--neon)]">
            View all
          </Link>
        </div>
        {listed.items.length ? (
          <div className="grid gap-4 md:grid-cols-2">
            {listed.items.map((p) => (
              <PredictionCard key={p.id} prediction={p} />
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-white/10 p-10 text-center text-[var(--text-muted)]">
            No published predictions yet.
          </div>
        )}
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16 md:px-6">
        <PerformanceOverview metrics={metrics} />
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-20 md:px-6">
        <h2 className="font-[family-name:var(--font-display)] text-3xl">
          Latest analysis
        </h2>
        <p className="mt-2 mb-6 text-sm text-[var(--text-muted)]">
          Published analysis connected to predictions — not a general sports news feed.
        </p>
        {latestAnalysis.length ? (
          <div className="grid gap-4">
            {latestAnalysis.map((item) => (
              <Link
                key={item.id}
                href={`/predictions/${item.slug}`}
                className="rounded-xl border border-[var(--border)] bg-[var(--card)]/60 p-5 transition hover:border-[var(--neon)]/35"
              >
                <p className="text-xs uppercase tracking-[0.16em] text-[var(--text-muted)]">
                  {item.competition.name}
                </p>
                <h3 className="mt-2 text-xl text-[var(--text)]">
                  {item.match.homeTeam.name} vs {item.match.awayTeam.name}
                </h3>
                <div
                  className="prose-invert mt-3 line-clamp-3 text-sm text-[var(--text-muted)]"
                  dangerouslySetInnerHTML={{
                    __html: sanitizeHtml(
                      plainTextToHtml(item.analysisOverview || ""),
                    ),
                  }}
                />
              </Link>
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-white/10 p-8 text-center text-[var(--text-muted)]">
            No published analyses yet.
          </div>
        )}
      </section>
    </div>
  );
}
