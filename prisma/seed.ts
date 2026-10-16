import {
  PrismaClient,
  PredictionMarketType,
  PublicationStatus,
  SettlementStatus,
} from "@prisma/client";
import { hashPassword } from "../src/lib/auth/password";

const prisma = new PrismaClient();

/**
 * Development seed.
 * Creates structural catalog records and optional DEMO published predictions
 * clearly attributable to the local "seed" provider — not a licensed worldwide dump.
 * Production catalogs should be loaded via the API-Football sync adapter.
 */
async function main() {
  const email = process.env.BOOTSTRAP_ADMIN_EMAIL || "admin@prediq.local";
  const password = process.env.BOOTSTRAP_ADMIN_PASSWORD || "ChangeMeNow!123";

  const passwordHash = await hashPassword(password);
  const admin = await prisma.adminUser.upsert({
    where: { email },
    update: { passwordHash, isActive: true, name: "PREDIQ Admin" },
    create: {
      email,
      passwordHash,
      name: "PREDIQ Admin",
      isActive: true,
    },
  });

  const sport = await prisma.sport.upsert({
    where: { slug: "football" },
    update: { name: "Football" },
    create: { slug: "football", name: "Football" },
  });

  const provider = await prisma.dataProvider.upsert({
    where: { key: "seed" },
    update: {
      name: "Local Seed Provider",
      notes:
        "Demo-only catalog for local development. Replace with API-Football sync for licensed data.",
    },
    create: {
      key: "seed",
      name: "Local Seed Provider",
      notes:
        "Demo-only catalog for local development. Replace with API-Football sync for licensed data.",
      isActive: true,
    },
  });

  await prisma.dataProvider.upsert({
    where: { key: "api-football" },
    update: {
      name: "API-Football",
      websiteUrl: "https://www.api-football.com",
      notes:
        "Requires API_FOOTBALL_KEY. Coverage depends on plan. Logo licensing per provider terms.",
    },
    create: {
      key: "api-football",
      name: "API-Football",
      websiteUrl: "https://www.api-football.com",
      notes:
        "Requires API_FOOTBALL_KEY. Coverage depends on plan. Logo licensing per provider terms.",
      isActive: true,
    },
  });

  const greece = await prisma.country.upsert({
    where: { code: "GR" },
    update: { name: "Greece" },
    create: { code: "GR", name: "Greece" },
  });
  const england = await prisma.country.upsert({
    where: { code: "GB-ENG" },
    update: { name: "England" },
    create: { code: "GB-ENG", name: "England" },
  });
  const europe = await prisma.country.upsert({
    where: { code: "EU" },
    update: { name: "Europe" },
    create: { code: "EU", name: "Europe" },
  });

  const superLeague = await prisma.competition.upsert({
    where: { slug: "greece-super-league-seed" },
    update: { name: "Super League Greece (seed)" },
    create: {
      slug: "greece-super-league-seed",
      name: "Super League Greece (seed)",
      shortName: "Super League",
      type: "League",
      sportId: sport.id,
      countryId: greece.id,
      providerId: provider.id,
      providerRef: "seed-gr-super-league",
      logoMissing: true,
    },
  });

  const premier = await prisma.competition.upsert({
    where: { slug: "england-premier-league-seed" },
    update: { name: "Premier League (seed)" },
    create: {
      slug: "england-premier-league-seed",
      name: "Premier League (seed)",
      shortName: "Premier League",
      type: "League",
      sportId: sport.id,
      countryId: england.id,
      providerId: provider.id,
      providerRef: "seed-eng-premier",
      logoMissing: true,
    },
  });

  const ucl = await prisma.competition.upsert({
    where: { slug: "uefa-champions-league-seed" },
    update: { name: "UEFA Champions League (seed)" },
    create: {
      slug: "uefa-champions-league-seed",
      name: "UEFA Champions League (seed)",
      shortName: "UCL",
      type: "Cup",
      sportId: sport.id,
      countryId: europe.id,
      providerId: provider.id,
      providerRef: "seed-ucl",
      logoMissing: true,
    },
  });

  async function upsertTeam(
    slug: string,
    name: string,
    countryId: string,
    providerRef: string,
  ) {
    return prisma.team.upsert({
      where: { slug },
      update: { name },
      create: {
        slug,
        name,
        shortName: name,
        sportId: sport.id,
        countryId,
        providerId: provider.id,
        providerRef,
        logoMissing: true,
      },
    });
  }

  const olympiacos = await upsertTeam(
    "olympiacos-seed",
    "Olympiacos",
    greece.id,
    "seed-team-olympiacos",
  );
  const pao = await upsertTeam(
    "panathinaikos-seed",
    "Panathinaikos",
    greece.id,
    "seed-team-panathinaikos",
  );
  const arsenal = await upsertTeam(
    "arsenal-seed",
    "Arsenal",
    england.id,
    "seed-team-arsenal",
  );
  const liverpool = await upsertTeam(
    "liverpool-seed",
    "Liverpool",
    england.id,
    "seed-team-liverpool",
  );

  for (const [team, competition] of [
    [olympiacos, superLeague],
    [pao, superLeague],
    [arsenal, premier],
    [liverpool, premier],
    [arsenal, ucl],
    [liverpool, ucl],
  ] as const) {
    const existing = await prisma.teamCompetition.findFirst({
      where: { teamId: team.id, competitionId: competition.id, seasonId: null },
    });
    if (!existing) {
      await prisma.teamCompetition.create({
        data: { teamId: team.id, competitionId: competition.id },
      });
    }
  }

  const season = await prisma.season.upsert({
    where: {
      competitionId_name: { competitionId: superLeague.id, name: "2025-26" },
    },
    update: { isCurrent: true },
    create: {
      competitionId: superLeague.id,
      name: "2025-26",
      yearStart: 2025,
      yearEnd: 2026,
      isCurrent: true,
    },
  });

  const derby = await prisma.match.upsert({
    where: {
      providerId_providerRef: {
        providerId: provider.id,
        providerRef: "seed-match-oly-pao",
      },
    },
    update: {},
    create: {
      sportId: sport.id,
      competitionId: superLeague.id,
      seasonId: season.id,
      homeTeamId: olympiacos.id,
      awayTeamId: pao.id,
      kickoffAt: new Date("2025-11-02T18:30:00.000Z"),
      venue: "Georgios Karaiskakis Stadium",
      venueVerified: true,
      providerId: provider.id,
      providerRef: "seed-match-oly-pao",
      homeScore: 2,
      awayScore: 1,
      status: "FINISHED",
    },
  });

  const eplMatch = await prisma.match.upsert({
    where: {
      providerId_providerRef: {
        providerId: provider.id,
        providerRef: "seed-match-ars-liv",
      },
    },
    update: {},
    create: {
      sportId: sport.id,
      competitionId: premier.id,
      homeTeamId: arsenal.id,
      awayTeamId: liverpool.id,
      kickoffAt: new Date("2025-12-14T16:30:00.000Z"),
      venue: "Emirates Stadium",
      venueVerified: true,
      providerId: provider.id,
      providerRef: "seed-match-ars-liv",
      status: "SCHEDULED",
    },
  });

  await prisma.siteSettings.upsert({
    where: { id: "default" },
    update: {
      siteName: "PREDIQ",
      tagline: "AI SPORTS PREDICTIONS",
      aboutText:
        "Το PREDIQ δημοσιεύει χειροκίνητα ερευνημένα προγνωστικά με υποστήριξη AI. Τίποτα δεν δημοσιεύεται χωρίς έλεγχο διαχειριστή.",
      methodologyText:
        "Κάθε προγνωστικό ερευνάται, συντάσσεται, ελέγχεται και δημοσιεύεται ρητά από διαχειριστή. Το ποσοστό επιτυχίας αποκλείει τα εκκρεμή.",
      contactEmail: "contact@prediq.local",
    },
    create: {
      id: "default",
      siteName: "PREDIQ",
      tagline: "AI SPORTS PREDICTIONS",
      aboutText:
        "Το PREDIQ δημοσιεύει χειροκίνητα ερευνημένα προγνωστικά με υποστήριξη AI. Τίποτα δεν δημοσιεύεται χωρίς έλεγχο διαχειριστή.",
      methodologyText:
        "Κάθε προγνωστικό ερευνάται, συντάσσεται, ελέγχεται και δημοσιεύεται ρητά από διαχειριστή. Το ποσοστό επιτυχίας αποκλείει τα εκκρεμή.",
      contactEmail: "contact@prediq.local",
    },
  });

  // Demo predictions for local admin testing only. Always isDemo=true so they
  // never appear on the public site or in public performance metrics.
  const published = await prisma.prediction.upsert({
    where: { slug: "olympiacos-panathinaikos-home-seed" },
    update: {
      isDemo: true,
      isFeatured: false,
      publicationStatus: PublicationStatus.UNPUBLISHED,
    },
    create: {
      slug: "olympiacos-panathinaikos-home-seed",
      title: "Olympiacos vs Panathinaikos — Home win (seed demo)",
      sportId: sport.id,
      competitionId: superLeague.id,
      matchId: derby.id,
      marketType: PredictionMarketType.MATCH_RESULT_1X2,
      marketLabel: "Match Result (1X2)",
      selection: "HOME",
      oddsAtPublication: 1.95,
      stake: 10,
      publicationStatus: PublicationStatus.UNPUBLISHED,
      publishedAt: new Date("2025-10-28T12:00:00.000Z"),
      settlementStatus: SettlementStatus.WON,
      isFeatured: false,
      isDemo: true,
      analysisOverview:
        "Seed demo analysis for local development. This record is labeled as seed data and is not a live tip.",
      recentForm:
        "Form notes were not imported from a licensed provider in this seed.",
      headToHead: "H2H details intentionally left as placeholder seed text.",
      predictionRationale:
        "Selected as a development fixture to exercise publication and settlement flows.",
      counterarguments: "Derbies are volatile; seed content is illustrative only.",
      statisticalAssessment:
        "No calibrated probability model was applied for seed data.",
      confidenceLevel: "editorial",
      confidenceNote: "Editorial seed confidence — not a calibrated probability.",
      createdById: admin.id,
      updatedById: admin.id,
      sources: {
        create: [
          {
            title: "Seed documentation",
            url: "https://example.com/prediq-seed",
            retrievedAt: new Date("2025-10-28T11:00:00.000Z"),
            notes: "Example source URL for development only",
            isVerified: false,
          },
        ],
      },
    },
  });

  await prisma.resultSettlement.createMany({
    data: [
      {
        predictionId: published.id,
        status: SettlementStatus.WON,
        previousStatus: SettlementStatus.PENDING,
        finalHomeScore: 2,
        finalAwayScore: 1,
        notes: "Seed settlement",
        verificationSource: "seed",
        settledById: admin.id,
      },
    ],
    skipDuplicates: true,
  });

  await prisma.prediction.upsert({
    where: { slug: "arsenal-liverpool-btts-pending-seed" },
    update: {
      isDemo: true,
      isFeatured: false,
      publicationStatus: PublicationStatus.UNPUBLISHED,
    },
    create: {
      slug: "arsenal-liverpool-btts-pending-seed",
      title: "Arsenal vs Liverpool — Both teams to score (seed demo)",
      sportId: sport.id,
      competitionId: premier.id,
      matchId: eplMatch.id,
      marketType: PredictionMarketType.BOTH_TEAMS_TO_SCORE,
      marketLabel: "Both Teams To Score",
      selection: "YES",
      oddsAtPublication: 1.72,
      stake: 10,
      publicationStatus: PublicationStatus.UNPUBLISHED,
      publishedAt: new Date("2025-12-01T09:00:00.000Z"),
      settlementStatus: SettlementStatus.PENDING,
      isFeatured: false,
      isDemo: true,
      analysisOverview:
        "Published seed demo awaiting settlement. Not a live commercial tip.",
      predictionRationale: "Used to demonstrate pending public status handling.",
      createdById: admin.id,
      updatedById: admin.id,
    },
  });

  await prisma.prediction.upsert({
    where: { slug: "draft-private-seed" },
    update: { isDemo: true },
    create: {
      slug: "draft-private-seed",
      title: "Private draft — must not appear publicly",
      sportId: sport.id,
      competitionId: premier.id,
      matchId: eplMatch.id,
      marketType: PredictionMarketType.OVER_UNDER,
      marketLabel: "Over/Under 2.5",
      selection: "OVER",
      selectionDetail: "2.5",
      publicationStatus: PublicationStatus.DRAFT,
      settlementStatus: SettlementStatus.PENDING,
      isDemo: true,
      analysisOverview: "This draft must remain private.",
      createdById: admin.id,
      updatedById: admin.id,
    },
  });

  await prisma.siteSettings.update({
    where: { id: "default" },
    data: { featuredPredictionId: null },
  });

  console.log("Seed complete.");
  console.log(`Admin: ${email}`);
  console.log("Demo catalog uses provider key 'seed' with logoMissing=true and isDemo=true.");
  console.log("Demo predictions are unpublished and excluded from the public site.");
  console.log("Configure API_FOOTBALL_KEY and run npm run sync:sports for licensed data.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
