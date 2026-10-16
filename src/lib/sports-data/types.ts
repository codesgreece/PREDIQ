export type ProviderCompetition = {
  providerRef: string;
  name: string;
  shortName?: string | null;
  type?: string | null;
  countryCode?: string | null;
  countryName?: string | null;
  logoUrl?: string | null;
  logoAttribution?: string | null;
  seasonName?: string | null;
  seasonYearStart?: number | null;
  seasonYearEnd?: number | null;
};

export type ProviderTeam = {
  providerRef: string;
  name: string;
  shortName?: string | null;
  countryCode?: string | null;
  countryName?: string | null;
  logoUrl?: string | null;
  logoAttribution?: string | null;
  competitionProviderRef: string;
  seasonName?: string | null;
};

export type SyncProgressEvent = {
  level: "info" | "warn" | "error";
  message: string;
  at: string;
};

export interface SportsDataAdapter {
  key: string;
  name: string;
  websiteUrl?: string;
  isConfigured(): boolean;
  configurationHelp(): string;
  fetchCompetitions(): Promise<ProviderCompetition[]>;
  fetchTeamsForCompetition(
    competitionProviderRef: string,
    season?: string | null,
  ): Promise<ProviderTeam[]>;
}
