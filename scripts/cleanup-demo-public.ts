/**
 * Unpublish and mark all demo/seed predictions so they never appear
 * on the public site or in public performance metrics.
 *
 * Safe for production: does not delete administrator-created non-demo records.
 */
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const result = await prisma.prediction.updateMany({
    where: {
      OR: [
        { isDemo: true },
        { slug: { endsWith: "-seed" } },
        { slug: { contains: "-seed-" } },
        { match: { provider: { key: "seed" } } },
      ],
    },
    data: {
      isDemo: true,
      isFeatured: false,
      publicationStatus: "UNPUBLISHED",
      unpublishedAt: new Date(),
    },
  });

  const settings = await prisma.siteSettings.findUnique({ where: { id: "default" } });
  if (settings?.featuredPredictionId) {
    const featured = await prisma.prediction.findUnique({
      where: { id: settings.featuredPredictionId },
    });
    if (!featured || featured.isDemo || featured.publicationStatus !== "PUBLISHED") {
      await prisma.siteSettings.update({
        where: { id: "default" },
        data: { featuredPredictionId: null },
      });
    }
  }

  console.log(`Cleaned ${result.count} demo/seed prediction(s) from public view.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
