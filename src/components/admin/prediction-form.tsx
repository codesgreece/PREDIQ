"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

type Catalog = {
  sports: Array<{ id: string; name: string }>;
  competitions: Array<{
    id: string;
    name: string;
    sportId: string;
    seasons: Array<{ id: string; name: string }>;
  }>;
  teams: Array<{ id: string; name: string; sportId: string }>;
};

type MatchItem = {
  id: string;
  homeTeam: { name: string };
  awayTeam: { name: string };
  kickoffAt: string | null;
};

type PredictionInitial = {
  id: string;
  title: string;
  sportId: string;
  competitionId: string;
  matchId: string;
  marketType: string;
  marketLabel: string;
  selection: string;
  selectionDetail: string | null;
  oddsAtPublication: number | null;
  stake: number | null;
  publicationStatus: string;
  settlementStatus: string;
  analysisOverview: string | null;
  recentForm: string | null;
  headToHead: string | null;
  homeAwayStats: string | null;
  injuriesSuspensions: string | null;
  expectedLineups: string | null;
  tacticalAnalysis: string | null;
  psychologicalContext: string | null;
  statisticalAssessment: string | null;
  predictionRationale: string | null;
  counterarguments: string | null;
  confidenceLevel: string | null;
  confidenceNote: string | null;
  isFeatured: boolean;
  slug: string;
};

export function PredictionForm({
  initial,
}: {
  initial?: PredictionInitial;
}) {
  const router = useRouter();
  const [catalog, setCatalog] = useState<Catalog | null>(null);
  const [matches, setMatches] = useState<MatchItem[]>([]);
  const [csrfToken, setCsrfToken] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [researchNote, setResearchNote] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const [sportId, setSportId] = useState(initial?.sportId || "");
  const [competitionId, setCompetitionId] = useState(initial?.competitionId || "");
  const [seasonId, setSeasonId] = useState("");
  const [matchId, setMatchId] = useState(initial?.matchId || "");
  const [homeTeamId, setHomeTeamId] = useState("");
  const [awayTeamId, setAwayTeamId] = useState("");
  const [title, setTitle] = useState(initial?.title || "");
  const [marketType, setMarketType] = useState(initial?.marketType || "MATCH_RESULT_1X2");
  const [marketLabel, setMarketLabel] = useState(initial?.marketLabel || "Match Result (1X2)");
  const [selection, setSelection] = useState(initial?.selection || "HOME");
  const [selectionDetail, setSelectionDetail] = useState(initial?.selectionDetail || "");
  const [odds, setOdds] = useState(
    initial?.oddsAtPublication != null ? String(initial.oddsAtPublication) : "",
  );
  const [stake, setStake] = useState(initial?.stake != null ? String(initial.stake) : "");
  const [analysisOverview, setAnalysisOverview] = useState(initial?.analysisOverview || "");
  const [recentForm, setRecentForm] = useState(initial?.recentForm || "");
  const [headToHead, setHeadToHead] = useState(initial?.headToHead || "");
  const [homeAwayStats, setHomeAwayStats] = useState(initial?.homeAwayStats || "");
  const [injuries, setInjuries] = useState(initial?.injuriesSuspensions || "");
  const [lineups, setLineups] = useState(initial?.expectedLineups || "");
  const [tactical, setTactical] = useState(initial?.tacticalAnalysis || "");
  const [psychological, setPsychological] = useState(initial?.psychologicalContext || "");
  const [statistical, setStatistical] = useState(initial?.statisticalAssessment || "");
  const [rationale, setRationale] = useState(initial?.predictionRationale || "");
  const [counterarguments, setCounterarguments] = useState(initial?.counterarguments || "");
  const [confidenceLevel, setConfidenceLevel] = useState(initial?.confidenceLevel || "editorial");
  const [confidenceNote, setConfidenceNote] = useState(initial?.confidenceNote || "");
  const [sourceTitle, setSourceTitle] = useState("");
  const [sourceUrl, setSourceUrl] = useState("");

  useEffect(() => {
    Promise.all([
      fetch("/api/admin/catalog").then((r) => r.json()),
      fetch("/api/auth/me").then((r) => r.json()),
    ]).then(([cat, me]) => {
      setCatalog(cat);
      setCsrfToken(me.csrfToken || "");
      if (!sportId && cat.sports?.[0]) setSportId(cat.sports[0].id);
    });
  }, [sportId]);

  const competitions = useMemo(
    () => (catalog?.competitions || []).filter((c) => !sportId || c.sportId === sportId),
    [catalog, sportId],
  );
  const seasons = useMemo(
    () => competitions.find((c) => c.id === competitionId)?.seasons || [],
    [competitions, competitionId],
  );
  const teams = useMemo(
    () => (catalog?.teams || []).filter((t) => !sportId || t.sportId === sportId),
    [catalog, sportId],
  );

  useEffect(() => {
    if (!competitionId) return;
    const qs = new URLSearchParams({ competitionId });
    fetch(`/api/admin/matches?${qs}`)
      .then((r) => r.json())
      .then((d) => setMatches(d.items || []));
  }, [competitionId]);

  function payload() {
    return {
      title,
      sportId,
      competitionId,
      matchId,
      marketType,
      marketLabel,
      selection,
      selectionDetail: selectionDetail || null,
      oddsAtPublication: odds ? Number(odds) : null,
      stake: stake ? Number(stake) : null,
      analysisOverview,
      recentForm,
      headToHead,
      homeAwayStats,
      injuriesSuspensions: injuries,
      expectedLineups: lineups,
      tacticalAnalysis: tactical,
      psychologicalContext: psychological,
      statisticalAssessment: statistical,
      predictionRationale: rationale,
      counterarguments,
      confidenceLevel,
      confidenceNote,
      sources:
        sourceTitle && sourceUrl
          ? [
              {
                title: sourceTitle,
                url: sourceUrl,
                retrievedAt: new Date().toISOString(),
                isVerified: false,
              },
            ]
          : undefined,
    };
  }

  async function createMatch() {
    setError(null);
    if (!homeTeamId || !awayTeamId) {
      setError("Select home and away teams to create a match record");
      return;
    }
    const res = await fetch("/api/admin/matches", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-csrf-token": csrfToken,
      },
      body: JSON.stringify({
        sportId,
        competitionId,
        seasonId: seasonId || null,
        homeTeamId,
        awayTeamId,
        venueVerified: false,
      }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error || "Could not create match");
      return;
    }
    setMatchId(data.match.id);
    setMatches((prev) => [data.match, ...prev]);
    setMessage("Match record created. Continue with the prediction draft.");
  }

  async function saveDraft(e?: FormEvent) {
    e?.preventDefault();
    setSaving(true);
    setError(null);
    setMessage(null);
    try {
      const res = await fetch(
        initial ? `/api/admin/predictions/${initial.id}` : "/api/admin/predictions",
        {
          method: initial ? "PATCH" : "POST",
          headers: {
            "Content-Type": "application/json",
            "x-csrf-token": csrfToken,
          },
          body: JSON.stringify(payload()),
        },
      );
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Save failed");
        setSaving(false);
        return;
      }
      setMessage("Draft saved. Nothing was published.");
      if (!initial) {
        router.push(`/admin/predictions/${data.prediction.id}`);
      } else {
        router.refresh();
      }
    } catch {
      setError("Network error");
    } finally {
      setSaving(false);
    }
  }

  async function runAction(action: string, extra?: object) {
    if (!initial) return;
    setError(null);
    const res = await fetch(`/api/admin/predictions/${initial.id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        "x-csrf-token": csrfToken,
      },
      body: JSON.stringify({ action, ...extra }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error || "Action failed");
      return;
    }
    setMessage(`Action completed: ${action}`);
    router.refresh();
  }

  async function generateResearch() {
    if (!matchId) {
      setError("Select a match before generating research");
      return;
    }
    setResearchNote("Generating research draft…");
    const res = await fetch("/api/admin/research", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-csrf-token": csrfToken,
      },
      body: JSON.stringify({
        matchId,
        predictionId: initial?.id || null,
      }),
    });
    const data = await res.json();
    if (!res.ok) {
      setResearchNote(null);
      setError(data.error || "Research failed");
      return;
    }
    const draft = data.draft;
    if (draft.structuredDraft) setAnalysisOverview(draft.structuredDraft);
    if (draft.strengths) setRationale((v) => v || draft.strengths);
    if (draft.risks) setCounterarguments((v) => v || draft.risks);
    if (draft.summary) setStatistical((v) => v || draft.summary);
    setResearchNote(
      [
        "Research draft attached for editing. It was not published.",
        ...(draft.notes || []),
        draft.searchRan
          ? "Web search reported as executed."
          : "Web search did not run.",
        draft.aiProvider
          ? `AI provider: ${draft.aiProvider} (${draft.modelName})`
          : "AI API key missing or unused — template scaffold only.",
      ].join(" "),
    );
  }

  return (
    <form onSubmit={saveDraft} className="space-y-8">
      <section className="grid gap-4 rounded-xl border border-[var(--border)] p-5 md:grid-cols-2">
        <h2 className="md:col-span-2 text-lg">1–5. Match selection</h2>
        <label className="text-sm">
          Sport
          <select
            className="mt-1 h-10 w-full rounded-md border border-[var(--border)] bg-[var(--bg-secondary)] px-3"
            value={sportId}
            onChange={(e) => setSportId(e.target.value)}
            required
          >
            <option value="">Select sport</option>
            {(catalog?.sports || []).map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </label>
        <label className="text-sm">
          Competition
          <select
            className="mt-1 h-10 w-full rounded-md border border-[var(--border)] bg-[var(--bg-secondary)] px-3"
            value={competitionId}
            onChange={(e) => setCompetitionId(e.target.value)}
            required
          >
            <option value="">Select competition</option>
            {competitions.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </label>
        <label className="text-sm">
          Season (optional)
          <select
            className="mt-1 h-10 w-full rounded-md border border-[var(--border)] bg-[var(--bg-secondary)] px-3"
            value={seasonId}
            onChange={(e) => setSeasonId(e.target.value)}
          >
            <option value="">No season</option>
            {seasons.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </label>
        <label className="text-sm">
          Existing match
          <select
            className="mt-1 h-10 w-full rounded-md border border-[var(--border)] bg-[var(--bg-secondary)] px-3"
            value={matchId}
            onChange={(e) => setMatchId(e.target.value)}
            required
          >
            <option value="">Select match</option>
            {matches.map((m) => (
              <option key={m.id} value={m.id}>
                {m.homeTeam.name} vs {m.awayTeam.name}
              </option>
            ))}
          </select>
        </label>
        <label className="text-sm">
          Or create match — home team
          <select
            className="mt-1 h-10 w-full rounded-md border border-[var(--border)] bg-[var(--bg-secondary)] px-3"
            value={homeTeamId}
            onChange={(e) => setHomeTeamId(e.target.value)}
          >
            <option value="">Home team</option>
            {teams.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>
        </label>
        <label className="text-sm">
          Away team
          <select
            className="mt-1 h-10 w-full rounded-md border border-[var(--border)] bg-[var(--bg-secondary)] px-3"
            value={awayTeamId}
            onChange={(e) => setAwayTeamId(e.target.value)}
          >
            <option value="">Away team</option>
            {teams.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>
        </label>
        <div className="md:col-span-2">
          <Button type="button" variant="secondary" onClick={createMatch}>
            Create match record
          </Button>
        </div>
      </section>

      <section className="grid gap-4 rounded-xl border border-[var(--border)] p-5 md:grid-cols-2">
        <h2 className="md:col-span-2 text-lg">6–8. Market & odds</h2>
        <label className="text-sm md:col-span-2">
          Title
          <Input value={title} onChange={(e) => setTitle(e.target.value)} required />
        </label>
        <label className="text-sm">
          Market type
          <select
            className="mt-1 h-10 w-full rounded-md border border-[var(--border)] bg-[var(--bg-secondary)] px-3"
            value={marketType}
            onChange={(e) => setMarketType(e.target.value)}
          >
            <option value="MATCH_RESULT_1X2">1X2</option>
            <option value="DOUBLE_CHANCE">Double chance</option>
            <option value="OVER_UNDER">Over/Under</option>
            <option value="BOTH_TEAMS_TO_SCORE">BTTS</option>
            <option value="DRAW_NO_BET">Draw no bet</option>
            <option value="OTHER">Other (manual settlement)</option>
          </select>
        </label>
        <label className="text-sm">
          Market label
          <Input value={marketLabel} onChange={(e) => setMarketLabel(e.target.value)} required />
        </label>
        <label className="text-sm">
          Selection
          <Input value={selection} onChange={(e) => setSelection(e.target.value)} required />
        </label>
        <label className="text-sm">
          Selection detail (e.g. 2.5 for O/U)
          <Input
            value={selectionDetail}
            onChange={(e) => setSelectionDetail(e.target.value)}
          />
        </label>
        <label className="text-sm">
          Odds at publication
          <Input value={odds} onChange={(e) => setOdds(e.target.value)} />
        </label>
        <label className="text-sm">
          Stake (for ROI)
          <Input value={stake} onChange={(e) => setStake(e.target.value)} />
        </label>
      </section>

      <section className="space-y-4 rounded-xl border border-[var(--border)] p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-lg">9. Analysis editor</h2>
          <Button type="button" variant="outline" onClick={generateResearch}>
            AI-assisted research draft
          </Button>
        </div>
        {researchNote ? (
          <p className="text-sm text-[var(--text-muted)]">{researchNote}</p>
        ) : null}
        <Textarea value={analysisOverview} onChange={(e) => setAnalysisOverview(e.target.value)} placeholder="Match overview" />
        <Textarea value={recentForm} onChange={(e) => setRecentForm(e.target.value)} placeholder="Recent form" />
        <Textarea value={headToHead} onChange={(e) => setHeadToHead(e.target.value)} placeholder="Head-to-head" />
        <Textarea value={homeAwayStats} onChange={(e) => setHomeAwayStats(e.target.value)} placeholder="Home/away statistics" />
        <Textarea value={injuries} onChange={(e) => setInjuries(e.target.value)} placeholder="Injuries and suspensions" />
        <Textarea value={lineups} onChange={(e) => setLineups(e.target.value)} placeholder="Expected lineups (only with sources)" />
        <Textarea value={tactical} onChange={(e) => setTactical(e.target.value)} placeholder="Tactical analysis" />
        <Textarea value={psychological} onChange={(e) => setPsychological(e.target.value)} placeholder="Psychological context" />
        <Textarea value={statistical} onChange={(e) => setStatistical(e.target.value)} placeholder="Statistical assessment" />
        <Textarea value={rationale} onChange={(e) => setRationale(e.target.value)} placeholder="Prediction rationale" />
        <Textarea value={counterarguments} onChange={(e) => setCounterarguments(e.target.value)} placeholder="Counterarguments" />
        <div className="grid gap-4 md:grid-cols-2">
          <Input
            value={confidenceLevel}
            onChange={(e) => setConfidenceLevel(e.target.value)}
            placeholder="Confidence methodology label"
          />
          <Input
            value={confidenceNote}
            onChange={(e) => setConfidenceNote(e.target.value)}
            placeholder="Confidence note (not a calibrated probability)"
          />
        </div>
      </section>

      <section className="grid gap-4 rounded-xl border border-[var(--border)] p-5 md:grid-cols-2">
        <h2 className="md:col-span-2 text-lg">10. Sources</h2>
        <Input
          value={sourceTitle}
          onChange={(e) => setSourceTitle(e.target.value)}
          placeholder="Source title"
        />
        <Input
          value={sourceUrl}
          onChange={(e) => setSourceUrl(e.target.value)}
          placeholder="https://..."
        />
      </section>

      {error ? <p className="text-sm text-red-300">{error}</p> : null}
      {message ? <p className="text-sm text-[var(--neon)]">{message}</p> : null}

      <div className="flex flex-wrap gap-3">
        <Button type="submit" disabled={saving}>
          {saving ? "Saving…" : "Save draft"}
        </Button>
        {initial ? (
          <>
            <Button type="button" variant="outline" onClick={() => runAction("publish")}>
              Publish
            </Button>
            <Button type="button" variant="secondary" onClick={() => runAction("unpublish")}>
              Unpublish
            </Button>
            <Button type="button" variant="secondary" onClick={() => runAction("archive")}>
              Archive
            </Button>
            <Button
              type="button"
              variant="ghost"
              onClick={() =>
                runAction("feature", { featured: !initial.isFeatured })
              }
            >
              {initial.isFeatured ? "Unfeature" : "Feature"}
            </Button>
            {initial.publicationStatus === "PUBLISHED" ? (
              <a
                href={`/predictions/${initial.slug}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex h-10 items-center text-sm text-[var(--neon)]"
              >
                Preview public page
              </a>
            ) : (
              <span className="inline-flex h-10 items-center text-sm text-[var(--text-muted)]">
                Preview available after publish
              </span>
            )}
          </>
        ) : null}
      </div>
    </form>
  );
}
