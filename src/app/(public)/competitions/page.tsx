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
    <div className="section-shell py-12">
      <h1 className="section-title">{el.competitions.title}</h1>
      <p className="section-subtitle">{el.competitions.subtitle}</p>

      {withPublished.length ? (
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {withPublished.map((c) => (
            <Link
              key={c.id}
              href={`/competitions/${c.slug}`}
              className="surface-card group p-5 transition hover:-translate-y-0.5 hover:border-[var(--border-strong)]"
            >
              <div className="flex items-center gap-3">
                <CompetitionLogo
                  name={c.name}
                  logoUrl={c.logoUrl}
                  size={44}
                />
                <div className="min-w-0">
                  <h2 className="truncate text-lg text-[var(--text)] transition-colors group-hover:text-[var(--neon)]">
                    {c.name}
                  </h2>
                  <p className="text-xs text-[var(--text-muted)]">
                    {c.country?.name || el.competitions.international} ·{" "}
                    {c._count.predictions} {el.competitions.published}
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="surface-card mt-8 border-dashed p-10 text-center text-[var(--text-muted)]">
          {el.competitions.empty}
        </div>
      )}
    </div>
  );
}
