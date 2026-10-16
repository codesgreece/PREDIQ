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
      <h1 className="font-[family-name:var(--font-display)] text-3xl">Teams</h1>
      <form className="mt-6">
        <input
          name="q"
          defaultValue={q || ""}
          placeholder="Search teams"
          className="h-10 w-full max-w-md rounded-md border border-[var(--border)] bg-[var(--bg-secondary)] px-3 text-sm"
        />
      </form>
      <div className="mt-6 overflow-x-auto rounded-xl border border-[var(--border)]">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-white/5 text-xs uppercase tracking-[0.12em] text-[var(--text-muted)]">
            <tr>
              <th className="px-4 py-3">Team</th>
              <th className="px-4 py-3">Country</th>
              <th className="px-4 py-3">Provider ID</th>
              <th className="px-4 py-3">Logo</th>
              <th className="px-4 py-3">Duplicate check</th>
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
                <tr key={t.id} className="border-t border-white/5">
                  <td className="px-4 py-3">{t.name}</td>
                  <td className="px-4 py-3 text-[var(--text-muted)]">
                    {t.country?.name || "—"}
                  </td>
                  <td className="px-4 py-3 text-[var(--text-muted)]">
                    {t.provider?.key || "—"}:{t.providerRef || "—"}
                  </td>
                  <td className="px-4 py-3">
                    {t.logoUrl ? (
                      <Image src={t.logoUrl} alt="" width={28} height={28} unoptimized />
                    ) : (
                      <span className="text-xs text-amber-300">
                        {t.logoMissing ? "Missing" : "None"}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {dup ? (
                      <span className="text-xs text-red-300">Duplicate provider ref</span>
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
