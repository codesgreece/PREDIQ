import Link from "next/link";
import { format } from "date-fns";
import { el as elLocale } from "date-fns/locale";
import { prisma } from "@/lib/db";
import { calculatePerformance } from "@/lib/metrics/performance";
import { el } from "@/lib/i18n/el";

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
    { label: el.admin.published, value: published },
    { label: el.admin.drafts, value: drafts },
    { label: el.admin.pendingSettlements, value: pendingSettlements },
    { label: el.performance.won, value: metrics.won },
    { label: el.performance.lost, value: metrics.lost },
    {
      label: el.performance.hitRate,
      value: metrics.hitRate == null ? "—" : `${metrics.hitRate.toFixed(1)}%`,
    },
  ];

  return (
    <div>
      <h1 className="page-title">{el.admin.dashboard}</h1>
      <p className="section-subtitle">{el.admin.dashboardSubtitle}</p>
      <div className="mt-4 grid gap-2.5 sm:grid-cols-2 xl:grid-cols-3">
        {cards.map((card) => (
          <div key={card.label} className="admin-panel">
            <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--text-muted)]">
              {card.label}
            </p>
            <p className="mt-1.5 font-[family-name:var(--font-display)] text-2xl text-[var(--text)]">
              {card.value}
            </p>
          </div>
        ))}
      </div>

      <div className="mt-5 grid gap-3 lg:grid-cols-2">
        <section className="admin-panel">
          <h2 className="font-[family-name:var(--font-display)] text-base">
            {el.admin.recentActivity}
          </h2>
          <ul className="mt-3 space-y-2 text-sm">
            {activity.map((item) => (
              <li key={item.id} className="border-b border-[var(--border)] pb-2 last:border-0">
                <p className="text-[var(--text)]">{item.summary}</p>
                <p className="text-xs text-[var(--text-muted)]">
                  {item.actor?.email || "system"} ·{" "}
                  {format(item.createdAt, "d MMM yyyy HH:mm", { locale: elLocale })}
                </p>
              </li>
            ))}
            {!activity.length ? (
              <li className="text-[var(--text-muted)]">{el.admin.noActivity}</li>
            ) : null}
          </ul>
        </section>
        <section className="admin-panel">
          <h2 className="font-[family-name:var(--font-display)] text-base">
            {el.admin.dataSync}
          </h2>
          {latestSync ? (
            <div className="mt-3 space-y-1.5 text-sm text-[var(--text-muted)]">
              <p>
                {latestSync.provider.name} ·{" "}
                <span className="text-[var(--text)]">{latestSync.status}</span>
              </p>
              <p>
                Competitions: {latestSync.competitionsUpserted} · Teams:{" "}
                {latestSync.teamsUpserted} · Logos missing: {latestSync.logosMissing}
              </p>
              <p>
                {format(latestSync.createdAt, "d MMM yyyy HH:mm", {
                  locale: elLocale,
                })}
              </p>
            </div>
          ) : (
            <p className="mt-3 text-sm text-[var(--text-muted)]">{el.admin.noSync}</p>
          )}
          <Link
            href="/admin/data-sources"
            className="mt-3 inline-block text-sm text-[var(--neon)]"
          >
            {el.admin.openDataSources} →
          </Link>
        </section>
      </div>
    </div>
  );
}
