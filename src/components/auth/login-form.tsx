"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { PrediqLogo } from "@/components/brand/logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function LoginForm({
  csrfToken,
  csrfSigned,
}: {
  csrfToken: string;
  csrfSigned: string;
}) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    document.cookie = `prediq_csrf=${csrfSigned}; Path=/; SameSite=Lax`;
  }, [csrfSigned]);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      document.cookie = `prediq_csrf=${csrfSigned}; Path=/; SameSite=Lax`;
      const res = await fetch("/api/auth/login", {
        method: "POST",
        credentials: "same-origin",
        headers: {
          "Content-Type": "application/json",
          "x-csrf-token": csrfToken,
        },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Η σύνδεση απέτυχε");
        setLoading(false);
        return;
      }
      router.push("/admin");
      router.refresh();
    } catch {
      setError("Σφάλμα δικτύου");
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-8">
      <div className="glass w-full max-w-sm rounded-[var(--radius-lg)] p-5 md:p-6">
        <PrediqLogo showTagline size="sm" />
        <h1 className="mt-5 font-[family-name:var(--font-display)] text-xl">
          Σύνδεση διαχειριστή
        </h1>
        <p className="mt-1.5 text-sm text-[var(--text-muted)]">
          Η δημόσια εγγραφή είναι απενεργοποιημένη.
        </p>
        <form onSubmit={onSubmit} className="mt-5 space-y-3">
          <div>
            <label className="field-label">Email</label>
            <Input
              type="email"
              name="email"
              autoComplete="username"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="field-label">Κωδικός</label>
            <Input
              type="password"
              name="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          {error ? <p className="text-sm text-[var(--danger)]">{error}</p> : null}
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Σύνδεση…" : "Σύνδεση"}
          </Button>
        </form>
      </div>
    </div>
  );
}
