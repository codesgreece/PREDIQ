import type { MetadataRoute } from "next";
import { prisma } from "@/lib/db";
import { publicMetricsWhere } from "@/lib/predictions/queries";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = (
    process.env.APP_URL || "https://prediq-codesgreeces-projects.vercel.app"
  ).replace(/\/$/, "");
  const [predictions, competitions] = await Promise.all([
    prisma.prediction.findMany({
      where: publicMetricsWhere(),
      select: { slug: true, updatedAt: true },
    }),
    prisma.competition.findMany({
      where: { predictions: { some: publicMetricsWhere() } },
      select: { slug: true, updatedAt: true },
    }),
  ]);

  const staticRoutes: MetadataRoute.Sitemap = [
    "",
    "/predictions",
    "/competitions",
    "/performance",
    "/statistics",
    "/about",
    "/methodology",
    "/privacy",
    "/terms",
    "/contact",
    "/responsible-gambling",
  ].map((path) => ({
    url: `${base}${path}`,
    changeFrequency: "daily",
    priority: path === "" ? 1 : 0.7,
  }));

  return [
    ...staticRoutes,
    ...predictions.map((p) => ({
      url: `${base}/predictions/${p.slug}`,
      lastModified: p.updatedAt,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
    ...competitions.map((c) => ({
      url: `${base}/competitions/${c.slug}`,
      lastModified: c.updatedAt,
      changeFrequency: "weekly" as const,
      priority: 0.5,
    })),
  ];
}
