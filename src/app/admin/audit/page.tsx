import { format } from "date-fns";
import { el as elLocale } from "date-fns/locale";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function AuditLogPage() {
  const items = await prisma.auditLog.findMany({
    include: { actor: { select: { email: true } } },
    orderBy: { createdAt: "desc" },
    take: 200,
  });

  return (
    <div>
      <h1 className="page-title">Αρχείο ενεργειών</h1>
      <div className="mt-4 space-y-2">
        {items.map((item) => (
          <div key={item.id} className="admin-panel text-sm">
            <p className="text-[var(--text)]">{item.summary}</p>
            <p className="mt-1 text-xs text-[var(--text-muted)]">
              {item.action} · {item.entityType}
              {item.entityId ? `:${item.entityId}` : ""} ·{" "}
              {item.actor?.email || "system"} ·{" "}
              {format(item.createdAt, "d MMM yyyy HH:mm:ss", { locale: elLocale })}
            </p>
          </div>
        ))}
        {!items.length ? (
          <p className="text-sm text-[var(--text-muted)]">Δεν υπάρχουν ακόμη εγγραφές.</p>
        ) : null}
      </div>
    </div>
  );
}
