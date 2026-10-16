import Link from "next/link";
import { format } from "date-fns";
import { el as elLocale } from "date-fns/locale";
import { PredictionCard } from "@/components/predictions/prediction-card";
import { StatusBadge } from "@/components/predictions/status-badge";
import { PerformanceOverview } from "@/components/metrics/performance-overview";
import { Badge } from "@/components/ui/badge";
import { CompetitionLogo, TeamLogo } from "@/components/brand/team-logo";
import { prisma } from "@/lib/db";
import { calculatePerformance } from "@/lib/metrics/performance";
import {
  getFeaturedPrediction,
  listPublishedPredictions,
  publicMetricsWhere,
} from "@/lib/predictions/queries";
import { sanitizeHtml, plainTextToHtml } from "@/lib/sanitize";
import { el } from "@/lib/i18n/el";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [featured, listed, allPublished, latestAnalysis, sports, competitions] =
    await Promise.all([
      getFeaturedPrediction(),
      listPublishedPredictions({ page: 1, pageSize: 6, sort: "published_desc" }),
      prisma.prediction.findMany({
        where: publicMetricsWhere(),
        select: {
          settlementStatus: true,
          oddsAtPublication: true,
          stake: true,
          publicationStatus: true,
        },
      }),
      prisma.prediction.findMany({
        where: {
          ...publicMetricsWhere(),
          analysisOverview: { not: null },
        },
        include: {
          match: { include: { homeTeam: true, awayTeam: true } },
          competition: true,
        },
        orderBy: { publishedAt: "desc" },
        take: 3,
      }),
      prisma.sport.findMany({ orderBy: { name: "asc" } }),
      prisma.competition.findMany({
        where: {
          predictions: { some: publicMetricsWhere() },
        },
        orderBy: { name: "asc" },
        take: 40,
      }),
    ]);

  const metrics = calculatePerformance(allPublished);

  return (
    <div>
      <section className="relative overflow-hidden">
        <div className="hero-grid pointer-events-none absolute inset-0 opacity-80" />
        <div className="pointer-events-none absolute inset-y-0 right-0 w-1/2 bg-[radial-gradient(circle_at_70%_40%,rgba(32,232,144,0.16),transparent_55%)]" />
        <div className="section-shell relative grid min-h-[78vh] items-center gap-10 py-14 lg:grid-cols-[1.1fr_0.9fr] lg:py-16">
          <div className="animate-rise">
            <p className="mb-4 text-xs font-semibold uppercase tracking-[0.28em] text-[var(--neon)]">
              {el.hero.eyebrow}
            </p>
            <h1 className="max-w-xl font-[family-name:var(--font-display)] text-5xl leading-[1.05] tracking-tight text-[var(--text)] md:text-6xl">
              {el.hero.title}
            </h1>
            <p className="mt-5 max-w-lg text-base leading-relaxed text-[var(--text-muted)] md:text-lg">
              {el.hero.subtitle}
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/predictions"
                className="inline-flex h-12 items-center rounded-xl bg-[var(--neon)] px-6 text-sm font-semibold text-[#04140f] transition hover:bg-[var(--teal)]"
              >
                {el.hero.cta}
              </Link>
              <Link
                href="/performance"
                className="inline-flex h-12 items-center rounded-xl border border-white/10 px-6 text-sm text-[var(--text)] transition hover:border-[var(--neon)]/40"
              >
                {el.hero.ctaSecondary}
              </Link>
            </div>
          </div>

          <div className="animate-rise-delay relative hidden min-h-[380px] lg:block">
            <div className="field-pitch absolute inset-0 animate-glow-soft rounded-[2rem] border border-[var(--neon)]/20" />
            <div className="absolute inset-8 rounded-[1.5rem] border border-white/5 bg-[url('data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%22400%22 height=%22400%22 viewBox=%220 0 400 400%22><circle cx=%22200%22 cy=%22200%22 r=%22140%22 fill=%22none%22 stroke=%22%2320E890%22 stroke-opacity=%220.22%22 stroke-width=%222%22/><path d=%22M60 200h280M200 60v280%22 stroke=%22%2300CBA8%22 stroke-opacity=%220.18%22 stroke-width=%221.5%22/><circle cx=%22200%22 cy=%22200%22 r=%2240%22 fill=%22none%22 stroke=%22%2320E890%22 stroke-opacity=%220.3%22/></svg>')] bg-cover opacity-90" />
            <div className="absolute bottom-10 left-10 right-10">
              <div className="animate-pulse-line h-px w-full bg-gradient-to-r from-transparent via-[var(--neon)] to-transparent" />
              <p className="mt-4 text-sm text-[var(--text-muted)]">
                {el.hero.visualCaption}
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="section-shell py-14">
        <div className="mb-6">
          <h2 className="section-title">{el.featured.title}</h2>
          <p className="section-subtitle">{el.featured.subtitle}</p>
        </div>
        {featured ? (
          <div className="glass rounded-3xl p-6 md:p-8">
            <div className="flex flex-wrap items-center gap-3">
              <Badge tone="neon">{el.featured.editorial}</Badge>
              <StatusBadge status={featured.settlementStatus} />
              <span className="inline-flex items-center gap-2 text-sm text-[var(--text-muted)]">
                <CompetitionLogo
                  name={featured.competition.name}
                  logoUrl={featured.competition.logoUrl}
                  size={22}
                />
                {featured.competition.name}
              </span>
            </div>
            <div className="mt-6 flex flex-wrap items-center gap-6">
              <div className="flex items-center gap-3">
                <TeamLogo
                  name={featured.match.homeTeam.name}
                  logoUrl={featured.match.homeTeam.logoUrl}
                  size={52}
                />
                <span className="text-lg font-medium">
                  {featured.match.homeTeam.name}
                </span>
              </div>
              <span className="text-xs uppercase tracking-[0.2em] text-[var(--text-muted)]">
                VS
              </span>
              <div className="flex items-center gap-3">
                <TeamLogo
                  name={featured.match.awayTeam.name}
                  logoUrl={featured.match.awayTeam.logoUrl}
                  size={52}
                />
                <span className="text-lg font-medium">
                  {featured.match.awayTeam.name}
                </span>
              </div>
            </div>
            <h3 className="mt-5 font-[family-name:var(--font-display)] text-3xl">
              {featured.match.homeTeam.name} {el.common.vs}{" "}
              {featured.match.awayTeam.name}
            </h3>
            <p className="mt-3 text-[var(--text-muted)]">
              {featured.marketLabel}:{" "}
              <span className="text-[var(--text)]">{featured.selection}</span>
              {featured.oddsAtPublication != null
                ? ` @ ${Number(featured.oddsAtPublication).toFixed(2)}`
                : ` · ${el.predictions.oddsMissing}`}
            </p>
            {featured.publishedAt ? (
              <p className="mt-2 text-xs text-[var(--text-muted)]">
                {el.predictions.publishedOn}{" "}
                {format(featured.publishedAt, "d MMMM yyyy", { locale: elLocale })}
              </p>
            ) : null}
            <Link
              href={`/predictions/${featured.slug}`}
              className="mt-6 inline-flex text-sm font-medium text-[var(--neon)] hover:underline"
            >
              {el.featured.open} →
            </Link>
          </div>
        ) : (
          <div className="surface-card border-dashed p-10 text-center text-[var(--text-muted)]">
            {el.featured.empty}
          </div>
        )}
      </section>

      <section className="section-shell py-8">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="section-title">{el.predictions.title}</h2>
            <p className="section-subtitle">{el.predictions.subtitle}</p>
          </div>
          <Link href="/predictions" className="text-sm font-medium text-[var(--neon)]">
            {el.predictions.viewAll}
          </Link>
        </div>

        <form
          action="/predictions"
          className="mb-6 grid gap-3 rounded-2xl border border-[var(--border)] bg-[var(--card)]/60 p-4 md:grid-cols-4"
        >
          <select
            name="sport"
            className="h-11 rounded-xl border border-[var(--border)] bg-[var(--bg-secondary)] px-3 text-sm"
            defaultValue=""
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
            className="h-11 rounded-xl border border-[var(--border)] bg-[var(--bg-secondary)] px-3 text-sm"
            defaultValue=""
          >
            <option value="">{el.predictions.allCompetitions}</option>
            {competitions.map((c) => (
              <option key={c.id} value={c.slug}>
                {c.name}
              </option>
            ))}
          </select>
          <select
            name="market"
            className="h-11 rounded-xl border border-[var(--border)] bg-[var(--bg-secondary)] px-3 text-sm"
            defaultValue=""
          >
            <option value="">{el.predictions.allMarkets}</option>
            <option value="MATCH_RESULT_1X2">{el.markets.MATCH_RESULT_1X2}</option>
            <option value="DOUBLE_CHANCE">{el.markets.DOUBLE_CHANCE}</option>
            <option value="OVER_UNDER">{el.markets.OVER_UNDER}</option>
            <option value="BOTH_TEAMS_TO_SCORE">{el.markets.BOTH_TEAMS_TO_SCORE}</option>
            <option value="DRAW_NO_BET">{el.markets.DRAW_NO_BET}</option>
          </select>
          <select
            name="status"
            className="h-11 rounded-xl border border-[var(--border)] bg-[var(--bg-secondary)] px-3 text-sm"
            defaultValue=""
          >
            <option value="">{el.predictions.allStatuses}</option>
            <option value="PENDING">{el.status.PENDING}</option>
            <option value="WON">{el.status.WON}</option>
            <option value="LOST">{el.status.LOST}</option>
            <option value="VOID">{el.status.VOID}</option>
          </select>
          <button className="h-11 rounded-xl bg-[var(--neon)] text-sm font-semibold text-[#04140f] md:col-span-4 lg:col-span-1 lg:col-start-4">
            {el.predictions.apply}
          </button>
        </form>

        {listed.items.length ? (
          <div className="grid gap-4 md:grid-cols-2">
            {listed.items.map((p) => (
              <PredictionCard key={p.id} prediction={p} />
            ))}
          </div>
        ) : (
          <div className="surface-card border-dashed p-10 text-center text-[var(--text-muted)]">
            {el.predictions.empty}
          </div>
        )}
      </section>

      <section className="section-shell py-14">
        <PerformanceOverview metrics={metrics} />
      </section>

      <section className="section-shell pb-20">
        <h2 className="section-title">{el.analysis.latest}</h2>
        <p className="section-subtitle mb-6">{el.analysis.latestSubtitle}</p>
        {latestAnalysis.length ? (
          <div className="grid gap-4">
            {latestAnalysis.map((item) => (
              <Link
                key={item.id}
                href={`/predictions/${item.slug}`}
                className="surface-card p-5 transition hover:border-[var(--border-strong)]"
              >
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--text-muted)]">
                  {item.competition.name}
                </p>
                <h3 className="mt-2 text-xl text-[var(--text)]">
                  {item.match.homeTeam.name} {el.common.vs} {item.match.awayTeam.name}
                </h3>
                <div
                  className="mt-3 line-clamp-3 text-sm leading-relaxed text-[var(--text-muted)]"
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
          <div className="surface-card border-dashed p-8 text-center text-[var(--text-muted)]">
            {el.analysis.empty}
          </div>
        )}
      </section>
    </div>
  );
}
