import { getEnv } from "@/lib/env";
import type {
  ProviderCompetition,
  ProviderTeam,
  SportsDataAdapter,
} from "@/lib/sports-data/types";

type ApiFootballLeague = {
  league: { id: number; name: string; type: string; logo: string | null };
  country: { name: string; code: string | null; flag: string | null };
  seasons: Array<{ year: number; current: boolean }>;
};

type ApiFootballTeam = {
  team: {
    id: number;
    name: string;
    code: string | null;
    country: string | null;
    logo: string | null;
  };
};

/**
 * Adapter for API-Football (api-sports.io).
 * Coverage, rate limits, and logo licensing are governed by the provider.
 * This adapter does not scrape images from search engines.
 */
export class ApiFootballAdapter implements SportsDataAdapter {
  key = "api-football";
  name = "API-Football";
  websiteUrl = "https://www.api-football.com";

  isConfigured(): boolean {
    return Boolean(getEnv().API_FOOTBALL_KEY?.trim());
  }

  configurationHelp(): string {
    return [
      "Set API_FOOTBALL_KEY in your environment to enable competition/team synchronization.",
      "Obtain a key from https://www.api-football.com (api-sports.io).",
      "Review the provider's commercial-use terms and logo licensing before production use.",
      "Coverage reflects the leagues included in your API-Football plan — not worldwide completeness.",
    ].join(" ");
  }

  private async request<T>(path: string, query: Record<string, string> = {}): Promise<T> {
    const env = getEnv();
    if (!env.API_FOOTBALL_KEY?.trim()) {
      throw new Error(this.configurationHelp());
    }
    const url = new URL(path, env.API_FOOTBALL_BASE_URL.endsWith("/")
      ? env.API_FOOTBALL_BASE_URL
      : `${env.API_FOOTBALL_BASE_URL}/`);
    for (const [k, v] of Object.entries(query)) {
      url.searchParams.set(k, v);
    }
    const res = await fetch(url, {
      headers: {
        "x-apisports-key": env.API_FOOTBALL_KEY,
        Accept: "application/json",
      },
      cache: "no-store",
    });
    if (!res.ok) {
      throw new Error(`API-Football request failed (${res.status}) for ${path}`);
    }
    const json = (await res.json()) as {
      response: T;
      errors?: unknown;
    };
    if (json.errors && Object.keys(json.errors as object).length > 0) {
      throw new Error(`API-Football error: ${JSON.stringify(json.errors)}`);
    }
    return json.response;
  }

  async fetchCompetitions(): Promise<ProviderCompetition[]> {
    // Current-season first-division style leagues + major cups/international.
    // Exact coverage depends on the subscribed plan.
    const leagues = await this.request<ApiFootballLeague[]>("leagues", {
      current: "true",
    });

    return leagues.map((row) => {
      const current = row.seasons.find((s) => s.current) ?? row.seasons[0];
      return {
        providerRef: String(row.league.id),
        name: row.league.name,
        shortName: row.league.name,
        type: row.league.type,
        countryCode: row.country.code,
        countryName: row.country.name,
        logoUrl: row.league.logo,
        logoAttribution: "Logo provided by API-Football / api-sports.io",
        seasonName: current ? String(current.year) : null,
        seasonYearStart: current?.year ?? null,
        seasonYearEnd: current ? current.year + 1 : null,
      };
    });
  }

  async fetchTeamsForCompetition(
    competitionProviderRef: string,
    season?: string | null,
  ): Promise<ProviderTeam[]> {
    const query: Record<string, string> = {
      league: competitionProviderRef,
    };
    if (season) query.season = season;
    const teams = await this.request<ApiFootballTeam[]>("teams", query);
    return teams.map((row) => ({
      providerRef: String(row.team.id),
      name: row.team.name,
      shortName: row.team.code,
      countryName: row.team.country,
      logoUrl: row.team.logo,
      logoAttribution: "Logo provided by API-Football / api-sports.io",
      competitionProviderRef,
      seasonName: season ?? null,
    }));
  }
}
