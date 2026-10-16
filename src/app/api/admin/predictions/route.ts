import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth/session";
import { assertCsrf } from "@/lib/auth/csrf";
import { predictionUpsertSchema } from "@/lib/validations/prediction";
import {
  createPredictionDraft,
  publicInclude,
} from "@/lib/predictions/service";
import { handleApiError, jsonOk } from "@/lib/api";

export async function GET(request: Request) {
  try {
    await requireAdmin();
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status") || undefined;
    const items = await prisma.prediction.findMany({
      where: status
        ? { publicationStatus: status as "DRAFT" | "PUBLISHED" | "ARCHIVED" | "UNPUBLISHED" }
        : undefined,
      include: publicInclude,
      orderBy: { updatedAt: "desc" },
      take: 100,
    });
    return jsonOk({ items });
  } catch (err) {
    return handleApiError(err);
  }
}

export async function POST(request: Request) {
  try {
    const user = await requireAdmin();
    await assertCsrf(request);
    const input = predictionUpsertSchema.parse(await request.json());
    const prediction = await createPredictionDraft(input, user.id);
    return jsonOk({ prediction }, { status: 201 } as ResponseInit);
  } catch (err) {
    return handleApiError(err);
  }
}
