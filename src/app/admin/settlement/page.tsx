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
      setError(data.error || "Η διευθέτηση απέτυχε");
      return;
    }
    setMessage(`Διευθετήθηκε ως ${data.prediction.settlementStatus}`);
    await load();
  }

  return (
    <div>
      <h1 className="page-title">Αποτελέσματα & διευθέτηση</h1>
      <p className="section-subtitle">
        Ολοκληρωμένος αγώνας δεν διευθετεί αυτόματα το προγνωστικό. Χρησιμοποιήστε
        κανόνες αγοράς ή ρητή κατάσταση. Οι αλλαγές απαιτούν σημειώσεις.
      </p>

      <form onSubmit={onSubmit} className="admin-panel mt-4 max-w-xl space-y-3">
        <label className="block text-sm">
          <span className="field-label">Δημοσιευμένο προγνωστικό</span>
          <select
            className="control mt-1 w-full"
            value={selected}
            onChange={(e) => setSelected(e.target.value)}
            required
          >
            <option value="">Επιλογή</option>
            {items.map((item) => (
              <option key={item.id} value={item.id}>
                {item.match.homeTeam.name} vs {item.match.awayTeam.name} ·{" "}
                {item.selection} · {item.settlementStatus}
              </option>
            ))}
          </select>
        </label>
        <div className="grid grid-cols-2 gap-2.5">
          <Input
            placeholder="Τελικό σκορ γηπεδούχου"
            value={home}
            onChange={(e) => setHome(e.target.value)}
          />
          <Input
            placeholder="Τελικό σκορ φιλοξενούμενου"
            value={away}
            onChange={(e) => setAway(e.target.value)}
          />
        </div>
        <Input
          placeholder="Πηγή επαλήθευσης"
          value={source}
          onChange={(e) => setSource(e.target.value)}
        />
        <Textarea
          placeholder="Σημειώσεις διευθέτησης"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />
        <label className="block text-sm">
          <span className="field-label">Χειροκίνητη κατάσταση (προαιρετικά)</span>
          <select
            className="control mt-1 w-full"
            value={manualStatus}
            onChange={(e) => setManualStatus(e.target.value)}
          >
            <option value="">Αυτόματοι κανόνες αγοράς</option>
            <option value="WON">WON</option>
            <option value="LOST">LOST</option>
            <option value="VOID">VOID</option>
            <option value="PENDING">PENDING</option>
          </select>
        </label>
        {error ? <p className="text-sm text-[var(--danger)]">{error}</p> : null}
        {message ? <p className="text-sm text-[var(--neon)]">{message}</p> : null}
        <Button type="submit">Διευθέτηση</Button>
      </form>
    </div>
  );
}
