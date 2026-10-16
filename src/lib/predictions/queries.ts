import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";
import { publicInclude } from "@/lib/predictions/service";
import type { publicPredictionFilterSchema } from "@/lib/validations/prediction";
import type { z } from "zod";

type Filters = z.infer<typeof publicPredictionFilterSchema>;

export function buildPublicWhere(filters: Filters): Prisma.PredictionWhereInput {
  const where: Prisma.PredictionWhereInput = {
    publicationStatus: "PUBLISHED",
  };

  if (filters.q) {
    where.OR = [
      { title: { contains: filters.q, mode: "insensitive" } },
      { selection: { contains: filters.q, mode: "insensitive" } },
      { match: { homeTeam: { name: { contains: filters.q, mode: "insensitive" } } } },
      { match: { awayTeam: { name: { contains: filters.q, mode: "insensitive" } } } },
    ];
  }
  if (filters.sport) {
    where.sport = { slug: filters.sport };
  }
  if (filters.competition || filters.country) {
    where.competition = {
      ...(filters.competition ? { slug: filters.competition } : {}),
      ...(filters.country ? { country: { code: filters.country } } : {}),
    };
  }
  if (filters.market) {
    where.marketType = filters.market;
  }
  if (filters.status) {
    where.settlementStatus = filters.status;
  }
  if (filters.from || filters.to) {
    where.publishedAt = {};
    if (filters.from) where.publishedAt.gte = filters.from;
    if (filters.to) where.publishedAt.lte = filters.to;
  }
  return where;
}

export async function listPublishedPredictions(filters: Filters) {
  const where = buildPublicWhere(filters);
  const page = filters.page ?? 1;
  const pageSize = filters.pageSize ?? 12;
  const [total, items] = await Promise.all([
    prisma.prediction.count({ where }),
    prisma.prediction.findMany({
      where,
      include: publicInclude,
      orderBy: {
        publishedAt: filters.sort === "published_asc" ? "asc" : "desc",
      },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
  ]);
  return {
    items,
    total,
    page,
    pageSize,
    pageCount: Math.max(1, Math.ceil(total / pageSize)),
  };
}

export async function getPublishedPredictionBySlug(slug: string) {
  return prisma.prediction.findFirst({
    where: { slug, publicationStatus: "PUBLISHED" },
    include: publicInclude,
  });
}

export async function getFeaturedPrediction() {
  const settings = await prisma.siteSettings.findUnique({ where: { id: "default" } });
  if (settings?.featuredPredictionId) {
    const featured = await prisma.prediction.findFirst({
      where: {
        id: settings.featuredPredictionId,
        publicationStatus: "PUBLISHED",
      },
      include: publicInclude,
    });
    if (featured) return featured;
  }
  return prisma.prediction.findFirst({
    where: { publicationStatus: "PUBLISHED", isFeatured: true },
    include: publicInclude,
    orderBy: { publishedAt: "desc" },
  });
}
