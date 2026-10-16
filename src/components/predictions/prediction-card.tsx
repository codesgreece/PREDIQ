import Link from "next/link";
import { format } from "date-fns";
import { el as elLocale } from "date-fns/locale";
import { ArrowUpRight } from "lucide-react";
import { StatusBadge } from "@/components/predictions/status-badge";
import { Badge } from "@/components/ui/badge";
import { CompetitionLogo, TeamLogo } from "@/components/brand/team-logo";
import type { publicInclude } from "@/lib/predictions/service";
import type { Prisma } from "@prisma/client";
import { el } from "@/lib/i18n/el";

type PredictionCardData = Prisma.PredictionGetPayload<{
  include: typeof publicInclude;
}>;

export function PredictionCard({ prediction }: { prediction: PredictionCardData }) {
  const { match } = prediction;

  return (
    <article className="surface-card group relative overflow-hidden p-5 transition-all duration-300 hover:-translate-y-0.5 hover:border-[var(--border-strong)] md:p-6">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[var(--neon)]/50 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />

      <div className="mb-5 flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <CompetitionLogo
            name={prediction.competition.name}
            logoUrl={prediction.competition.logoUrl}
            size={36}
          />
          <div className="min-w-0">
            <p className="truncate text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--text-muted)]">
              {prediction.competition.name}
              {prediction.competition.country
                ? ` · ${prediction.competition.country.name}`
                : ""}
            </p>
            <h3 className="mt-1 truncate font-[family-name:var(--font-display)] text-lg text-[var(--text)] transition-colors group-hover:text-[var(--neon)] md:text-xl">
              {match.homeTeam.name} {el.common.vs} {match.awayTeam.name}
            </h3>
          </div>
        </div>
        <StatusBadge status={prediction.settlementStatus} />
      </div>

      <div className="mb-5 flex items-center justify-between gap-4 rounded-xl border border-white/5 bg-black/20 px-4 py-3">
        <div className="flex items-center gap-3">
          <TeamLogo name={match.homeTeam.name} logoUrl={match.homeTeam.logoUrl} size={42} />
          <span className="text-sm font-medium">{match.homeTeam.name}</span>
        </div>
        <span className="text-xs uppercase tracking-[0.18em] text-[var(--text-muted)]">
          VS
        </span>
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium">{match.awayTeam.name}</span>
          <TeamLogo name={match.awayTeam.name} logoUrl={match.awayTeam.logoUrl} size={42} />
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2 text-sm">
        <Badge tone="neon">{prediction.marketLabel}</Badge>
        <span className="rounded-md bg-white/5 px-2.5 py-1 font-medium text-[var(--text)]">
          {prediction.selection}
        </span>
        {prediction.oddsAtPublication != null ? (
          <span className="text-[var(--text-muted)]">
            @ {Number(prediction.oddsAtPublication).toFixed(2)}
          </span>
        ) : (
          <span className="text-[var(--text-muted)]">{el.predictions.oddsMissing}</span>
        )}
      </div>

      <div className="mt-5 flex items-center justify-between gap-3 border-t border-white/5 pt-4">
        <p className="text-xs text-[var(--text-muted)]">
          {prediction.publishedAt
            ? `${el.predictions.publishedOn} ${format(prediction.publishedAt, "d MMM yyyy", { locale: elLocale })}`
            : null}
        </p>
        <Link
          href={`/predictions/${prediction.slug}`}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-[var(--neon)] transition-colors hover:text-[var(--teal)]"
        >
          {el.predictions.openAnalysis}
          <ArrowUpRight size={16} />
        </Link>
      </div>
    </article>
  );
}
