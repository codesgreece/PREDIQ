import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth/session";
import { handleApiError, jsonOk } from "@/lib/api";

export async function GET() {
  try {
    await requireAdmin();
    const items = await prisma.auditLog.findMany({
      include: { actor: { select: { email: true, name: true } } },
      orderBy: { createdAt: "desc" },
      take: 100,
    });
    return jsonOk({ items });
  } catch (err) {
    return handleApiError(err);
  }
}
