import type { Prisma, PublicationStatus, SettlementStatus } from "@prisma/client";
import { prisma } from "@/lib/db";
import { writeAuditLog } from "@/lib/audit";
import { settleSelection } from "@/lib/settlement/rules";
import { uniqueSlug } from "@/lib/utils";
import type {
  PredictionUpsertInput,
  SettleInput,
} from "@/lib/validations/prediction";

const publicInclude = {
  sport: true,
  competition: { include: { country: true } },
  match: {
    include: {
      homeTeam: true,
      awayTeam: true,
      season: true,
    },
  },
  sources: true,
  settlements: { orderBy: { settledAt: "desc" as const }, take: 5 },
} satisfies Prisma.PredictionInclude;

export async function createPredictionDraft(
  input: PredictionUpsertInput,
  actorId: string,
) {
  const match = await prisma.match.findUnique({
    where: { id: input.matchId },
    include: { homeTeam: true, awayTeam: true },
  });
  if (!match) throw new Error("Match not found");
  if (match.competitionId !== input.competitionId) {
    throw new Error("Match does not belong to the selected competition");
  }
  if (match.sportId !== input.sportId) {
    throw new Error("Match does not belong to the selected sport");
  }

  const baseSlug = uniqueSlug(
    `${match.homeTeam.name}-${match.awayTeam.name}-${input.marketLabel}`,
    Date.now().toString(36),
  );

  return prisma.$transaction(async (tx) => {
    const prediction = await tx.prediction.create({
      data: {
        slug: baseSlug,
        title: input.title,
        sportId: input.sportId,
        competitionId: input.competitionId,
        matchId: input.matchId,
        marketType: input.marketType,
        marketLabel: input.marketLabel,
        selection: input.selection,
        selectionDetail: input.selectionDetail ?? null,
        oddsAtPublication: input.oddsAtPublication ?? null,
        stake: input.stake ?? null,
        confidenceLevel: input.confidenceLevel ?? null,
        confidenceNote: input.confidenceNote ?? null,
        analysisOverview: input.analysisOverview ?? null,
        recentForm: input.recentForm ?? null,
        headToHead: input.headToHead ?? null,
        homeAwayStats: input.homeAwayStats ?? null,
        injuriesSuspensions: input.injuriesSuspensions ?? null,
        expectedLineups: input.expectedLineups ?? null,
        tacticalAnalysis: input.tacticalAnalysis ?? null,
        psychologicalContext: input.psychologicalContext ?? null,
        statisticalAssessment: input.statisticalAssessment ?? null,
        predictionRationale: input.predictionRationale ?? null,
        counterarguments: input.counterarguments ?? null,
        showOverview: input.showOverview ?? true,
        showRecentForm: input.showRecentForm ?? true,
        showHeadToHead: input.showHeadToHead ?? true,
        showHomeAwayStats: input.showHomeAwayStats ?? true,
        showInjuries: input.showInjuries ?? true,
        showLineups: input.showLineups ?? false,
        showTactical: input.showTactical ?? true,
        showPsychological: input.showPsychological ?? true,
        showStatistical: input.showStatistical ?? true,
        showRationale: input.showRationale ?? true,
        showCounterarguments: input.showCounterarguments ?? true,
        showSources: input.showSources ?? true,
        isFeatured: input.isFeatured ?? false,
        publicationStatus: "DRAFT",
        settlementStatus: "PENDING",
        createdById: actorId,
        updatedById: actorId,
        sources: input.sources?.length
          ? {
              create: input.sources.map((s) => ({
                title: s.title,
                url: s.url,
                retrievedAt: s.retrievedAt,
                notes: s.notes ?? null,
                isVerified: s.isVerified ?? false,
              })),
            }
          : undefined,
        oddsSnapshots:
          input.oddsAtPublication != null
            ? {
                create: {
                  odds: input.oddsAtPublication,
                  notes: "Initial odds at draft creation",
                },
              }
            : undefined,
      },
      include: publicInclude,
    });

    await writeAuditLog({
      tx,
      actorId,
      action: "CREATE",
      entityType: "Prediction",
      entityId: prediction.id,
      summary: `Created draft prediction ${prediction.slug}`,
      after: { slug: prediction.slug, publicationStatus: "DRAFT" },
    });

    return prediction;
  });
}

export async function updatePredictionDraft(
  id: string,
  input: PredictionUpsertInput,
  actorId: string,
) {
  return prisma.$transaction(async (tx) => {
    const existing = await tx.prediction.findUnique({ where: { id } });
    if (!existing) throw new Error("Prediction not found");

    // Editing a published prediction must not silently reset settlement or publication history.
    const prediction = await tx.prediction.update({
      where: { id },
      data: {
        title: input.title,
        sportId: input.sportId,
        competitionId: input.competitionId,
        matchId: input.matchId,
        marketType: input.marketType,
        marketLabel: input.marketLabel,
        selection: input.selection,
        selectionDetail: input.selectionDetail ?? null,
        oddsAtPublication: input.oddsAtPublication ?? null,
        stake: input.stake ?? null,
        confidenceLevel: input.confidenceLevel ?? null,
        confidenceNote: input.confidenceNote ?? null,
        analysisOverview: input.analysisOverview ?? null,
        recentForm: input.recentForm ?? null,
        headToHead: input.headToHead ?? null,
        homeAwayStats: input.homeAwayStats ?? null,
        injuriesSuspensions: input.injuriesSuspensions ?? null,
        expectedLineups: input.expectedLineups ?? null,
        tacticalAnalysis: input.tacticalAnalysis ?? null,
        psychologicalContext: input.psychologicalContext ?? null,
        statisticalAssessment: input.statisticalAssessment ?? null,
        predictionRationale: input.predictionRationale ?? null,
        counterarguments: input.counterarguments ?? null,
        showOverview: input.showOverview ?? existing.showOverview,
        showRecentForm: input.showRecentForm ?? existing.showRecentForm,
        showHeadToHead: input.showHeadToHead ?? existing.showHeadToHead,
        showHomeAwayStats: input.showHomeAwayStats ?? existing.showHomeAwayStats,
        showInjuries: input.showInjuries ?? existing.showInjuries,
        showLineups: input.showLineups ?? existing.showLineups,
        showTactical: input.showTactical ?? existing.showTactical,
        showPsychological: input.showPsychological ?? existing.showPsychological,
        showStatistical: input.showStatistical ?? existing.showStatistical,
        showRationale: input.showRationale ?? existing.showRationale,
        showCounterarguments:
          input.showCounterarguments ?? existing.showCounterarguments,
        showSources: input.showSources ?? existing.showSources,
        isFeatured: input.isFeatured ?? existing.isFeatured,
        updatedById: actorId,
      },
      include: publicInclude,
    });

    if (input.sources) {
      await tx.predictionSource.deleteMany({ where: { predictionId: id } });
      if (input.sources.length) {
        await tx.predictionSource.createMany({
          data: input.sources.map((s) => ({
            predictionId: id,
            title: s.title,
            url: s.url,
            retrievedAt: s.retrievedAt,
            notes: s.notes ?? null,
            isVerified: s.isVerified ?? false,
          })),
        });
      }
    }

    if (
      input.oddsAtPublication != null &&
      Number(existing.oddsAtPublication ?? 0) !== input.oddsAtPublication
    ) {
      await tx.oddsSnapshot.create({
        data: {
          predictionId: id,
          odds: input.oddsAtPublication,
          notes: "Odds updated by administrator",
        },
      });
    }

    await writeAuditLog({
      tx,
      actorId,
      action: "UPDATE",
      entityType: "Prediction",
      entityId: id,
      summary: `Updated prediction ${existing.slug}`,
      before: {
        publicationStatus: existing.publicationStatus,
        settlementStatus: existing.settlementStatus,
      },
      after: {
        publicationStatus: prediction.publicationStatus,
        settlementStatus: prediction.settlementStatus,
      },
    });

    return prediction;
  });
}

export async function setPublicationStatus(params: {
  id: string;
  status: Extract<PublicationStatus, "PUBLISHED" | "UNPUBLISHED" | "ARCHIVED" | "DRAFT">;
  actorId: string;
}) {
  return prisma.$transaction(async (tx) => {
    const existing = await tx.prediction.findUnique({ where: { id: params.id } });
    if (!existing) throw new Error("Prediction not found");

    const data: Prisma.PredictionUncheckedUpdateInput = {
      publicationStatus: params.status,
      updatedById: params.actorId,
    };

    if (params.status === "PUBLISHED") {
      data.publishedAt = existing.publishedAt ?? new Date();
      data.unpublishedAt = null;
    } else if (params.status === "UNPUBLISHED") {
      data.unpublishedAt = new Date();
      data.isFeatured = false;
    } else if (params.status === "DRAFT") {
      // Returning to draft removes public visibility but preserves first publishedAt history if any.
      data.isFeatured = false;
    }

    const updated = await tx.prediction.update({
      where: { id: params.id },
      data,
      include: publicInclude,
    });

    const action =
      params.status === "PUBLISHED"
        ? "PUBLISH"
        : params.status === "ARCHIVED"
          ? "ARCHIVE"
          : params.status === "UNPUBLISHED"
            ? "UNPUBLISH"
            : "UPDATE";

    await writeAuditLog({
      tx,
      actorId: params.actorId,
      action,
      entityType: "Prediction",
      entityId: params.id,
      summary: `Set publication status to ${params.status} for ${existing.slug}`,
      before: { publicationStatus: existing.publicationStatus },
      after: { publicationStatus: updated.publicationStatus },
    });

    return updated;
  });
}

export async function settlePrediction(input: SettleInput, actorId: string) {
  return prisma.$transaction(async (tx) => {
    const prediction = await tx.prediction.findUnique({
      where: { id: input.predictionId },
    });
    if (!prediction) throw new Error("Prediction not found");

    if (
      prediction.settlementStatus !== "PENDING" &&
      !input.status
    ) {
      throw new Error(
        "Settled predictions cannot be silently rewritten. Provide an explicit status override with notes.",
      );
    }

    let status: SettlementStatus = input.status ?? prediction.settlementStatus;

    if (input.useAutomaticRules && input.status == null) {
      if (
        input.finalHomeScore == null ||
        input.finalAwayScore == null
      ) {
        throw new Error("Final score required for automatic settlement");
      }
      status = settleSelection({
        marketType: prediction.marketType,
        selection: prediction.selection,
        selectionDetail: prediction.selectionDetail,
        score: {
          home: input.finalHomeScore,
          away: input.finalAwayScore,
        },
        matchAbandoned: input.matchAbandoned,
      });
    }

    if (!input.status && prediction.marketType === "OTHER") {
      throw new Error("OTHER markets require an explicit settlement status");
    }

    if (input.status) status = input.status;

    if (
      prediction.settlementStatus !== "PENDING" &&
      prediction.settlementStatus !== status &&
      !input.notes
    ) {
      throw new Error(
        "Changing a settled result requires settlement notes for the audit trail",
      );
    }

    const updated = await tx.prediction.update({
      where: { id: prediction.id },
      data: {
        settlementStatus: status,
        updatedById: actorId,
      },
      include: publicInclude,
    });

    if (
      input.finalHomeScore != null &&
      input.finalAwayScore != null
    ) {
      await tx.match.update({
        where: { id: prediction.matchId },
        data: {
          homeScore: input.finalHomeScore,
          awayScore: input.finalAwayScore,
          status: input.matchAbandoned ? "ABANDONED" : "FINISHED",
        },
      });
    }

    await tx.resultSettlement.create({
      data: {
        predictionId: prediction.id,
        status,
        previousStatus: prediction.settlementStatus,
        finalHomeScore: input.finalHomeScore ?? null,
        finalAwayScore: input.finalAwayScore ?? null,
        notes: input.notes ?? null,
        verificationSource: input.verificationSource ?? null,
        settledById: actorId,
      },
    });

    await writeAuditLog({
      tx,
      actorId,
      action: "SETTLE",
      entityType: "Prediction",
      entityId: prediction.id,
      summary: `Settled ${prediction.slug} as ${status}`,
      before: { settlementStatus: prediction.settlementStatus },
      after: { settlementStatus: status },
    });

    return updated;
  });
}

export { publicInclude };
