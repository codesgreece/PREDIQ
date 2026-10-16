import Link from "next/link";
import { format } from "date-fns";
import { el as elLocale } from "date-fns/locale";
import { StatusBadge } from "@/components/predictions/status-badge";
import { Badge } from "@/components/ui/badge";
import { prisma } from "@/lib/db";
import { el } from "@/lib/i18n/el";

export const dynamic = "force-dynamic";

export default async function AdminPredictionsPage() {
  const items = await prisma.prediction.findMany({
    include: {
      match: { include: { homeTeam: true, awayTeam: true } },
      competition: true,
    },
    orderBy: { updatedAt: "desc" },
    take: 100,
  });

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="page-title">{el.admin.predictions}</h1>
        <Link href="/admin/predictions/new" className="btn-primary">
          {el.admin.createPrediction}
        </Link>
      </div>
      <div className="mt-4 overflow-x-auto rounded-[var(--radius-lg)] border border-[var(--border)]">
        <table className="data-table min-w-[640px]">
          <thead>
            <tr>
              <th>{el.admin.match}</th>
              <th>{el.admin.status}</th>
              <th>{el.admin.result}</th>
              <th>{el.admin.updated}</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {items.map((p) => (
              <tr key={p.id}>
                <td>
                  <div className="font-medium">
                    {p.match.homeTeam.name} vs {p.match.awayTeam.name}
                  </div>
                  <div className="text-xs text-[var(--text-muted)]">
                    {p.competition.name} · {p.marketLabel}
                  </div>
                </td>
                <td>
                  <Badge
                    tone={
                      p.publicationStatus === "PUBLISHED" ? "neon" : "neutral"
                    }
                  >
                    {p.publicationStatus}
                  </Badge>
                  {p.isFeatured ? (
                    <span className="ml-1.5 text-xs text-[var(--neon)]">
                      {el.admin.featured}
                    </span>
                  ) : null}
                </td>
                <td>
                  <StatusBadge status={p.settlementStatus} />
                </td>
                <td className="text-[var(--text-muted)]">
                  {format(p.updatedAt, "d MMM yyyy", { locale: elLocale })}
                </td>
                <td>
                  <Link
                    href={`/admin/predictions/${p.id}`}
                    className="text-[var(--neon)]"
                  >
                    {el.admin.edit}
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!items.length ? (
          <p className="p-4 text-sm text-[var(--text-muted)]">
            {el.admin.noPredictions}
          </p>
        ) : null}
      </div>
    </div>
  );
}
