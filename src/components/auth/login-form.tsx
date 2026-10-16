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
    // Server Components cannot set cookies during render; mirror the signed CSRF cookie client-side.
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
        setError(data.error || "Login failed");
        setLoading(false);
        return;
      }
      router.push("/admin");
      router.refresh();
    } catch {
      setError("Network error");
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="glass w-full max-w-md rounded-2xl p-8">
        <PrediqLogo showTagline />
        <h1 className="mt-8 font-[family-name:var(--font-display)] text-2xl">
          Administrator login
        </h1>
        <p className="mt-2 text-sm text-[var(--text-muted)]">
          Public registration is disabled. Use the bootstrap admin account.
        </p>
        <form
          onSubmit={onSubmit}
          action="/api/auth/login"
          method="post"
          className="mt-6 space-y-4"
        >
          <div>
            <label className="mb-1 block text-xs uppercase tracking-[0.14em] text-[var(--text-muted)]">
              Email
            </label>
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
            <label className="mb-1 block text-xs uppercase tracking-[0.14em] text-[var(--text-muted)]">
              Password
            </label>
            <Input
              type="password"
              name="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          {error ? <p className="text-sm text-red-300">{error}</p> : null}
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Signing in…" : "Sign in"}
          </Button>
        </form>
      </div>
    </div>
  );
}
