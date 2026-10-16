import { format } from "date-fns";
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
      <h1 className="font-[family-name:var(--font-display)] text-3xl">
        Audit log
      </h1>
      <div className="mt-8 space-y-3">
        {items.map((item) => (
          <div
            key={item.id}
            className="rounded-xl border border-[var(--border)] p-4 text-sm"
          >
            <p className="text-[var(--text)]">{item.summary}</p>
            <p className="mt-1 text-xs text-[var(--text-muted)]">
              {item.action} · {item.entityType}
              {item.entityId ? `:${item.entityId}` : ""} ·{" "}
              {item.actor?.email || "system"} ·{" "}
              {format(item.createdAt, "dd MMM yyyy HH:mm:ss")}
            </p>
          </div>
        ))}
        {!items.length ? (
          <p className="text-[var(--text-muted)]">No audit events yet.</p>
        ) : null}
      </div>
    </div>
  );
}
