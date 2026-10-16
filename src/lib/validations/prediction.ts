import { z } from "zod";

export const marketTypeSchema = z.enum([
  "MATCH_RESULT_1X2",
  "DOUBLE_CHANCE",
  "OVER_UNDER",
  "BOTH_TEAMS_TO_SCORE",
  "DRAW_NO_BET",
  "OTHER",
]);

export const sourceSchema = z.object({
  title: z.string().min(1).max(200),
  url: z.string().url().max(2000),
  retrievedAt: z.coerce.date(),
  notes: z.string().max(2000).optional().nullable(),
  isVerified: z.boolean().optional().default(false),
});

export const predictionUpsertSchema = z.object({
  title: z.string().min(3).max(200),
  sportId: z.string().min(1),
  competitionId: z.string().min(1),
  matchId: z.string().min(1),
  marketType: marketTypeSchema,
  marketLabel: z.string().min(1).max(120),
  selection: z.string().min(1).max(120),
  selectionDetail: z.string().max(120).optional().nullable(),
  oddsAtPublication: z.coerce.number().gt(1).max(1000).optional().nullable(),
  stake: z.coerce.number().gt(0).max(1_000_000).optional().nullable(),
  confidenceLevel: z.string().max(40).optional().nullable(),
  confidenceNote: z.string().max(500).optional().nullable(),
  analysisOverview: z.string().max(20000).optional().nullable(),
  recentForm: z.string().max(20000).optional().nullable(),
  headToHead: z.string().max(20000).optional().nullable(),
  homeAwayStats: z.string().max(20000).optional().nullable(),
  injuriesSuspensions: z.string().max(20000).optional().nullable(),
  expectedLineups: z.string().max(20000).optional().nullable(),
  tacticalAnalysis: z.string().max(20000).optional().nullable(),
  psychologicalContext: z.string().max(20000).optional().nullable(),
  statisticalAssessment: z.string().max(20000).optional().nullable(),
  predictionRationale: z.string().max(20000).optional().nullable(),
  counterarguments: z.string().max(20000).optional().nullable(),
  showOverview: z.boolean().optional(),
  showRecentForm: z.boolean().optional(),
  showHeadToHead: z.boolean().optional(),
  showHomeAwayStats: z.boolean().optional(),
  showInjuries: z.boolean().optional(),
  showLineups: z.boolean().optional(),
  showTactical: z.boolean().optional(),
  showPsychological: z.boolean().optional(),
  showStatistical: z.boolean().optional(),
  showRationale: z.boolean().optional(),
  showCounterarguments: z.boolean().optional(),
  showSources: z.boolean().optional(),
  isFeatured: z.boolean().optional(),
  sources: z.array(sourceSchema).max(50).optional(),
});

export const settleSchema = z.object({
  predictionId: z.string().min(1),
  status: z.enum(["PENDING", "WON", "LOST", "VOID"]).optional(),
  finalHomeScore: z.coerce.number().int().min(0).max(99).optional().nullable(),
  finalAwayScore: z.coerce.number().int().min(0).max(99).optional().nullable(),
  notes: z.string().max(5000).optional().nullable(),
  verificationSource: z.string().max(2000).optional().nullable(),
  matchAbandoned: z.boolean().optional().default(false),
  useAutomaticRules: z.boolean().optional().default(true),
});

export const publicPredictionFilterSchema = z.object({
  q: z.string().max(120).optional(),
  sport: z.string().max(80).optional(),
  competition: z.string().max(120).optional(),
  country: z.string().max(80).optional(),
  market: marketTypeSchema.optional(),
  status: z.enum(["PENDING", "WON", "LOST", "VOID"]).optional(),
  from: z.coerce.date().optional(),
  to: z.coerce.date().optional(),
  page: z.coerce.number().int().min(1).max(1000).optional().default(1),
  pageSize: z.coerce.number().int().min(1).max(50).optional().default(12),
  sort: z.enum(["published_desc", "published_asc"]).optional().default("published_desc"),
});

export type PredictionUpsertInput = z.infer<typeof predictionUpsertSchema>;
export type SettleInput = z.infer<typeof settleSchema>;
