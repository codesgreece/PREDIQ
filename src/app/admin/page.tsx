import Link from "next/link";
import { format } from "date-fns";
import { prisma } from "@/lib/db";
import { calculatePerformance } from "@/lib/metrics/performance";

export const dynamic = "force-dynamic";

export default async function AdminOverviewPage() {
  const [
    published,
    drafts,
    pendingSettlements,
    allPublishedMetrics,
    activity,
    latestSync,
  ] = await Promise.all([
    prisma.prediction.count({ where: { publicationStatus: "PUBLISHED" } }),
    prisma.prediction.count({ where: { publicationStatus: "DRAFT" } }),
    prisma.prediction.count({
      where: {
        publicationStatus: "PUBLISHED",
        settlementStatus: "PENDING",
      },
    }),
    prisma.prediction.findMany({
      where: { publicationStatus: "PUBLISHED" },
      select: {
        settlementStatus: true,
        oddsAtPublication: true,
        stake: true,
        publicationStatus: true,
      },
    }),
    prisma.auditLog.findMany({
      orderBy: { createdAt: "desc" },
      take: 8,
      include: { actor: { select: { email: true } } },
    }),
    prisma.syncJob.findFirst({
      orderBy: { createdAt: "desc" },
      include: { provider: true },
    }),
  ]);

  const metrics = calculatePerformance(allPublishedMetrics);

  const cards = [
    { label: "Published", value: published },
    { label: "Drafts", value: drafts },
    { label: "Pending settlements", value: pendingSettlements },
    { label: "Won", value: metrics.won },
    { label: "Lost", value: metrics.lost },
    {
      label: "Hit rate",
      value: metrics.hitRate == null ? "—" : `${metrics.hitRate.toFixed(1)}%`,
    },
  ];

  return (
    <div>
      <h1 className="font-[family-name:var(--font-display)] text-3xl">
        Dashboard
      </h1>
      <p className="mt-2 text-sm text-[var(--text-muted)]">
        Live counts from the database — no placeholder metrics.
      </p>
      <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {cards.map((card) => (
          <div
            key={card.label}
            className="rounded-xl border border-[var(--border)] bg-[var(--card)]/70 p-5"
          >
            <p className="text-xs uppercase tracking-[0.16em] text-[var(--text-muted)]">
              {card.label}
            </p>
            <p className="mt-3 text-3xl text-[var(--text)]">{card.value}</p>
          </div>
        ))}
      </div>

      <div className="mt-10 grid gap-6 lg:grid-cols-2">
        <section className="rounded-xl border border-[var(--border)] p-5">
          <h2 className="text-lg">Recent administrative activity</h2>
          <ul className="mt-4 space-y-3 text-sm">
            {activity.map((item) => (
              <li key={item.id} className="border-b border-white/5 pb-3">
                <p className="text-[var(--text)]">{item.summary}</p>
                <p className="text-xs text-[var(--text-muted)]">
                  {item.actor?.email || "system"} ·{" "}
                  {format(item.createdAt, "dd MMM yyyy HH:mm")}
                </p>
              </li>
            ))}
            {!activity.length ? (
              <li className="text-[var(--text-muted)]">No activity yet.</li>
            ) : null}
          </ul>
        </section>
        <section className="rounded-xl border border-[var(--border)] p-5">
          <h2 className="text-lg">Data synchronization</h2>
          {latestSync ? (
            <div className="mt-4 text-sm text-[var(--text-muted)]">
              <p>
                Provider: {latestSync.provider.name} · Status:{" "}
                <span className="text-[var(--text)]">{latestSync.status}</span>
              </p>
              <p className="mt-2">
                Competitions upserted: {latestSync.competitionsUpserted} · Teams:{" "}
                {latestSync.teamsUpserted} · Missing logos:{" "}
                {latestSync.logosMissing}
              </p>
              <p className="mt-2">
                {format(latestSync.createdAt, "dd MMM yyyy HH:mm")}
              </p>
            </div>
          ) : (
            <p className="mt-4 text-sm text-[var(--text-muted)]">
              No sync jobs yet. Configure API_FOOTBALL_KEY and run sync from Data
              sources.
            </p>
          )}
          <Link
            href="/admin/data-sources"
            className="mt-4 inline-block text-sm text-[var(--neon)]"
          >
            Open data sources →
          </Link>
        </section>
      </div>
    </div>
  );
}
