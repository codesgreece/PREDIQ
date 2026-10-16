import { getEnv } from "@/lib/env";
import { prisma } from "@/lib/db";
import { writeAuditLog } from "@/lib/audit";

export type ResearchDraft = {
  summary: string;
  strengths: string;
  weaknesses: string;
  risks: string;
  marketSuggestions: string;
  structuredDraft: string;
  verifiedFacts: string;
  uncertainClaims: string;
  sources: Array<{ title: string; url: string; retrievedAt: string }>;
  searchRan: boolean;
  aiProvider: string | null;
  modelName: string | null;
  notes: string[];
};

/**
 * Modular AI-assisted research workflow.
 * Never publishes. Never invents source URLs or injuries.
 * If AI/search credentials are missing, returns an explicit incomplete draft.
 */
export async function generateResearchDraft(params: {
  matchId: string;
  predictionId?: string | null;
  actorId: string;
}): Promise<{ reportId: string; draft: ResearchDraft }> {
  const match = await prisma.match.findUnique({
    where: { id: params.matchId },
    include: {
      homeTeam: true,
      awayTeam: true,
      competition: { include: { country: true } },
      season: true,
    },
  });
  if (!match) throw new Error("Match not found");

  const env = getEnv();
  const notes: string[] = [];
  const verifiedFacts: string[] = [
    `Match: ${match.homeTeam.name} vs ${match.awayTeam.name}`,
    `Competition: ${match.competition.name}`,
  ];
  if (match.kickoffAt) {
    verifiedFacts.push(`Kickoff (stored): ${match.kickoffAt.toISOString()}`);
  } else {
    notes.push("Kickoff time is not verified in the database.");
  }
  if (match.venue && match.venueVerified) {
    verifiedFacts.push(`Venue (verified): ${match.venue}`);
  } else if (match.venue) {
    notes.push("Venue is present but not marked verified.");
  } else {
    notes.push("Venue is missing.");
  }

  const uncertainClaims: string[] = [
    "Injuries, suspensions, and expected lineups were not retrieved from a licensed live source in this run.",
    "No web search was executed unless a search provider integration is configured and succeeds.",
  ];

  const searchRan = false;
  let aiProvider: string | null = null;
  let modelName: string | null = null;
  let summary =
    "Structured research shell generated from stored match metadata. Administrator review is required before any publication.";
  let strengths =
    "Insufficient licensed recent-form data in PREDIQ to assert team strengths automatically.";
  let weaknesses =
    "Insufficient licensed recent-form data in PREDIQ to assert team weaknesses automatically.";
  let risks =
    "Do not treat missing availability information as confirmation that squads are complete.";
  let marketSuggestions =
    "No market recommendation is auto-selected. Choose a market only after manual research.";
  let structuredDraft = [
    "## Match overview",
    `${match.homeTeam.name} vs ${match.awayTeam.name} — ${match.competition.name}.`,
    "",
    "## Data gaps",
    ...notes.map((n) => `- ${n}`),
    "",
    "## Next steps for the administrator",
    "- Verify kickoff, venue, and competition context.",
    "- Collect licensed statistics and availability notes with source URLs and timestamps.",
    "- Separate verified facts from uncertain claims before publishing.",
  ].join("\n");

  const sources: ResearchDraft["sources"] = [];

  if (!env.AI_API_KEY?.trim()) {
    notes.push(
      "AI_API_KEY is not configured. Draft content is a non-inventive template for manual editing.",
    );
  } else {
    try {
      const prompt = {
        role: "system",
        content:
          "You assist a sports prediction editor. Never invent injuries, quotes, lineups, odds, or source URLs. If data is missing, say so. Return concise JSON with keys: summary, strengths, weaknesses, risks, marketSuggestions, structuredDraft, uncertainClaims.",
      };
      const user = {
        role: "user",
        content: JSON.stringify({
          home: match.homeTeam.name,
          away: match.awayTeam.name,
          competition: match.competition.name,
          kickoffAt: match.kickoffAt,
          venue: match.venue,
          verifiedFacts,
          instruction:
            "Produce an analysis scaffold only from the provided facts. Explicitly list missing research items.",
        }),
      };
      const res = await fetch(`${env.AI_API_BASE_URL.replace(/\/$/, "")}/chat/completions`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${env.AI_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: env.AI_MODEL,
          temperature: 0.2,
          response_format: { type: "json_object" },
          messages: [prompt, user],
        }),
      });
      if (!res.ok) {
        notes.push(`AI provider request failed with status ${res.status}.`);
      } else {
        const json = (await res.json()) as {
          choices?: Array<{ message?: { content?: string } }>;
        };
        const content = json.choices?.[0]?.message?.content;
        if (content) {
          const parsed = JSON.parse(content) as Partial<ResearchDraft>;
          summary = parsed.summary || summary;
          strengths = parsed.strengths || strengths;
          weaknesses = parsed.weaknesses || weaknesses;
          risks = parsed.risks || risks;
          marketSuggestions = parsed.marketSuggestions || marketSuggestions;
          structuredDraft = parsed.structuredDraft || structuredDraft;
          if (parsed.uncertainClaims) {
            uncertainClaims.push(String(parsed.uncertainClaims));
          }
          aiProvider = "openai-compatible";
          modelName = env.AI_MODEL;
        }
      }
    } catch (err) {
      notes.push(
        `AI assistance failed: ${err instanceof Error ? err.message : String(err)}`,
      );
    }
  }

  notes.push(
    "Web search integration is modular and not claimed as completed unless searchRan is true.",
  );

  const draft: ResearchDraft = {
    summary,
    strengths,
    weaknesses,
    risks,
    marketSuggestions,
    structuredDraft,
    verifiedFacts: verifiedFacts.join("\n"),
    uncertainClaims: uncertainClaims.join("\n"),
    sources,
    searchRan,
    aiProvider,
    modelName,
    notes,
  };

  const report = await prisma.researchReport.create({
    data: {
      predictionId: params.predictionId ?? null,
      matchId: params.matchId,
      createdById: params.actorId,
      status: "DRAFT",
      summary: draft.summary,
      strengths: draft.strengths,
      weaknesses: draft.weaknesses,
      risks: draft.risks,
      marketSuggestions: draft.marketSuggestions,
      structuredDraft: draft.structuredDraft,
      verifiedFacts: draft.verifiedFacts,
      uncertainClaims: draft.uncertainClaims,
      sourcesJson: JSON.stringify(draft.sources),
      searchRan: draft.searchRan,
      aiProvider: draft.aiProvider,
      modelName: draft.modelName,
    },
  });

  await writeAuditLog({
    actorId: params.actorId,
    action: "RESEARCH_GENERATE",
    entityType: "ResearchReport",
    entityId: report.id,
    summary: `Generated research draft for match ${match.homeTeam.name} vs ${match.awayTeam.name}`,
  });

  return { reportId: report.id, draft };
}
