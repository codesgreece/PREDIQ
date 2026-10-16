import { notFound } from "next/navigation";
import { PredictionForm } from "@/components/admin/prediction-form";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function EditPredictionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const prediction = await prisma.prediction.findUnique({ where: { id } });
  if (!prediction) notFound();

  return (
    <div>
      <h1 className="page-title">Επεξεργασία προγνωστικού</h1>
      <p className="mt-1.5 text-sm text-[var(--text-muted)]">
        Status: {prediction.publicationStatus} · Settlement:{" "}
        {prediction.settlementStatus}
      </p>
      <p className="mb-4 text-sm text-[var(--text-muted)]">
        Η επεξεργασία δεν επαναφέρει τη διευθέτηση ούτε διαγράφει ιστορικό δημοσίευσης.
      </p>
      <PredictionForm
        initial={{
          id: prediction.id,
          title: prediction.title,
          sportId: prediction.sportId,
          competitionId: prediction.competitionId,
          matchId: prediction.matchId,
          marketType: prediction.marketType,
          marketLabel: prediction.marketLabel,
          selection: prediction.selection,
          selectionDetail: prediction.selectionDetail,
          oddsAtPublication:
            prediction.oddsAtPublication != null
              ? Number(prediction.oddsAtPublication)
              : null,
          stake: prediction.stake != null ? Number(prediction.stake) : null,
          publicationStatus: prediction.publicationStatus,
          settlementStatus: prediction.settlementStatus,
          analysisOverview: prediction.analysisOverview,
          recentForm: prediction.recentForm,
          headToHead: prediction.headToHead,
          homeAwayStats: prediction.homeAwayStats,
          injuriesSuspensions: prediction.injuriesSuspensions,
          expectedLineups: prediction.expectedLineups,
          tacticalAnalysis: prediction.tacticalAnalysis,
          psychologicalContext: prediction.psychologicalContext,
          statisticalAssessment: prediction.statisticalAssessment,
          predictionRationale: prediction.predictionRationale,
          counterarguments: prediction.counterarguments,
          confidenceLevel: prediction.confidenceLevel,
          confidenceNote: prediction.confidenceNote,
          isFeatured: prediction.isFeatured,
          slug: prediction.slug,
        }}
      />
    </div>
  );
}
