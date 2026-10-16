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
      <h1 className="page-title">Διοργανώσεις</h1>
      <form className="mt-4">
        <input
          name="q"
          defaultValue={q || ""}
          placeholder="Αναζήτηση διοργανώσεων"
          className="control w-full max-w-md"
        />
      </form>
      <div className="mt-4 overflow-x-auto rounded-[var(--radius-lg)] border border-[var(--border)]">
        <table className="data-table min-w-[640px]">
          <thead>
            <tr>
              <th>Διοργάνωση</th>
              <th>Χώρα</th>
              <th>Provider ID</th>
              <th>Logo</th>
              <th>Ομάδες</th>
            </tr>
          </thead>
          <tbody>
            {items.map((c) => (
              <tr key={c.id}>
                <td>{c.name}</td>
                <td className="text-[var(--text-muted)]">
                  {c.country?.name || "—"}
                </td>
                <td className="text-[var(--text-muted)]">
                  {c.provider?.key || "—"}:{c.providerRef || "—"}
                </td>
                <td>
                  {c.logoUrl ? (
                    <Image src={c.logoUrl} alt="" width={24} height={24} unoptimized />
                  ) : (
                    <span className="text-xs text-amber-300">
                      {c.logoMissing ? "Missing" : "None"}
                    </span>
                  )}
                </td>
                <td>{c._count.teams}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
