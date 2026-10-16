import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Competitions",
  description: "Competitions with published PREDIQ predictions.",
  robots: { index: true, follow: true },
};

export default async function CompetitionsPage() {
  const competitions = await prisma.competition.findMany({
    include: {
      country: true,
      _count: {
        select: {
          predictions: { where: { publicationStatus: "PUBLISHED" } },
        },
      },
    },
    orderBy: { name: "asc" },
  });

  // Avoid mass low-quality index pages: only list competitions that have public predictions,
  // plus a short note that the broader catalog exists for administration.
  const withPublished = competitions.filter((c) => c._count.predictions > 0);

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 md:px-6">
      <h1 className="font-[family-name:var(--font-display)] text-4xl">
        Competitions
      </h1>
      <p className="mt-3 max-w-2xl text-[var(--text-muted)]">
        Browse competitions that have published predictions. This directory is
        not a fixtures calendar.
      </p>

      {withPublished.length ? (
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {withPublished.map((c) => (
            <Link
              key={c.id}
              href={`/competitions/${c.slug}`}
              className="rounded-xl border border-[var(--border)] bg-[var(--card)]/60 p-5 transition hover:border-[var(--neon)]/40"
            >
              <div className="flex items-center gap-3">
                {c.logoUrl ? (
                  <Image src={c.logoUrl} alt="" width={40} height={40} unoptimized />
                ) : (
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/5 text-[10px] text-[var(--text-muted)]">
                    Logo
                  </div>
                )}
                <div>
                  <h2 className="text-lg text-[var(--text)]">{c.name}</h2>
                  <p className="text-xs text-[var(--text-muted)]">
                    {c.country?.name || "International"} · {c._count.predictions}{" "}
                    published
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="mt-8 rounded-2xl border border-dashed border-white/10 p-10 text-center text-[var(--text-muted)]">
          No competitions with published predictions yet.
        </div>
      )}
    </div>
  );
}
