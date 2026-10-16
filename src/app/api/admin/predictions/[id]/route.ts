import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth/session";
import { assertCsrf } from "@/lib/auth/csrf";
import { predictionUpsertSchema } from "@/lib/validations/prediction";
import {
  publicInclude,
  setPublicationStatus,
  updatePredictionDraft,
} from "@/lib/predictions/service";
import { handleApiError, jsonError, jsonOk } from "@/lib/api";
import { z } from "zod";

export async function GET(
  _request: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  try {
    await requireAdmin();
    const { id } = await ctx.params;
    const prediction = await prisma.prediction.findUnique({
      where: { id },
      include: publicInclude,
    });
    if (!prediction) return jsonError("Not found", 404);
    return jsonOk({ prediction });
  } catch (err) {
    return handleApiError(err);
  }
}

export async function PATCH(
  request: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  try {
    const user = await requireAdmin();
    await assertCsrf(request);
    const { id } = await ctx.params;
    const body = await request.json();

    if (body?.action === "publish" || body?.action === "unpublish" || body?.action === "archive" || body?.action === "draft") {
      const map = {
        publish: "PUBLISHED",
        unpublish: "UNPUBLISHED",
        archive: "ARCHIVED",
        draft: "DRAFT",
      } as const;
      const prediction = await setPublicationStatus({
        id,
        status: map[body.action as keyof typeof map],
        actorId: user.id,
      });
      return jsonOk({ prediction });
    }

    if (body?.action === "feature") {
      const featured = z.boolean().parse(body.featured);
      const prediction = await prisma.prediction.update({
        where: { id },
        data: { isFeatured: featured, updatedById: user.id },
        include: publicInclude,
      });
      if (featured) {
        await prisma.siteSettings.upsert({
          where: { id: "default" },
          update: { featuredPredictionId: id },
          create: { id: "default", featuredPredictionId: id },
        });
      }
      return jsonOk({ prediction });
    }

    const input = predictionUpsertSchema.parse(body);
    const prediction = await updatePredictionDraft(id, input, user.id);
    return jsonOk({ prediction });
  } catch (err) {
    return handleApiError(err);
  }
}
