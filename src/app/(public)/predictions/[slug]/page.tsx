import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { format } from "date-fns";
import { el as elLocale } from "date-fns/locale";
import { StatusBadge } from "@/components/predictions/status-badge";
import { Badge } from "@/components/ui/badge";
import { CompetitionLogo, TeamLogo } from "@/components/brand/team-logo";
import { getPublishedPredictionBySlug } from "@/lib/predictions/queries";
import { plainTextToHtml, sanitizeHtml } from "@/lib/sanitize";
import { getEnv } from "@/lib/env";
import { el } from "@/lib/i18n/el";

export const dynamic = "force-dynamic";

function Section({
  title,
  body,
  show,
  unverifiedHint,
}: {
  title: string;
  body: string | null | undefined;
  show: boolean;
  unverifiedHint?: string;
}) {
  if (!show) return null;
  if (!body?.trim()) {
    return (
      <section className="surface-card border-dashed p-3.5 md:p-4">
        <h2 className="font-[family-name:var(--font-display)] text-base text-[var(--text)]">
          {title}
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-[var(--text-muted)]">
          {unverifiedHint || el.analysis.missing}
        </p>
      </section>
    );
  }
  return (
    <section className="surface-card p-3.5 md:p-4">
      <h2 className="font-[family-name:var(--font-display)] text-base text-[var(--text)]">
        {title}
      </h2>
      <div
        className="prose prose-invert mt-2.5 max-w-none text-sm leading-relaxed text-[var(--text-muted)]"
        dangerouslySetInnerHTML={{
          __html: sanitizeHtml(plainTextToHtml(body)),
        }}
      />
    </section>
  );
}

function MetaCell({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="rounded-[var(--radius)] border border-[var(--border)] bg-black/15 px-3 py-2.5">
      <dt className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--text-muted)]">
        {label}
      </dt>
      <dd className="mt-1 text-sm text-[var(--text)]">{value}</dd>
    </div>
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const prediction = await getPublishedPredictionBySlug(slug);
  if (!prediction) return { title: el.meta.predictionNotFound };
  const title = `${prediction.match.homeTeam.name} ${el.common.vs} ${prediction.match.awayTeam.name}`;
  return {
    title,
    description: `${prediction.marketLabel}: ${prediction.selection}. ${el.meta.publishedAnalysis}`,
    alternates: { canonical: `/predictions/${prediction.slug}` },
    openGraph: {
      title: `${title} · PREDIQ`,
      description: prediction.analysisOverview?.slice(0, 160) || undefined,
    },
    robots: { index: true, follow: true },
  };
}

export default async function PredictionDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const prediction = await getPublishedPredictionBySlug(slug);
  if (!prediction) notFound();

  const { match } = prediction;
  const appUrl = getEnv().APP_URL;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: prediction.title,
    datePublished: prediction.publishedAt?.toISOString(),
    dateModified: prediction.updatedAt.toISOString(),
    author: { "@type": "Organization", name: "PREDIQ" },
    mainEntityOfPage: `${appUrl}/predictions/${prediction.slug}`,
  };

  return (
    <article className="section-shell page-stack">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="flex flex-wrap items-center gap-2">
        <span className="inline-flex items-center gap-1.5 rounded-[var(--radius)] border border-[var(--border)] bg-[var(--card)] px-2.5 py-1 text-sm">
          <CompetitionLogo
            name={prediction.competition.name}
            logoUrl={prediction.competition.logoUrl}
            size={18}
          />
          {prediction.competition.name}
        </span>
        <StatusBadge status={prediction.settlementStatus} />
        <Badge tone="neon">{el.status.PUBLISHED}</Badge>
      </div>

      <h1 className="page-title mt-3 max-w-3xl">
        {match.homeTeam.name} {el.common.vs} {match.awayTeam.name}
      </h1>
      <p className="mt-1.5 text-sm text-[var(--text-muted)]">{prediction.title}</p>

      <div className="glass mt-5 rounded-[var(--radius-lg)] p-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex min-w-0 items-center gap-2.5">
            <TeamLogo
              name={match.homeTeam.name}
              logoUrl={match.homeTeam.logoUrl}
              size={40}
            />
            <span className="font-medium">{match.homeTeam.name}</span>
          </div>
          <span className="text-[10px] uppercase tracking-[0.2em] text-[var(--text-muted)]">
            VS
          </span>
          <div className="flex min-w-0 items-center gap-2.5">
            <span className="font-medium">{match.awayTeam.name}</span>
            <TeamLogo
              name={match.awayTeam.name}
              logoUrl={match.awayTeam.logoUrl}
              size={40}
            />
          </div>
        </div>
      </div>

      <dl className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        <MetaCell label={el.analysis.market} value={prediction.marketLabel} />
        <MetaCell label={el.analysis.selection} value={prediction.selection} />
        <MetaCell
          label={el.analysis.odds}
          value={
            prediction.oddsAtPublication != null
              ? Number(prediction.oddsAtPublication).toFixed(2)
              : el.predictions.oddsMissing
          }
        />
        <MetaCell
          label={el.analysis.matchDate}
          value={
            match.kickoffAt
              ? format(match.kickoffAt, "d MMMM yyyy HH:mm", { locale: elLocale })
              : el.analysis.notVerified
          }
        />
        <MetaCell
          label={el.analysis.venue}
          value={
            match.venue
              ? `${match.venue}${
                  match.venueVerified ? "" : ` (${el.analysis.unverified})`
                }`
              : el.analysis.notVerified
          }
        />
        <MetaCell
          label={el.analysis.publishedUpdated}
          value={
            <>
              {prediction.publishedAt
                ? format(prediction.publishedAt, "d MMM yyyy", { locale: elLocale })
                : "—"}
              {" · "}
              {format(prediction.updatedAt, "d MMM yyyy", { locale: elLocale })}
            </>
          }
        />
      </dl>

      <div className="mt-5 grid gap-2.5 lg:grid-cols-2">
        <Section title={el.analysis.overview} body={prediction.analysisOverview} show={prediction.showOverview} />
        <Section title={el.analysis.recentForm} body={prediction.recentForm} show={prediction.showRecentForm} />
        <Section title={el.analysis.headToHead} body={prediction.headToHead} show={prediction.showHeadToHead} />
        <Section title={el.analysis.homeAway} body={prediction.homeAwayStats} show={prediction.showHomeAwayStats} />
        <Section
          title={el.analysis.injuries}
          body={prediction.injuriesSuspensions}
          show={prediction.showInjuries}
          unverifiedHint={el.analysis.injuriesMissing}
        />
        <Section
          title={el.analysis.lineups}
          body={prediction.expectedLineups}
          show={prediction.showLineups}
          unverifiedHint={el.analysis.lineupsMissing}
        />
        <Section title={el.analysis.tactical} body={prediction.tacticalAnalysis} show={prediction.showTactical} />
        <Section
          title={el.analysis.psychological}
          body={prediction.psychologicalContext}
          show={prediction.showPsychological}
          unverifiedHint={el.analysis.psychologicalHint}
        />
        <Section title={el.analysis.statistical} body={prediction.statisticalAssessment} show={prediction.showStatistical} />
        <Section title={el.analysis.rationale} body={prediction.predictionRationale} show={prediction.showRationale} />
        <Section title={el.analysis.risks} body={prediction.counterarguments} show={prediction.showCounterarguments} />
      </div>

      {prediction.showSources ? (
        <section className="surface-card mt-5 p-3.5 md:p-4">
          <h2 className="font-[family-name:var(--font-display)] text-base">
            {el.analysis.sources}
          </h2>
          {prediction.sources.length ? (
            <ul className="mt-3 space-y-2 text-sm">
              {prediction.sources.map((s) => (
                <li
                  key={s.id}
                  className="rounded-[var(--radius)] border border-[var(--border)] bg-black/15 px-3 py-2"
                >
                  <a
                    href={s.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-medium text-[var(--neon)] hover:underline"
                  >
                    {s.title}
                  </a>
                  <span className="mt-0.5 block text-xs text-[var(--text-muted)]">
                    {el.analysis.retrieved}{" "}
                    {format(s.retrievedAt, "d MMM yyyy HH:mm", { locale: elLocale })}
                    {" · "}
                    {s.isVerified
                      ? el.analysis.verified
                      : el.analysis.unverifiedSource}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-2 text-sm text-[var(--text-muted)]">{el.analysis.noSources}</p>
          )}
        </section>
      ) : null}

      <div className="surface-card mt-5 p-3.5 md:p-4">
        <h2 className="font-[family-name:var(--font-display)] text-base">
          {el.analysis.selection}
        </h2>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <Badge tone="neon">{prediction.marketLabel}</Badge>
          <span className="rounded-[var(--radius-sm)] bg-white/[0.04] px-2.5 py-1 text-sm font-medium">
            {prediction.selection}
          </span>
          {prediction.oddsAtPublication != null ? (
            <span className="text-sm text-[var(--text-muted)]">
              @ {Number(prediction.oddsAtPublication).toFixed(2)}
            </span>
          ) : null}
          <StatusBadge status={prediction.settlementStatus} />
        </div>
      </div>
    </article>
  );
}
