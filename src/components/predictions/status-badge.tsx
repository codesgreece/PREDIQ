import { Badge } from "@/components/ui/badge";
import type { SettlementStatus } from "@prisma/client";

export function StatusBadge({ status }: { status: SettlementStatus }) {
  const map = {
    WON: { tone: "won" as const, label: "Won" },
    LOST: { tone: "lost" as const, label: "Lost" },
    PENDING: { tone: "pending" as const, label: "Pending" },
    VOID: { tone: "void" as const, label: "Void" },
  };
  const item = map[status];
  return <Badge tone={item.tone}>{item.label}</Badge>;
}
