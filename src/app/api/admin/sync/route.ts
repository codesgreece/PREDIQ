import { requireAdmin } from "@/lib/auth/session";
import { assertCsrf } from "@/lib/auth/csrf";
import { syncSportsCatalog } from "@/lib/sports-data/sync";
import { prisma } from "@/lib/db";
import { handleApiError, jsonOk } from "@/lib/api";

export async function GET() {
  try {
    await requireAdmin();
    const jobs = await prisma.syncJob.findMany({
      include: { provider: true, triggeredBy: true },
      orderBy: { createdAt: "desc" },
      take: 20,
    });
    return jsonOk({ jobs });
  } catch (err) {
    return handleApiError(err);
  }
}

export async function POST(request: Request) {
  try {
    const user = await requireAdmin();
    await assertCsrf(request);
    const body = (await request.json().catch(() => ({}))) as {
      maxCompetitions?: number;
    };
    const result = await syncSportsCatalog({
      adapterKey: "api-football",
      triggeredById: user.id,
      maxCompetitions: body.maxCompetitions,
    });
    return jsonOk(result);
  } catch (err) {
    return handleApiError(err);
  }
}
