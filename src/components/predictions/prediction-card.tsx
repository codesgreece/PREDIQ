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
    <article className="surface-card group min-w-0 max-w-full overflow-hidden p-3.5 transition-colors hover:border-[var(--border-strong)] md:p-4">
      <div className="mb-3 flex min-w-0 items-start justify-between gap-2">
        <div className="flex min-w-0 flex-1 items-center gap-2">
          <CompetitionLogo
            name={prediction.competition.name}
            logoUrl={prediction.competition.logoUrl}
            size={28}
          />
          <div className="min-w-0">
            <p className="truncate text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--text-muted)]">
              {prediction.competition.name}
            </p>
            <h3 className="mt-0.5 truncate font-[family-name:var(--font-display)] text-base text-[var(--text)] group-hover:text-[var(--neon)]">
              {match.homeTeam.name} {el.common.vs} {match.awayTeam.name}
            </h3>
          </div>
        </div>
        <div className="shrink-0">
          <StatusBadge status={prediction.settlementStatus} />
        </div>
      </div>

      <div className="mb-3 grid grid-cols-[1fr_auto_1fr] items-center gap-2 rounded-[var(--radius)] border border-[var(--border)] bg-black/20 px-2.5 py-2">
        <div className="flex min-w-0 items-center gap-1.5">
          <TeamLogo name={match.homeTeam.name} logoUrl={match.homeTeam.logoUrl} size={26} />
          <span className="truncate text-xs sm:text-sm">{match.homeTeam.name}</span>
        </div>
        <span className="shrink-0 text-[10px] uppercase tracking-[0.14em] text-[var(--text-muted)]">
          VS
        </span>
        <div className="flex min-w-0 items-center justify-end gap-1.5">
          <span className="truncate text-xs sm:text-sm">{match.awayTeam.name}</span>
          <TeamLogo name={match.awayTeam.name} logoUrl={match.awayTeam.logoUrl} size={26} />
        </div>
      </div>

      <div className="flex min-w-0 flex-wrap items-center gap-1.5 text-sm">
        <Badge tone="neon">{prediction.marketLabel}</Badge>
        <span className="rounded-[var(--radius-sm)] bg-white/[0.04] px-2 py-0.5 font-medium">
          {prediction.selection}
        </span>
        {prediction.oddsAtPublication != null ? (
          <span className="text-[var(--text-muted)]">
            @ {Number(prediction.oddsAtPublication).toFixed(2)}
          </span>
        ) : (
          <span className="text-xs text-[var(--text-muted)]">{el.predictions.oddsMissing}</span>
        )}
      </div>

      <div className="mt-3 flex min-w-0 items-center justify-between gap-2 border-t border-[var(--border)] pt-2.5">
        <p className="min-w-0 truncate text-xs text-[var(--text-muted)]">
          {prediction.publishedAt
            ? `${el.predictions.publishedOn} ${format(prediction.publishedAt, "d MMM yyyy", { locale: elLocale })}`
            : null}
        </p>
        <Link
          href={`/predictions/${prediction.slug}`}
          className="inline-flex shrink-0 items-center gap-1 text-sm font-medium text-[var(--neon)] hover:text-[var(--teal)]"
        >
          {el.predictions.openAnalysis}
          <ArrowUpRight size={14} />
        </Link>
      </div>
    </article>
  );
}
