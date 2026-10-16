import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth/session";
import { handleApiError, jsonOk } from "@/lib/api";

export async function GET(request: Request) {
  try {
    await requireAdmin();
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type") || "all";
    const q = searchParams.get("q") || undefined;

    if (type === "teams") {
      const items = await prisma.team.findMany({
        where: q
          ? { name: { contains: q, mode: "insensitive" } }
          : undefined,
        include: { country: true, provider: true },
        orderBy: { name: "asc" },
        take: 100,
      });
      return jsonOk({ items });
    }

    if (type === "competitions") {
      const items = await prisma.competition.findMany({
        where: q
          ? { name: { contains: q, mode: "insensitive" } }
          : undefined,
        include: { country: true, provider: true, seasons: true },
        orderBy: { name: "asc" },
        take: 100,
      });
      return jsonOk({ items });
    }

    const [sports, competitions, teams, providers, seasons] = await Promise.all([
      prisma.sport.findMany({ orderBy: { name: "asc" } }),
      prisma.competition.findMany({
        include: { country: true, seasons: true },
        orderBy: { name: "asc" },
        take: 200,
      }),
      prisma.team.findMany({
        include: { country: true },
        orderBy: { name: "asc" },
        take: 200,
      }),
      prisma.dataProvider.findMany({ orderBy: { name: "asc" } }),
      prisma.season.findMany({ orderBy: { name: "desc" }, take: 100 }),
    ]);
    return jsonOk({ sports, competitions, teams, providers, seasons });
  } catch (err) {
    return handleApiError(err);
  }
}
