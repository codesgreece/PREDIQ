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

  const selectClass = "control mt-1 w-full";

  return (
    <form onSubmit={saveDraft} className="space-y-4">
      <section className="admin-panel grid gap-3 md:grid-cols-2">
        <h2 className="font-[family-name:var(--font-display)] text-base md:col-span-2">
          1–5. Επιλογή αγώνα
        </h2>
        <label className="text-sm">
          <span className="field-label">Άθλημα</span>
          <select
            className={selectClass}
            value={sportId}
            onChange={(e) => setSportId(e.target.value)}
            required
          >
            <option value="">Επιλογή</option>
            {(catalog?.sports || []).map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </label>
        <label className="text-sm">
          <span className="field-label">Διοργάνωση</span>
          <select
            className={selectClass}
            value={competitionId}
            onChange={(e) => setCompetitionId(e.target.value)}
            required
          >
            <option value="">Επιλογή</option>
            {competitions.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </label>
        <label className="text-sm">
          <span className="field-label">Σεζόν (προαιρετικά)</span>
          <select
            className={selectClass}
            value={seasonId}
            onChange={(e) => setSeasonId(e.target.value)}
          >
            <option value="">Χωρίς σεζόν</option>
            {seasons.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </label>
        <label className="text-sm">
          <span className="field-label">Υπάρχων αγώνας</span>
          <select
            className={selectClass}
            value={matchId}
            onChange={(e) => setMatchId(e.target.value)}
            required
          >
            <option value="">Επιλογή</option>
            {matches.map((m) => (
              <option key={m.id} value={m.id}>
                {m.homeTeam.name} vs {m.awayTeam.name}
              </option>
            ))}
          </select>
        </label>
        <label className="text-sm">
          <span className="field-label">Νέος αγώνας — γηπεδούχος</span>
          <select
            className={selectClass}
            value={homeTeamId}
            onChange={(e) => setHomeTeamId(e.target.value)}
          >
            <option value="">Γηπεδούχος</option>
            {teams.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>
        </label>
        <label className="text-sm">
          <span className="field-label">Φιλοξενούμενος</span>
          <select
            className={selectClass}
            value={awayTeamId}
            onChange={(e) => setAwayTeamId(e.target.value)}
          >
            <option value="">Φιλοξενούμενος</option>
            {teams.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>
        </label>
        <div className="md:col-span-2">
          <Button type="button" variant="secondary" size="sm" onClick={createMatch}>
            Δημιουργία αγώνα
          </Button>
        </div>
      </section>

      <section className="admin-panel grid gap-3 md:grid-cols-2">
        <h2 className="font-[family-name:var(--font-display)] text-base md:col-span-2">
          6–8. Αγορά & αποδόσεις
        </h2>
        <label className="text-sm md:col-span-2">
          <span className="field-label">Τίτλος</span>
          <Input className="mt-1" value={title} onChange={(e) => setTitle(e.target.value)} required />
        </label>
        <label className="text-sm">
          <span className="field-label">Τύπος αγοράς</span>
          <select
            className={selectClass}
            value={marketType}
            onChange={(e) => setMarketType(e.target.value)}
          >
            <option value="MATCH_RESULT_1X2">1X2</option>
            <option value="DOUBLE_CHANCE">Double chance</option>
            <option value="OVER_UNDER">Over/Under</option>
            <option value="BOTH_TEAMS_TO_SCORE">BTTS</option>
            <option value="DRAW_NO_BET">Draw no bet</option>
            <option value="OTHER">Other</option>
          </select>
        </label>
        <label className="text-sm">
          <span className="field-label">Ετικέτα αγοράς</span>
          <Input className="mt-1" value={marketLabel} onChange={(e) => setMarketLabel(e.target.value)} required />
        </label>
        <label className="text-sm">
          <span className="field-label">Επιλογή</span>
          <Input className="mt-1" value={selection} onChange={(e) => setSelection(e.target.value)} required />
        </label>
        <label className="text-sm">
          <span className="field-label">Λεπτομέρεια (π.χ. 2.5)</span>
          <Input className="mt-1" value={selectionDetail} onChange={(e) => setSelectionDetail(e.target.value)} />
        </label>
        <label className="text-sm">
          <span className="field-label">Απόδοση</span>
          <Input className="mt-1" value={odds} onChange={(e) => setOdds(e.target.value)} />
        </label>
        <label className="text-sm">
          <span className="field-label">Stake (ROI)</span>
          <Input className="mt-1" value={stake} onChange={(e) => setStake(e.target.value)} />
        </label>
      </section>

      <section className="admin-panel space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="font-[family-name:var(--font-display)] text-base">
            9. Επεξεργαστής ανάλυσης
          </h2>
          <Button type="button" variant="outline" size="sm" onClick={generateResearch}>
            AI research draft
          </Button>
        </div>
        {researchNote ? (
          <p className="text-xs text-[var(--text-muted)]">{researchNote}</p>
        ) : null}
        <div className="grid gap-2.5 md:grid-cols-2">
          <Textarea value={analysisOverview} onChange={(e) => setAnalysisOverview(e.target.value)} placeholder="Επισκόπηση αγώνα" />
          <Textarea value={recentForm} onChange={(e) => setRecentForm(e.target.value)} placeholder="Πρόσφατη φόρμα" />
          <Textarea value={headToHead} onChange={(e) => setHeadToHead(e.target.value)} placeholder="Ιστορικό αναμετρήσεων" />
          <Textarea value={homeAwayStats} onChange={(e) => setHomeAwayStats(e.target.value)} placeholder="Εντός / εκτός" />
          <Textarea value={injuries} onChange={(e) => setInjuries(e.target.value)} placeholder="Τραυματισμοί" />
          <Textarea value={lineups} onChange={(e) => setLineups(e.target.value)} placeholder="Ενδεκάδες" />
          <Textarea value={tactical} onChange={(e) => setTactical(e.target.value)} placeholder="Τακτική" />
          <Textarea value={psychological} onChange={(e) => setPsychological(e.target.value)} placeholder="Ψυχολογικό πλαίσιο" />
          <Textarea value={statistical} onChange={(e) => setStatistical(e.target.value)} placeholder="Στατιστική αξιολόγηση" />
          <Textarea value={rationale} onChange={(e) => setRationale(e.target.value)} placeholder="Αιτιολόγηση" />
          <Textarea className="md:col-span-2" value={counterarguments} onChange={(e) => setCounterarguments(e.target.value)} placeholder="Αντεπιχειρήματα" />
        </div>
        <div className="grid gap-2.5 md:grid-cols-2">
          <Input value={confidenceLevel} onChange={(e) => setConfidenceLevel(e.target.value)} placeholder="Confidence label" />
          <Input value={confidenceNote} onChange={(e) => setConfidenceNote(e.target.value)} placeholder="Confidence note" />
        </div>
      </section>

      <section className="admin-panel grid gap-3 md:grid-cols-2">
        <h2 className="font-[family-name:var(--font-display)] text-base md:col-span-2">
          10. Πηγές
        </h2>
        <Input value={sourceTitle} onChange={(e) => setSourceTitle(e.target.value)} placeholder="Τίτλος πηγής" />
        <Input value={sourceUrl} onChange={(e) => setSourceUrl(e.target.value)} placeholder="https://..." />
      </section>

      {error ? <p className="text-sm text-[var(--danger)]">{error}</p> : null}
      {message ? <p className="text-sm text-[var(--neon)]">{message}</p> : null}

      <div className="flex flex-wrap gap-2">
        <Button type="submit" disabled={saving}>
          {saving ? "Αποθήκευση…" : "Αποθήκευση πρόχειρου"}
        </Button>
        {initial ? (
          <>
            <Button type="button" variant="outline" onClick={() => runAction("publish")}>
              Δημοσίευση
            </Button>
            <Button type="button" variant="secondary" onClick={() => runAction("unpublish")}>
              Απόσυρση
            </Button>
            <Button type="button" variant="secondary" onClick={() => runAction("archive")}>
              Αρχειοθέτηση
            </Button>
            <Button
              type="button"
              variant="ghost"
              onClick={() =>
                runAction("feature", { featured: !initial.isFeatured })
              }
            >
              {initial.isFeatured ? "Αφαίρεση επιλογής" : "Επιλεγμένο"}
            </Button>
            {initial.publicationStatus === "PUBLISHED" ? (
              <a
                href={`/predictions/${initial.slug}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex h-[var(--btn-h)] items-center text-sm text-[var(--neon)]"
              >
                Προεπισκόπηση
              </a>
            ) : (
              <span className="inline-flex h-[var(--btn-h)] items-center text-sm text-[var(--text-muted)]">
                Προεπισκόπηση μετά τη δημοσίευση
              </span>
            )}
          </>
        ) : null}
      </div>
    </form>
  );
}
