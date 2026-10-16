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
      <h1 className="font-[family-name:var(--font-display)] text-3xl">
        Data sources
      </h1>
      <p className="mt-2 max-w-2xl text-sm text-[var(--text-muted)]">
        PREDIQ uses an adapter layer for sports data. The default adapter is
        API-Football (api-sports.io). Set <code>API_FOOTBALL_KEY</code> to enable
        synchronization. Coverage, logo licensing, and commercial terms are
        defined by the provider — not claimed as worldwide completeness by PREDIQ.
      </p>
      <div className="mt-6">
        <Button onClick={runSync} disabled={loading || !csrfToken}>
          {loading ? "Syncing…" : "Run catalog sync (limited sample)"}
        </Button>
      </div>
      {result ? (
        <p className="mt-4 whitespace-pre-wrap text-sm text-[var(--neon)]">
          {result}
        </p>
      ) : null}
      <div className="mt-8 space-y-3">
        {jobs.map((job) => (
          <div
            key={job.id}
            className="rounded-xl border border-[var(--border)] p-4 text-sm"
          >
            <p>
              {job.provider.name} · {job.status}
            </p>
            <p className="text-[var(--text-muted)]">
              Competitions {job.competitionsUpserted} · Teams {job.teamsUpserted} ·
              Missing logos {job.logosMissing}
            </p>
            {job.errorsJson ? (
              <p className="mt-2 text-xs text-amber-300">{job.errorsJson}</p>
            ) : null}
          </div>
        ))}
        {!jobs.length ? (
          <p className="text-[var(--text-muted)]">No sync jobs yet.</p>
        ) : null}
      </div>
    </div>
  );
}
