"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

type Job = {
  id: string;
  status: string;
  competitionsUpserted: number;
  teamsUpserted: number;
  logosMissing: number;
  createdAt: string;
  provider: { name: string; key: string };
  errorsJson: string | null;
};

export default function DataSourcesPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [csrfToken, setCsrfToken] = useState("");
  const [result, setResult] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function load() {
    const [sync, me] = await Promise.all([
      fetch("/api/admin/sync").then((r) => r.json()),
      fetch("/api/auth/me").then((r) => r.json()),
    ]);
    setJobs(sync.jobs || []);
    setCsrfToken(me.csrfToken || "");
  }

  useEffect(() => {
    load();
  }, []);

  async function runSync() {
    setLoading(true);
    setResult(null);
    const res = await fetch("/api/admin/sync", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-csrf-token": csrfToken,
      },
      body: JSON.stringify({ maxCompetitions: 5 }),
    });
    const data = await res.json();
    setLoading(false);
    if (data.configurationRequired) {
      setResult(data.configurationRequired);
    } else {
      setResult(
        `Sync ${data.status}: ${data.competitionsUpserted} competitions, ${data.teamsUpserted} teams, ${data.logosMissing} missing logos`,
      );
    }
    await load();
  }

  return (
    <div>
      <h1 className="page-title">Πηγές δεδομένων</h1>
      <p className="section-subtitle">
        Adapter για sports data (API-Football). Απαιτείται{" "}
        <code>API_FOOTBALL_KEY</code>. Άδειες λογοτύπων ορίζονται από τον πάροχο.
      </p>
      <div className="mt-4">
        <Button onClick={runSync} disabled={loading || !csrfToken}>
          {loading ? "Συγχρονισμός…" : "Εκτέλεση συγχρονισμού"}
        </Button>
      </div>
      {result ? (
        <p className="mt-3 whitespace-pre-wrap text-sm text-[var(--neon)]">{result}</p>
      ) : null}
      <div className="mt-4 space-y-2">
        {jobs.map((job) => (
          <div key={job.id} className="admin-panel text-sm">
            <p>
              {job.provider.name} · {job.status}
            </p>
            <p className="text-[var(--text-muted)]">
              Competitions {job.competitionsUpserted} · Teams {job.teamsUpserted} ·
              Missing logos {job.logosMissing}
            </p>
            {job.errorsJson ? (
              <p className="mt-1 text-xs text-amber-300">{job.errorsJson}</p>
            ) : null}
          </div>
        ))}
        {!jobs.length ? (
          <p className="text-sm text-[var(--text-muted)]">Δεν υπάρχουν εργασίες ακόμη.</p>
        ) : null}
      </div>
    </div>
  );
}
