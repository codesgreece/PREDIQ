import { z } from "zod";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth/session";
import { assertCsrf } from "@/lib/auth/csrf";
import { handleApiError, jsonOk } from "@/lib/api";

const createMatchSchema = z.object({
  sportId: z.string().min(1),
  competitionId: z.string().min(1),
  seasonId: z.string().optional().nullable(),
  homeTeamId: z.string().min(1),
  awayTeamId: z.string().min(1),
  kickoffAt: z.coerce.date().optional().nullable(),
  venue: z.string().max(200).optional().nullable(),
  venueVerified: z.boolean().optional().default(false),
});

export async function GET(request: Request) {
  try {
    await requireAdmin();
    const { searchParams } = new URL(request.url);
    const competitionId = searchParams.get("competitionId") || undefined;
    const q = searchParams.get("q") || undefined;
    const items = await prisma.match.findMany({
      where: {
        competitionId,
        ...(q
          ? {
              OR: [
                { homeTeam: { name: { contains: q, mode: "insensitive" } } },
                { awayTeam: { name: { contains: q, mode: "insensitive" } } },
              ],
            }
          : {}),
      },
      include: {
        homeTeam: true,
        awayTeam: true,
        competition: true,
        season: true,
      },
      orderBy: { kickoffAt: "desc" },
      take: 50,
    });
    return jsonOk({ items });
  } catch (err) {
    return handleApiError(err);
  }
}

export async function POST(request: Request) {
  try {
    await requireAdmin();
    await assertCsrf(request);
    const input = createMatchSchema.parse(await request.json());
    if (input.homeTeamId === input.awayTeamId) {
      throw new Error("Home and away teams must differ");
    }
    const match = await prisma.match.create({
      data: {
        sportId: input.sportId,
        competitionId: input.competitionId,
        seasonId: input.seasonId ?? null,
        homeTeamId: input.homeTeamId,
        awayTeamId: input.awayTeamId,
        kickoffAt: input.kickoffAt ?? null,
        venue: input.venue ?? null,
        venueVerified: input.venueVerified ?? false,
      },
      include: { homeTeam: true, awayTeam: true, competition: true },
    });
    return jsonOk({ match }, { status: 201 } as ResponseInit);
  } catch (err) {
    return handleApiError(err);
  }
}
