import Image from "next/image";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function AdminTeamsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const items = await prisma.team.findMany({
    where: q ? { name: { contains: q, mode: "insensitive" } } : undefined,
    include: { country: true, provider: true },
    orderBy: { name: "asc" },
    take: 200,
  });

  const refs = new Map<string, number>();
  for (const t of items) {
    if (t.providerId && t.providerRef) {
      const key = `${t.providerId}:${t.providerRef}`;
      refs.set(key, (refs.get(key) || 0) + 1);
    }
  }

  return (
    <div>
      <h1 className="page-title">Ομάδες</h1>
      <form className="mt-4">
        <input
          name="q"
          defaultValue={q || ""}
          placeholder="Αναζήτηση ομάδων"
          className="control w-full max-w-md"
        />
      </form>
      <div className="mt-4 overflow-x-auto rounded-[var(--radius-lg)] border border-[var(--border)]">
        <table className="data-table min-w-[640px]">
          <thead>
            <tr>
              <th>Ομάδα</th>
              <th>Χώρα</th>
              <th>Provider ID</th>
              <th>Logo</th>
              <th>Duplicate</th>
            </tr>
          </thead>
          <tbody>
            {items.map((t) => {
              const key =
                t.providerId && t.providerRef
                  ? `${t.providerId}:${t.providerRef}`
                  : "";
              const dup = key ? (refs.get(key) || 0) > 1 : false;
              return (
                <tr key={t.id}>
                  <td>{t.name}</td>
                  <td className="text-[var(--text-muted)]">
                    {t.country?.name || "—"}
                  </td>
                  <td className="text-[var(--text-muted)]">
                    {t.provider?.key || "—"}:{t.providerRef || "—"}
                  </td>
                  <td>
                    {t.logoUrl ? (
                      <Image src={t.logoUrl} alt="" width={24} height={24} unoptimized />
                    ) : (
                      <span className="text-xs text-amber-300">
                        {t.logoMissing ? "Missing" : "None"}
                      </span>
                    )}
                  </td>
                  <td>
                    {dup ? (
                      <span className="text-xs text-[var(--danger)]">Duplicate</span>
                    ) : (
                      <span className="text-xs text-[var(--text-muted)]">OK</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
