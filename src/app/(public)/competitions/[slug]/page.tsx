import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { PredictionCard } from "@/components/predictions/prediction-card";
import { CompetitionLogo } from "@/components/brand/team-logo";
import { prisma } from "@/lib/db";
import {
  listPublishedPredictions,
  publicMetricsWhere,
} from "@/lib/predictions/queries";
import { el } from "@/lib/i18n/el";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const competition = await prisma.competition.findUnique({ where: { slug } });
  if (!competition) return { title: el.competitions.title };
  const count = await prisma.prediction.count({
    where: publicMetricsWhere({ competitionId: competition.id }),
  });
  return {
    title: competition.name,
    description: `${el.competitions.title}: ${competition.name}.`,
    robots:
      count > 0 ? { index: true, follow: true } : { index: false, follow: false },
    alternates: { canonical: `/competitions/${competition.slug}` },
  };
}

export default async function CompetitionDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const competition = await prisma.competition.findUnique({
    where: { slug },
    include: { country: true },
  });
  if (!competition) notFound();

  const listed = await listPublishedPredictions({
    competition: competition.slug,
    page: 1,
    pageSize: 24,
    sort: "published_desc",
  });

  return (
    <div className="section-shell py-12">
      <div className="flex items-center gap-4">
        <CompetitionLogo
          name={competition.name}
          logoUrl={competition.logoUrl}
          size={56}
        />
        <div>
          <h1 className="section-title">{competition.name}</h1>
          <p className="mt-2 text-[var(--text-muted)]">
            {competition.country?.name || el.competitions.international} ·{" "}
            {listed.total} {el.competitions.published}
          </p>
        </div>
      </div>

      <p className="mt-4 text-sm text-[var(--text-muted)]">
        {el.competitions.onlyPublished}
      </p>

      {listed.items.length ? (
        <div className="mt-8 grid gap-4 md:grid-cols-2">
          {listed.items.map((p) => (
            <PredictionCard key={p.id} prediction={p} />
          ))}
        </div>
      ) : (
        <div className="surface-card mt-8 border-dashed p-10 text-center text-[var(--text-muted)]">
          {el.competitions.noPredictions}
        </div>
      )}
    </div>
  );
}
