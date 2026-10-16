import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { PrismaClient } from "@prisma/client";
import { hashPassword, verifyPassword } from "@/lib/auth/password";
import {
  createPredictionDraft,
  setPublicationStatus,
  settlePrediction,
} from "@/lib/predictions/service";
import { calculatePerformance } from "@/lib/metrics/performance";

const prisma = new PrismaClient();
const suffix = `test-${Date.now()}`;

describe("database-backed workflows", () => {
  let adminId = "";
  let sportId = "";
  let competitionId = "";
  let matchId = "";
  let predictionId = "";

  beforeAll(async () => {
    const passwordHash = await hashPassword("IntegrationTest!123");
    const admin = await prisma.adminUser.create({
      data: {
        email: `${suffix}@prediq.test`,
        passwordHash,
        name: "Integration Admin",
      },
    });
    adminId = admin.id;
    expect(await verifyPassword("IntegrationTest!123", passwordHash)).toBe(true);

    const sport = await prisma.sport.upsert({
      where: { slug: "football" },
      update: {},
      create: { slug: "football", name: "Football" },
    });
    sportId = sport.id;

    const competition = await prisma.competition.create({
      data: {
        slug: `comp-${suffix}`,
        name: `Comp ${suffix}`,
        sportId,
      },
    });
    competitionId = competition.id;

    const home = await prisma.team.create({
      data: {
        slug: `home-${suffix}`,
        name: `Home ${suffix}`,
        sportId,
      },
    });
    const away = await prisma.team.create({
      data: {
        slug: `away-${suffix}`,
        name: `Away ${suffix}`,
        sportId,
      },
    });
    const match = await prisma.match.create({
      data: {
        sportId,
        competitionId,
        homeTeamId: home.id,
        awayTeamId: away.id,
      },
    });
    matchId = match.id;
  });

  afterAll(async () => {
    await prisma.prediction.deleteMany({
      where: { createdById: adminId },
    });
    await prisma.match.deleteMany({ where: { id: matchId } });
    await prisma.team.deleteMany({
      where: { slug: { contains: suffix } },
    });
    await prisma.competition.deleteMany({
      where: { slug: { contains: suffix } },
    });
    await prisma.session.deleteMany({ where: { userId: adminId } });
    await prisma.auditLog.deleteMany({ where: { actorId: adminId } });
    await prisma.adminUser.deleteMany({ where: { id: adminId } });
    await prisma.$disconnect();
  });

  it("keeps drafts private and publishes only on explicit action", async () => {
    const draft = await createPredictionDraft(
      {
        title: `Draft ${suffix}`,
        sportId,
        competitionId,
        matchId,
        marketType: "MATCH_RESULT_1X2",
        marketLabel: "1X2",
        selection: "HOME",
        oddsAtPublication: 1.9,
        stake: 10,
        analysisOverview: "Integration draft",
      },
      adminId,
    );
    predictionId = draft.id;
    expect(draft.publicationStatus).toBe("DRAFT");

    const publicCount = await prisma.prediction.count({
      where: { id: draft.id, publicationStatus: "PUBLISHED" },
    });
    expect(publicCount).toBe(0);

    const published = await setPublicationStatus({
      id: draft.id,
      status: "PUBLISHED",
      actorId: adminId,
    });
    expect(published.publicationStatus).toBe("PUBLISHED");
    expect(published.publishedAt).toBeTruthy();
  });

  it("settles with market rules and preserves audit trail", async () => {
    const settled = await settlePrediction(
      {
        predictionId,
        finalHomeScore: 2,
        finalAwayScore: 0,
        useAutomaticRules: true,
        matchAbandoned: false,
        notes: "integration settle",
        verificationSource: "integration-test",
      },
      adminId,
    );
    expect(settled.settlementStatus).toBe("WON");

    const history = await prisma.resultSettlement.findMany({
      where: { predictionId },
    });
    expect(history.length).toBeGreaterThanOrEqual(1);

    await expect(
      settlePrediction(
        {
          predictionId,
          status: "LOST",
          useAutomaticRules: false,
          matchAbandoned: false,
        },
        adminId,
      ),
    ).rejects.toThrow(/notes/i);
  });

  it("rejects duplicate provider IDs for teams", async () => {
    const provider = await prisma.dataProvider.upsert({
      where: { key: "seed" },
      update: {},
      create: { key: "seed", name: "Local Seed Provider" },
    });
    const ref = `dup-${suffix}`;
    await prisma.team.create({
      data: {
        slug: `dup-a-${suffix}`,
        name: "Dup A",
        sportId,
        providerId: provider.id,
        providerRef: ref,
      },
    });
    await expect(
      prisma.team.create({
        data: {
          slug: `dup-b-${suffix}`,
          name: "Dup B",
          sportId,
          providerId: provider.id,
          providerRef: ref,
        },
      }),
    ).rejects.toThrow();
  });

  it("computes hit rate from published settled rows", async () => {
    const rows = await prisma.prediction.findMany({
      where: { id: predictionId },
      select: {
        settlementStatus: true,
        oddsAtPublication: true,
        stake: true,
        publicationStatus: true,
      },
    });
    const metrics = calculatePerformance(rows);
    expect(metrics.won).toBe(1);
    expect(metrics.hitRate).toBe(100);
  });
});
