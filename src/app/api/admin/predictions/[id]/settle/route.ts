import { requireAdmin } from "@/lib/auth/session";
import { assertCsrf } from "@/lib/auth/csrf";
import { settleSchema } from "@/lib/validations/prediction";
import { settlePrediction } from "@/lib/predictions/service";
import { handleApiError, jsonOk } from "@/lib/api";

export async function POST(
  request: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  try {
    const user = await requireAdmin();
    await assertCsrf(request);
    const { id } = await ctx.params;
    const input = settleSchema.parse({
      ...(await request.json()),
      predictionId: id,
    });
    const prediction = await settlePrediction(input, user.id);
    return jsonOk({ prediction });
  } catch (err) {
    return handleApiError(err);
  }
}
