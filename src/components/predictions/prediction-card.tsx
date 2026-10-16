import Image from "next/image";
import Link from "next/link";
import { format } from "date-fns";
import { StatusBadge } from "@/components/predictions/status-badge";
import { Badge } from "@/components/ui/badge";
import type { publicInclude } from "@/lib/predictions/service";
import type { Prisma } from "@prisma/client";

type PredictionCardData = Prisma.PredictionGetPayload<{
  include: typeof publicInclude;
}>;

function TeamMark({
  name,
  logoUrl,
}: {
  name: string;
  logoUrl: string | null;
}) {
  if (logoUrl) {
    return (
      <Image
        src={logoUrl}
        alt={`${name} logo`}
        width={40}
        height={40}
        className="h-10 w-10 object-contain"
        unoptimized
      />
    );
  }
  return (
    <div
      className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 text-xs font-semibold text-[var(--text-muted)]"
      title="Logo not available"
    >
      {name.slice(0, 2).toUpperCase()}
    </div>
  );
}

export function PredictionCard({ prediction }: { prediction: PredictionCardData }) {
  const { match } = prediction;
  return (
    <Link
      href={`/predictions/${prediction.slug}`}
      className="group block rounded-xl border border-[var(--border)] bg-[var(--card)]/80 p-5 backdrop-blur transition-all duration-300 hover:-translate-y-0.5 hover:border-[var(--neon)]/40"
    >
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-[var(--text-muted)]">
            {prediction.competition.name}
            {prediction.competition.country
              ? ` · ${prediction.competition.country.name}`
              : ""}
          </p>
          <h3 className="mt-2 font-[family-name:var(--font-display)] text-lg text-[var(--text)] transition-colors group-hover:text-[var(--neon)]">
            {match.homeTeam.name} vs {match.awayTeam.name}
          </h3>
        </div>
        <StatusBadge status={prediction.settlementStatus} />
      </div>

      <div className="mb-4 flex items-center gap-4">
        <TeamMark name={match.homeTeam.name} logoUrl={match.homeTeam.logoUrl} />
        <span className="text-sm text-[var(--text-muted)]">vs</span>
        <TeamMark name={match.awayTeam.name} logoUrl={match.awayTeam.logoUrl} />
      </div>

      <div className="flex flex-wrap items-center gap-2 text-sm">
        <Badge tone="neon">{prediction.marketLabel}</Badge>
        <span className="text-[var(--text)]">{prediction.selection}</span>
        {prediction.oddsAtPublication != null ? (
          <span className="text-[var(--text-muted)]">
            @ {Number(prediction.oddsAtPublication).toFixed(2)}
          </span>
        ) : (
          <span className="text-[var(--text-muted)]">Odds not recorded</span>
        )}
      </div>

      {prediction.publishedAt ? (
        <p className="mt-4 text-xs text-[var(--text-muted)]">
          Published {format(prediction.publishedAt, "dd MMM yyyy")}
        </p>
      ) : null}
    </Link>
  );
}
