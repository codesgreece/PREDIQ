import { PerformanceOverview } from "@/components/metrics/performance-overview";
import { prisma } from "@/lib/db";
import { calculatePerformance } from "@/lib/metrics/performance";

export const dynamic = "force-dynamic";

export default async function AdminStatisticsPage() {
  const published = await prisma.prediction.findMany({
    where: { publicationStatus: "PUBLISHED" },
    select: {
      settlementStatus: true,
      oddsAtPublication: true,
      stake: true,
      publicationStatus: true,
    },
  });
  return (
    <div>
      <h1 className="mb-8 font-[family-name:var(--font-display)] text-3xl">
        Statistics
      </h1>
      <PerformanceOverview metrics={calculatePerformance(published)} />
    </div>
  );
}
