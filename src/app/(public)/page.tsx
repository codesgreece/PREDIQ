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
        <div className="hero-grid pointer-events-none absolute inset-0 opacity-70" />
        <div className="section-shell relative grid items-center gap-6 py-8 md:py-10 lg:grid-cols-[1.15fr_0.85fr] lg:gap-8">
          <div className="animate-rise">
            <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.22em] text-[var(--neon)]">
              {el.hero.eyebrow}
            </p>
            <h1 className="hero-title max-w-xl">{el.hero.title}</h1>
            <p className="mt-3 max-w-md text-sm leading-relaxed text-[var(--text-muted)] md:text-[0.9375rem]">
              {el.hero.subtitle}
            </p>
            <div className="mt-5 flex flex-wrap gap-2.5">
              <Link href="/predictions" className="btn-primary">
                {el.hero.cta}
              </Link>
              <Link href="/performance" className="btn-secondary">
                {el.hero.ctaSecondary}
              </Link>
            </div>
          </div>

          <div className="animate-rise-delay relative hidden min-h-[220px] lg:block">
            <div className="field-pitch absolute inset-0 rounded-[var(--radius-lg)] border border-[var(--border)]" />
            <div className="absolute inset-5 rounded-[var(--radius)] border border-white/5 bg-[url('data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%22400%22 height=%22400%22 viewBox=%220 0 400 400%22><circle cx=%22200%22 cy=%22200%22 r=%22120%22 fill=%22none%22 stroke=%22%2320E890%22 stroke-opacity=%220.2%22 stroke-width=%222%22/><path d=%22M80 200h240M200 80v240%22 stroke=%22%2300CBA8%22 stroke-opacity=%220.16%22 stroke-width=%221.5%22/></svg>')] bg-cover" />
            <div className="absolute bottom-5 left-5 right-5">
              <div className="animate-pulse-line h-px w-full bg-gradient-to-r from-transparent via-[var(--neon)] to-transparent" />
              <p className="mt-2 text-xs text-[var(--text-muted)]">
                {el.hero.visualCaption}
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="section-shell section-y pt-2">
        <div className="mb-3">
          <h2 className="section-title">{el.featured.title}</h2>
          <p className="section-subtitle">{el.featured.subtitle}</p>
        </div>
        {featured ? (
          <div className="glass rounded-[var(--radius-lg)] p-4 md:p-5">
            <div className="flex flex-wrap items-center gap-2">
              <Badge tone="neon">{el.featured.editorial}</Badge>
              <StatusBadge status={featured.settlementStatus} />
              <span className="inline-flex items-center gap-1.5 text-sm text-[var(--text-muted)]">
                <CompetitionLogo
                  name={featured.competition.name}
                  logoUrl={featured.competition.logoUrl}
                  size={18}
                />
                {featured.competition.name}
              </span>
            </div>
            <div className="mt-4 flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-2">
                <TeamLogo
                  name={featured.match.homeTeam.name}
                  logoUrl={featured.match.homeTeam.logoUrl}
                  size={36}
                />
                <span className="font-medium">{featured.match.homeTeam.name}</span>
              </div>
              <span className="text-[10px] uppercase tracking-[0.18em] text-[var(--text-muted)]">
                VS
              </span>
              <div className="flex items-center gap-2">
                <TeamLogo
                  name={featured.match.awayTeam.name}
                  logoUrl={featured.match.awayTeam.logoUrl}
                  size={36}
                />
                <span className="font-medium">{featured.match.awayTeam.name}</span>
              </div>
            </div>
            <p className="mt-3 text-sm text-[var(--text-muted)]">
              {featured.marketLabel}:{" "}
              <span className="text-[var(--text)]">{featured.selection}</span>
              {featured.oddsAtPublication != null
                ? ` @ ${Number(featured.oddsAtPublication).toFixed(2)}`
                : ` · ${el.predictions.oddsMissing}`}
            </p>
            {featured.publishedAt ? (
              <p className="mt-1 text-xs text-[var(--text-muted)]">
                {el.predictions.publishedOn}{" "}
                {format(featured.publishedAt, "d MMMM yyyy", { locale: elLocale })}
              </p>
            ) : null}
            <Link
              href={`/predictions/${featured.slug}`}
              className="mt-3 inline-flex text-sm font-medium text-[var(--neon)] hover:underline"
            >
              {el.featured.open} →
            </Link>
          </div>
        ) : (
          <div className="empty-state">{el.featured.empty}</div>
        )}
      </section>

      <section className="section-shell section-y pt-2">
        <div className="mb-3 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="section-title">{el.predictions.title}</h2>
            <p className="section-subtitle">{el.predictions.subtitle}</p>
          </div>
          <Link href="/predictions" className="text-sm font-medium text-[var(--neon)]">
            {el.predictions.viewAll}
          </Link>
        </div>

        <form action="/predictions" className="filter-bar mb-4 md:grid-cols-4">
          <select name="sport" className="control" defaultValue="">
            <option value="">{el.predictions.allSports}</option>
            {sports.map((s) => (
              <option key={s.id} value={s.slug}>
                {s.name}
              </option>
            ))}
          </select>
          <select name="competition" className="control" defaultValue="">
            <option value="">{el.predictions.allCompetitions}</option>
            {competitions.map((c) => (
              <option key={c.id} value={c.slug}>
                {c.name}
              </option>
            ))}
          </select>
          <select name="market" className="control" defaultValue="">
            <option value="">{el.predictions.allMarkets}</option>
            <option value="MATCH_RESULT_1X2">{el.markets.MATCH_RESULT_1X2}</option>
            <option value="DOUBLE_CHANCE">{el.markets.DOUBLE_CHANCE}</option>
            <option value="OVER_UNDER">{el.markets.OVER_UNDER}</option>
            <option value="BOTH_TEAMS_TO_SCORE">{el.markets.BOTH_TEAMS_TO_SCORE}</option>
            <option value="DRAW_NO_BET">{el.markets.DRAW_NO_BET}</option>
          </select>
          <select name="status" className="control" defaultValue="">
            <option value="">{el.predictions.allStatuses}</option>
            <option value="PENDING">{el.status.PENDING}</option>
            <option value="WON">{el.status.WON}</option>
            <option value="LOST">{el.status.LOST}</option>
            <option value="VOID">{el.status.VOID}</option>
          </select>
          <button className="btn-primary md:col-span-4 lg:col-span-1 lg:col-start-4">
            {el.predictions.apply}
          </button>
        </form>

        {listed.items.length ? (
          <div className="grid min-w-0 gap-3 md:grid-cols-2">
            {listed.items.map((p) => (
              <PredictionCard key={p.id} prediction={p} />
            ))}
          </div>
        ) : (
          <div className="empty-state">{el.predictions.empty}</div>
        )}
      </section>

      <section className="section-shell section-y">
        <PerformanceOverview metrics={metrics} />
      </section>

      <section className="section-shell pb-10">
        <h2 className="section-title">{el.analysis.latest}</h2>
        <p className="section-subtitle mb-3">{el.analysis.latestSubtitle}</p>
        {latestAnalysis.length ? (
          <div className="grid gap-2.5">
            {latestAnalysis.map((item) => (
              <Link
                key={item.id}
                href={`/predictions/${item.slug}`}
                className="surface-card p-3.5 transition-colors hover:border-[var(--border-strong)]"
              >
                <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--text-muted)]">
                  {item.competition.name}
                </p>
                <h3 className="mt-1 text-base text-[var(--text)]">
                  {item.match.homeTeam.name} {el.common.vs} {item.match.awayTeam.name}
                </h3>
                <div
                  className="mt-2 line-clamp-2 text-sm leading-relaxed text-[var(--text-muted)]"
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
          <div className="empty-state">{el.analysis.empty}</div>
        )}
      </section>
    </div>
  );
}
