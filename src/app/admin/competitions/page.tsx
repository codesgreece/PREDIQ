import Image from "next/image";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function AdminCompetitionsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const items = await prisma.competition.findMany({
    where: q
      ? { name: { contains: q, mode: "insensitive" } }
      : undefined,
    include: {
      country: true,
      provider: true,
      _count: { select: { teams: true, predictions: true } },
    },
    orderBy: { name: "asc" },
    take: 200,
  });

  return (
    <div>
      <h1 className="font-[family-name:var(--font-display)] text-3xl">
        Competitions
      </h1>
      <form className="mt-6">
        <input
          name="q"
          defaultValue={q || ""}
          placeholder="Search competitions"
          className="h-10 w-full max-w-md rounded-md border border-[var(--border)] bg-[var(--bg-secondary)] px-3 text-sm"
        />
      </form>
      <div className="mt-6 overflow-x-auto rounded-xl border border-[var(--border)]">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-white/5 text-xs uppercase tracking-[0.12em] text-[var(--text-muted)]">
            <tr>
              <th className="px-4 py-3">Competition</th>
              <th className="px-4 py-3">Country</th>
              <th className="px-4 py-3">Provider ID</th>
              <th className="px-4 py-3">Logo</th>
              <th className="px-4 py-3">Teams</th>
            </tr>
          </thead>
          <tbody>
            {items.map((c) => (
              <tr key={c.id} className="border-t border-white/5">
                <td className="px-4 py-3">{c.name}</td>
                <td className="px-4 py-3 text-[var(--text-muted)]">
                  {c.country?.name || "—"}
                </td>
                <td className="px-4 py-3 text-[var(--text-muted)]">
                  {c.provider?.key || "—"}:{c.providerRef || "—"}
                </td>
                <td className="px-4 py-3">
                  {c.logoUrl ? (
                    <Image src={c.logoUrl} alt="" width={28} height={28} unoptimized />
                  ) : (
                    <span className="text-xs text-amber-300">
                      {c.logoMissing ? "Missing" : "None"}
                    </span>
                  )}
                </td>
                <td className="px-4 py-3">{c._count.teams}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
