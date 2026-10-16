import { z } from "zod";
import { requireAdmin } from "@/lib/auth/session";
import { assertCsrf } from "@/lib/auth/csrf";
import { generateResearchDraft } from "@/lib/ai/research";
import { handleApiError, jsonOk } from "@/lib/api";

const schema = z.object({
  matchId: z.string().min(1),
  predictionId: z.string().optional().nullable(),
});

export async function POST(request: Request) {
  try {
    const user = await requireAdmin();
    await assertCsrf(request);
    const input = schema.parse(await request.json());
    const result = await generateResearchDraft({
      matchId: input.matchId,
      predictionId: input.predictionId,
      actorId: user.id,
    });
    return jsonOk(result);
  } catch (err) {
    return handleApiError(err);
  }
}
