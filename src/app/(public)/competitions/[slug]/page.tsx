import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Image from "next/image";
import { PredictionCard } from "@/components/predictions/prediction-card";
import { prisma } from "@/lib/db";
import { listPublishedPredictions } from "@/lib/predictions/queries";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const competition = await prisma.competition.findUnique({ where: { slug } });
  if (!competition) return { title: "Competition" };
  const count = await prisma.prediction.count({
    where: { competitionId: competition.id, publicationStatus: "PUBLISHED" },
  });
  return {
    title: competition.name,
    description: `Published PREDIQ predictions for ${competition.name}.`,
    robots: count > 0 ? { index: true, follow: true } : { index: false, follow: false },
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
    <div className="mx-auto max-w-6xl px-4 py-12 md:px-6">
      <div className="flex items-center gap-4">
        {competition.logoUrl ? (
          <Image
            src={competition.logoUrl}
            alt=""
            width={56}
            height={56}
            unoptimized
          />
        ) : null}
        <div>
          <h1 className="font-[family-name:var(--font-display)] text-4xl">
            {competition.name}
          </h1>
          <p className="mt-2 text-[var(--text-muted)]">
            {competition.country?.name || "International"} ·{" "}
            {listed.total} published prediction{listed.total === 1 ? "" : "s"}
          </p>
        </div>
      </div>

      <p className="mt-4 text-sm text-[var(--text-muted)]">
        This page lists published prediction records only — not upcoming fixtures.
      </p>

      {listed.items.length ? (
        <div className="mt-8 grid gap-4 md:grid-cols-2">
          {listed.items.map((p) => (
            <PredictionCard key={p.id} prediction={p} />
          ))}
        </div>
      ) : (
        <div className="mt-8 rounded-2xl border border-dashed border-white/10 p-10 text-center text-[var(--text-muted)]">
          No published predictions for this competition yet.
        </div>
      )}
    </div>
  );
}
