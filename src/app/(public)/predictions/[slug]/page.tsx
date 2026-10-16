import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { format } from "date-fns";
import Image from "next/image";
import { StatusBadge } from "@/components/predictions/status-badge";
import { Badge } from "@/components/ui/badge";
import { getPublishedPredictionBySlug } from "@/lib/predictions/queries";
import { plainTextToHtml, sanitizeHtml } from "@/lib/sanitize";
import { getEnv } from "@/lib/env";

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
      <section className="rounded-xl border border-dashed border-white/10 p-5">
        <h2 className="text-lg text-[var(--text)]">{title}</h2>
        <p className="mt-2 text-sm text-[var(--text-muted)]">
          {unverifiedHint || "Information not provided or not verified."}
        </p>
      </section>
    );
  }
  return (
    <section className="rounded-xl border border-[var(--border)] bg-[var(--card)]/50 p-5">
      <h2 className="text-lg text-[var(--text)]">{title}</h2>
      <div
        className="prose prose-invert mt-3 max-w-none text-sm leading-relaxed text-[var(--text-muted)]"
        dangerouslySetInnerHTML={{
          __html: sanitizeHtml(plainTextToHtml(body)),
        }}
      />
    </section>
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const prediction = await getPublishedPredictionBySlug(slug);
  if (!prediction) return { title: "Prediction not found" };
  const title = `${prediction.match.homeTeam.name} vs ${prediction.match.awayTeam.name}`;
  return {
    title,
    description: `${prediction.marketLabel}: ${prediction.selection}. Published PREDIQ analysis.`,
    alternates: {
      canonical: `/predictions/${prediction.slug}`,
    },
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
    <article className="mx-auto max-w-4xl px-4 py-12 md:px-6">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="flex flex-wrap items-center gap-3">
        <Badge tone="neon">{prediction.competition.name}</Badge>
        <StatusBadge status={prediction.settlementStatus} />
        <Badge>Published</Badge>
      </div>
      <h1 className="mt-4 font-[family-name:var(--font-display)] text-4xl leading-tight">
        {match.homeTeam.name} vs {match.awayTeam.name}
      </h1>
      <p className="mt-3 text-[var(--text-muted)]">{prediction.title}</p>

      <div className="mt-8 flex flex-wrap items-center gap-6 rounded-2xl border border-[var(--border)] bg-[var(--card)]/60 p-6">
        <div className="flex items-center gap-3">
          {match.homeTeam.logoUrl ? (
            <Image
              src={match.homeTeam.logoUrl}
              alt=""
              width={48}
              height={48}
              unoptimized
            />
          ) : (
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/5 text-xs">
              N/A
            </div>
          )}
          <span>{match.homeTeam.name}</span>
        </div>
        <span className="text-[var(--text-muted)]">vs</span>
        <div className="flex items-center gap-3">
          {match.awayTeam.logoUrl ? (
            <Image
              src={match.awayTeam.logoUrl}
              alt=""
              width={48}
              height={48}
              unoptimized
            />
          ) : (
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/5 text-xs">
              N/A
            </div>
          )}
          <span>{match.awayTeam.name}</span>
        </div>
      </div>

      <dl className="mt-6 grid gap-4 rounded-2xl border border-[var(--border)] bg-[var(--bg-secondary)]/60 p-6 sm:grid-cols-2">
        <div>
          <dt className="text-xs uppercase tracking-[0.16em] text-[var(--text-muted)]">
            Market
          </dt>
          <dd className="mt-1">{prediction.marketLabel}</dd>
        </div>
        <div>
          <dt className="text-xs uppercase tracking-[0.16em] text-[var(--text-muted)]">
            Selection
          </dt>
          <dd className="mt-1">{prediction.selection}</dd>
        </div>
        <div>
          <dt className="text-xs uppercase tracking-[0.16em] text-[var(--text-muted)]">
            Odds at publication
          </dt>
          <dd className="mt-1">
            {prediction.oddsAtPublication != null
              ? Number(prediction.oddsAtPublication).toFixed(2)
              : "Not recorded"}
          </dd>
        </div>
        <div>
          <dt className="text-xs uppercase tracking-[0.16em] text-[var(--text-muted)]">
            Match date
          </dt>
          <dd className="mt-1">
            {match.kickoffAt
              ? format(match.kickoffAt, "dd MMM yyyy HH:mm")
              : "Not verified"}
          </dd>
        </div>
        <div>
          <dt className="text-xs uppercase tracking-[0.16em] text-[var(--text-muted)]">
            Venue
          </dt>
          <dd className="mt-1">
            {match.venue
              ? `${match.venue}${match.venueVerified ? "" : " (unverified)"}`
              : "Not verified"}
          </dd>
        </div>
        <div>
          <dt className="text-xs uppercase tracking-[0.16em] text-[var(--text-muted)]">
            Published / updated
          </dt>
          <dd className="mt-1">
            {prediction.publishedAt
              ? format(prediction.publishedAt, "dd MMM yyyy")
              : "—"}
            {" · "}
            {format(prediction.updatedAt, "dd MMM yyyy")}
          </dd>
        </div>
      </dl>

      <div className="mt-8 grid gap-4">
        <Section title="Match overview" body={prediction.analysisOverview} show={prediction.showOverview} />
        <Section title="Recent form" body={prediction.recentForm} show={prediction.showRecentForm} />
        <Section title="Head-to-head" body={prediction.headToHead} show={prediction.showHeadToHead} />
        <Section title="Home / away performance" body={prediction.homeAwayStats} show={prediction.showHomeAwayStats} />
        <Section
          title="Injuries, suspensions & availability"
          body={prediction.injuriesSuspensions}
          show={prediction.showInjuries}
          unverifiedHint="No verified availability information provided."
        />
        <Section
          title="Expected lineups"
          body={prediction.expectedLineups}
          show={prediction.showLineups}
          unverifiedHint="Lineups are shown only when supported by sources."
        />
        <Section title="Tactical analysis" body={prediction.tacticalAnalysis} show={prediction.showTactical} />
        <Section
          title="Motivation & psychological context"
          body={prediction.psychologicalContext}
          show={prediction.showPsychological}
          unverifiedHint="Psychological context is editorial interpretation, not a verified fact table."
        />
        <Section
          title="AI-assisted statistical assessment"
          body={prediction.statisticalAssessment}
          show={prediction.showStatistical}
        />
        <Section title="Reasons supporting the selection" body={prediction.predictionRationale} show={prediction.showRationale} />
        <Section title="Counterarguments & risks" body={prediction.counterarguments} show={prediction.showCounterarguments} />
      </div>

      {prediction.showSources ? (
        <section className="mt-8 rounded-xl border border-[var(--border)] p-5">
          <h2 className="text-lg">Sources</h2>
          {prediction.sources.length ? (
            <ul className="mt-3 space-y-2 text-sm">
              {prediction.sources.map((s) => (
                <li key={s.id}>
                  <a
                    href={s.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[var(--neon)] hover:underline"
                  >
                    {s.title}
                  </a>
                  <span className="text-[var(--text-muted)]">
                    {" "}
                    · retrieved {format(s.retrievedAt, "dd MMM yyyy HH:mm")}
                    {s.isVerified ? " · verified" : " · unverified"}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-2 text-sm text-[var(--text-muted)]">
              No sources attached.
            </p>
          )}
        </section>
      ) : null}

      {prediction.confidenceLevel || prediction.confidenceNote ? (
        <p className="mt-6 text-xs text-[var(--text-muted)]">
          Confidence metadata: {prediction.confidenceLevel || "n/a"}
          {prediction.confidenceNote ? ` — ${prediction.confidenceNote}` : ""}
        </p>
      ) : null}
    </article>
  );
}
