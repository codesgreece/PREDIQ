"use client";

import { FormEvent, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

type Item = {
  id: string;
  title: string;
  selection: string;
  marketType: string;
  settlementStatus: string;
  publicationStatus: string;
  match: {
    homeTeam: { name: string };
    awayTeam: { name: string };
  };
};

export default function SettlementPage() {
  const [items, setItems] = useState<Item[]>([]);
  const [csrfToken, setCsrfToken] = useState("");
  const [selected, setSelected] = useState("");
  const [home, setHome] = useState("");
  const [away, setAway] = useState("");
  const [notes, setNotes] = useState("");
  const [source, setSource] = useState("");
  const [manualStatus, setManualStatus] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    const [pred, me] = await Promise.all([
      fetch("/api/admin/predictions?status=PUBLISHED").then((r) => r.json()),
      fetch("/api/auth/me").then((r) => r.json()),
    ]);
    setItems(pred.items || []);
    setCsrfToken(me.csrfToken || "");
  }

  useEffect(() => {
    load();
  }, []);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setMessage(null);
    const res = await fetch(`/api/admin/predictions/${selected}/settle`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-csrf-token": csrfToken,
      },
      body: JSON.stringify({
        finalHomeScore: home === "" ? null : Number(home),
        finalAwayScore: away === "" ? null : Number(away),
        notes,
        verificationSource: source,
        useAutomaticRules: !manualStatus,
        status: manualStatus || undefined,
      }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error || "Settlement failed");
      return;
    }
    setMessage(`Settled as ${data.prediction.settlementStatus}`);
    await load();
  }

  return (
    <div>
      <h1 className="font-[family-name:var(--font-display)] text-3xl">
        Results & settlement
      </h1>
      <p className="mt-2 max-w-2xl text-sm text-[var(--text-muted)]">
        A finished match does not automatically settle a prediction. Use market
        rules or an explicit status. Changing settled results requires notes.
      </p>

      <form
        onSubmit={onSubmit}
        className="mt-8 max-w-xl space-y-4 rounded-xl border border-[var(--border)] p-5"
      >
        <label className="block text-sm">
          Published prediction
          <select
            className="mt-1 h-10 w-full rounded-md border border-[var(--border)] bg-[var(--bg-secondary)] px-3"
            value={selected}
            onChange={(e) => setSelected(e.target.value)}
            required
          >
            <option value="">Select</option>
            {items.map((item) => (
              <option key={item.id} value={item.id}>
                {item.match.homeTeam.name} vs {item.match.awayTeam.name} ·{" "}
                {item.selection} · {item.settlementStatus}
              </option>
            ))}
          </select>
        </label>
        <div className="grid grid-cols-2 gap-3">
          <Input
            placeholder="Final home score"
            value={home}
            onChange={(e) => setHome(e.target.value)}
          />
          <Input
            placeholder="Final away score"
            value={away}
            onChange={(e) => setAway(e.target.value)}
          />
        </div>
        <Input
          placeholder="Verification source"
          value={source}
          onChange={(e) => setSource(e.target.value)}
        />
        <Textarea
          placeholder="Settlement notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />
        <label className="block text-sm">
          Explicit status override (optional; required for OTHER markets)
          <select
            className="mt-1 h-10 w-full rounded-md border border-[var(--border)] bg-[var(--bg-secondary)] px-3"
            value={manualStatus}
            onChange={(e) => setManualStatus(e.target.value)}
          >
            <option value="">Use automatic market rules</option>
            <option value="WON">WON</option>
            <option value="LOST">LOST</option>
            <option value="VOID">VOID</option>
            <option value="PENDING">PENDING</option>
          </select>
        </label>
        {error ? <p className="text-sm text-red-300">{error}</p> : null}
        {message ? <p className="text-sm text-[var(--neon)]">{message}</p> : null}
        <Button type="submit">Settle prediction</Button>
      </form>
    </div>
  );
}
