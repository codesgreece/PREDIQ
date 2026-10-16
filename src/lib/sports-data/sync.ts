import { prisma } from "@/lib/db";
import { writeAuditLog } from "@/lib/audit";
import { ApiFootballAdapter } from "@/lib/sports-data/api-football";
import type { SportsDataAdapter, SyncProgressEvent } from "@/lib/sports-data/types";
import { slugify, uniqueSlug } from "@/lib/utils";

function getAdapter(key?: string): SportsDataAdapter {
  const adapters: SportsDataAdapter[] = [new ApiFootballAdapter()];
  if (key) {
    const found = adapters.find((a) => a.key === key);
    if (!found) throw new Error(`Unknown sports data adapter: ${key}`);
    return found;
  }
  return adapters[0]!;
}

async function ensureSportFootball() {
  return prisma.sport.upsert({
    where: { slug: "football" },
    update: { name: "Football" },
    create: { slug: "football", name: "Football" },
  });
}

async function ensureProvider(adapter: SportsDataAdapter) {
  return prisma.dataProvider.upsert({
    where: { key: adapter.key },
    update: {
      name: adapter.name,
      websiteUrl: adapter.websiteUrl ?? null,
      isActive: true,
    },
    create: {
      key: adapter.key,
      name: adapter.name,
      websiteUrl: adapter.websiteUrl ?? null,
      notes: adapter.configurationHelp(),
      isActive: true,
    },
  });
}

async function ensureCountry(code: string | null | undefined, name: string | null | undefined) {
  if (!code && !name) return null;
  const countryCode = (code || slugify(name || "unknown").slice(0, 8)).toUpperCase();
  return prisma.country.upsert({
    where: { code: countryCode },
    update: { name: name || countryCode },
    create: { code: countryCode, name: name || countryCode },
  });
}

/**
 * Idempotent competition/team synchronization through the configured adapter.
 */
export async function syncSportsCatalog(params: {
  adapterKey?: string;
  triggeredById?: string | null;
  maxCompetitions?: number;
}): Promise<{
  jobId: string;
  status: string;
  competitionsUpserted: number;
  teamsUpserted: number;
  logosMissing: number;
  events: SyncProgressEvent[];
  configurationRequired?: string;
}> {
  const adapter = getAdapter(params.adapterKey);
  const provider = await ensureProvider(adapter);
  const events: SyncProgressEvent[] = [];
  const push = (level: SyncProgressEvent["level"], message: string) => {
    events.push({ level, message, at: new Date().toISOString() });
  };

  const job = await prisma.syncJob.create({
    data: {
      providerId: provider.id,
      triggeredById: params.triggeredById ?? null,
      status: "RUNNING",
      startedAt: new Date(),
    },
  });

  if (!adapter.isConfigured()) {
    const help = adapter.configurationHelp();
    push("error", help);
    await prisma.syncJob.update({
      where: { id: job.id },
      data: {
        status: "FAILED",
        finishedAt: new Date(),
        errorsJson: JSON.stringify([help]),
        logJson: JSON.stringify(events),
      },
    });
    return {
      jobId: job.id,
      status: "FAILED",
      competitionsUpserted: 0,
      teamsUpserted: 0,
      logosMissing: 0,
      events,
      configurationRequired: help,
    };
  }

  let competitionsUpserted = 0;
  let teamsUpserted = 0;
  let logosMissing = 0;
  const errors: string[] = [];

  try {
    const sport = await ensureSportFootball();
    const competitions = await adapter.fetchCompetitions();
    const limited = params.maxCompetitions
      ? competitions.slice(0, params.maxCompetitions)
      : competitions;
    push("info", `Fetched ${competitions.length} competitions; processing ${limited.length}`);

    for (const c of limited) {
      try {
        const country = await ensureCountry(c.countryCode, c.countryName);
        const slugBase = uniqueSlug(
          [c.countryCode || c.countryName, c.name].filter(Boolean).join(" "),
          c.providerRef,
        );
        const existing = await prisma.competition.findUnique({
          where: {
            providerId_providerRef: {
              providerId: provider.id,
              providerRef: c.providerRef,
            },
          },
        });
        const logoMissing = !c.logoUrl;
        if (logoMissing) logosMissing += 1;

        const competition = existing
          ? await prisma.competition.update({
              where: { id: existing.id },
              data: {
                name: c.name,
                shortName: c.shortName ?? c.name,
                type: c.type ?? null,
                countryId: country?.id ?? null,
                logoUrl: c.logoUrl ?? existing.logoUrl,
                logoAttribution: c.logoAttribution ?? existing.logoAttribution,
                logoMissing,
                isActive: true,
              },
            })
          : await prisma.competition.create({
              data: {
                slug: slugBase,
                name: c.name,
                shortName: c.shortName ?? c.name,
                type: c.type ?? null,
                sportId: sport.id,
                countryId: country?.id ?? null,
                providerId: provider.id,
                providerRef: c.providerRef,
                logoUrl: c.logoUrl ?? null,
                logoAttribution: c.logoAttribution ?? null,
                logoMissing,
              },
            });
        competitionsUpserted += 1;

        if (c.seasonName) {
          await prisma.season.upsert({
            where: {
              competitionId_name: {
                competitionId: competition.id,
                name: c.seasonName,
              },
            },
            update: {
              yearStart: c.seasonYearStart ?? null,
              yearEnd: c.seasonYearEnd ?? null,
              isCurrent: true,
              providerRef: c.seasonName,
            },
            create: {
              competitionId: competition.id,
              name: c.seasonName,
              yearStart: c.seasonYearStart ?? null,
              yearEnd: c.seasonYearEnd ?? null,
              isCurrent: true,
              providerRef: c.seasonName,
            },
          });
        }

        const teams = await adapter.fetchTeamsForCompetition(
          c.providerRef,
          c.seasonName,
        );
        const season = c.seasonName
          ? await prisma.season.findUnique({
              where: {
                competitionId_name: {
                  competitionId: competition.id,
                  name: c.seasonName,
                },
              },
            })
          : null;

        for (const t of teams) {
          const teamCountry = await ensureCountry(t.countryCode, t.countryName);
          const teamLogoMissing = !t.logoUrl;
          if (teamLogoMissing) logosMissing += 1;
          const existingTeam = await prisma.team.findUnique({
            where: {
              providerId_providerRef: {
                providerId: provider.id,
                providerRef: t.providerRef,
              },
            },
          });
          const team = existingTeam
            ? await prisma.team.update({
                where: { id: existingTeam.id },
                data: {
                  name: t.name,
                  shortName: t.shortName ?? t.name,
                  countryId: teamCountry?.id ?? null,
                  logoUrl: t.logoUrl ?? existingTeam.logoUrl,
                  logoAttribution: t.logoAttribution ?? existingTeam.logoAttribution,
                  logoMissing: teamLogoMissing,
                  isActive: true,
                },
              })
            : await prisma.team.create({
                data: {
                  slug: uniqueSlug(t.name, t.providerRef),
                  name: t.name,
                  shortName: t.shortName ?? t.name,
                  sportId: sport.id,
                  countryId: teamCountry?.id ?? null,
                  providerId: provider.id,
                  providerRef: t.providerRef,
                  logoUrl: t.logoUrl ?? null,
                  logoAttribution: t.logoAttribution ?? null,
                  logoMissing: teamLogoMissing,
                },
              });
          teamsUpserted += 1;

          const membership = await prisma.teamCompetition.findFirst({
            where: {
              teamId: team.id,
              competitionId: competition.id,
              seasonId: season?.id ?? null,
            },
          });
          if (!membership) {
            await prisma.teamCompetition.create({
              data: {
                teamId: team.id,
                competitionId: competition.id,
                seasonId: season?.id ?? null,
              },
            });
          }
        }
        push("info", `Synced ${c.name}: ${teams.length} teams`);
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        errors.push(`${c.name}: ${message}`);
        push("error", `${c.name}: ${message}`);
      }
    }

    const status =
      errors.length === 0
        ? "SUCCEEDED"
        : competitionsUpserted > 0
          ? "PARTIAL"
          : "FAILED";

    await prisma.syncJob.update({
      where: { id: job.id },
      data: {
        status,
        finishedAt: new Date(),
        competitionsUpserted,
        teamsUpserted,
        logosMissing,
        errorsJson: errors.length ? JSON.stringify(errors) : null,
        logJson: JSON.stringify(events),
      },
    });

    await writeAuditLog({
      actorId: params.triggeredById,
      action: "SYNC",
      entityType: "SyncJob",
      entityId: job.id,
      summary: `Sports catalog sync ${status}`,
      after: { competitionsUpserted, teamsUpserted, logosMissing },
    });

    return {
      jobId: job.id,
      status,
      competitionsUpserted,
      teamsUpserted,
      logosMissing,
      events,
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    push("error", message);
    await prisma.syncJob.update({
      where: { id: job.id },
      data: {
        status: "FAILED",
        finishedAt: new Date(),
        errorsJson: JSON.stringify([message]),
        logJson: JSON.stringify(events),
      },
    });
    return {
      jobId: job.id,
      status: "FAILED",
      competitionsUpserted,
      teamsUpserted,
      logosMissing,
      events,
    };
  }
}

export { getAdapter };
