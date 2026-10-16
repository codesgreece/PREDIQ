import { Badge } from "@/components/ui/badge";
import { el } from "@/lib/i18n/el";
import type { SettlementStatus } from "@prisma/client";

export function StatusBadge({ status }: { status: SettlementStatus }) {
  const map = {
    WON: { tone: "won" as const, label: el.status.WON },
    LOST: { tone: "lost" as const, label: el.status.LOST },
    PENDING: { tone: "pending" as const, label: el.status.PENDING },
    VOID: { tone: "void" as const, label: el.status.VOID },
  };
  const item = map[status];
  return <Badge tone={item.tone}>{item.label}</Badge>;
}
