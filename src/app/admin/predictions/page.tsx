import Link from "next/link";
import { format } from "date-fns";
import { StatusBadge } from "@/components/predictions/status-badge";
import { Badge } from "@/components/ui/badge";
import { prisma } from "@/lib/db";

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
        <h1 className="font-[family-name:var(--font-display)] text-3xl">
          Predictions
        </h1>
        <Link
          href="/admin/predictions/new"
          className="rounded-md bg-[var(--neon)] px-4 py-2 text-sm font-semibold text-[#04140f]"
        >
          Create prediction
        </Link>
      </div>
      <div className="mt-8 overflow-x-auto rounded-xl border border-[var(--border)]">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-white/5 text-xs uppercase tracking-[0.12em] text-[var(--text-muted)]">
            <tr>
              <th className="px-4 py-3">Match</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Result</th>
              <th className="px-4 py-3">Updated</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {items.map((p) => (
              <tr key={p.id} className="border-t border-white/5">
                <td className="px-4 py-3">
                  <div className="font-medium">
                    {p.match.homeTeam.name} vs {p.match.awayTeam.name}
                  </div>
                  <div className="text-xs text-[var(--text-muted)]">
                    {p.competition.name} · {p.marketLabel}
                  </div>
                </td>
                <td className="px-4 py-3">
                  <Badge
                    tone={
                      p.publicationStatus === "PUBLISHED" ? "neon" : "neutral"
                    }
                  >
                    {p.publicationStatus}
                  </Badge>
                  {p.isFeatured ? (
                    <span className="ml-2 text-xs text-[var(--neon)]">Featured</span>
                  ) : null}
                </td>
                <td className="px-4 py-3">
                  <StatusBadge status={p.settlementStatus} />
                </td>
                <td className="px-4 py-3 text-[var(--text-muted)]">
                  {format(p.updatedAt, "dd MMM yyyy")}
                </td>
                <td className="px-4 py-3">
                  <Link
                    href={`/admin/predictions/${p.id}`}
                    className="text-[var(--neon)]"
                  >
                    Edit
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!items.length ? (
          <p className="p-6 text-[var(--text-muted)]">No predictions yet.</p>
        ) : null}
      </div>
    </div>
  );
}
