import Link from "next/link";
import type { Metadata } from "next";
import { CompetitionLogo } from "@/components/brand/team-logo";
import { prisma } from "@/lib/db";
import { publicMetricsWhere } from "@/lib/predictions/queries";
import { el } from "@/lib/i18n/el";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: el.competitions.title,
  description: el.competitions.subtitle,
  robots: { index: true, follow: true },
};

export default async function CompetitionsPage() {
  const competitions = await prisma.competition.findMany({
    include: {
      country: true,
      _count: {
        select: {
          predictions: { where: publicMetricsWhere() },
        },
      },
    },
    orderBy: { name: "asc" },
  });

  const withPublished = competitions.filter((c) => c._count.predictions > 0);

  return (
    <div className="section-shell page-stack">
      <h1 className="page-title">{el.competitions.title}</h1>
      <p className="section-subtitle">{el.competitions.subtitle}</p>

      {withPublished.length ? (
        <div className="mt-5 grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
          {withPublished.map((c) => (
            <Link
              key={c.id}
              href={`/competitions/${c.slug}`}
              className="surface-card group flex items-center gap-3 p-3.5 transition-colors hover:border-[var(--border-strong)]"
            >
              <CompetitionLogo name={c.name} logoUrl={c.logoUrl} size={36} />
              <div className="min-w-0">
                <h2 className="truncate text-base text-[var(--text)] group-hover:text-[var(--neon)]">
                  {c.name}
                </h2>
                <p className="text-xs text-[var(--text-muted)]">
                  {c.country?.name || el.competitions.international} ·{" "}
                  {c._count.predictions} {el.competitions.published}
                </p>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="empty-state mt-5">{el.competitions.empty}</div>
      )}
    </div>
  );
}
