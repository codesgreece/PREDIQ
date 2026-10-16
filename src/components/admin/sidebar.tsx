"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { PrediqLogo } from "@/components/brand/logo";
import { cn } from "@/lib/utils";
import { el } from "@/lib/i18n/el";

const links = [
  { href: "/admin", label: el.admin.overview },
  { href: "/admin/predictions", label: el.admin.predictions },
  { href: "/admin/predictions/new", label: el.admin.createPrediction },
  { href: "/admin/settlement", label: el.admin.settlement },
  { href: "/admin/competitions", label: el.admin.competitions },
  { href: "/admin/teams", label: el.admin.teams },
  { href: "/admin/data-sources", label: el.admin.dataSources },
  { href: "/admin/statistics", label: el.admin.statistics },
  { href: "/admin/settings", label: el.admin.settings },
  { href: "/admin/audit", label: el.admin.audit },
];

export function AdminSidebar({ compact }: { compact?: boolean }) {
  const pathname = usePathname();
  const router = useRouter();
  const [csrfToken, setCsrfToken] = useState("");
  const [open, setOpen] = useState(false);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((d) => setCsrfToken(d.csrfToken || ""));
  }, []);

  async function logout() {
    await fetch("/api/auth/logout", {
      method: "POST",
      headers: { "x-csrf-token": csrfToken },
    });
    router.push("/login");
    router.refresh();
  }

  const nav = (
    <nav className={cn("flex flex-col gap-0.5", compact ? "mt-2" : "mt-5 flex-1")}>
      {links.map((link) => {
        const active =
          link.href === "/admin"
            ? pathname === "/admin"
            : pathname.startsWith(link.href);
        return (
          <Link
            key={link.href}
            href={link.href}
            onClick={() => setOpen(false)}
            className={cn(
              "rounded-[var(--radius)] px-2.5 py-1.5 text-sm transition-colors",
              active
                ? "bg-[var(--neon)]/10 text-[var(--neon)]"
                : "text-[var(--text-muted)] hover:bg-white/[0.04] hover:text-[var(--text)]",
            )}
          >
            {link.label}
          </Link>
        );
      })}
    </nav>
  );

  if (compact) {
    return (
      <div>
        <div className="flex items-center justify-between gap-3">
          <PrediqLogo href="/admin" size="sm" />
          <button
            type="button"
            className="rounded-[var(--radius)] border border-[var(--border)] px-2.5 py-1.5 text-xs text-[var(--text-muted)]"
            onClick={() => setOpen((v) => !v)}
          >
            Menu
          </button>
        </div>
        {open ? (
          <div className="mt-2 rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--card)] p-2">
            {nav}
            <div className="mt-2 space-y-1 border-t border-[var(--border)] pt-2">
              <Link href="/" className="block px-2.5 py-1.5 text-sm text-[var(--text-muted)]">
                {el.admin.viewPublic}
              </Link>
              <button
                onClick={logout}
                className="block w-full px-2.5 py-1.5 text-left text-sm text-[var(--danger)]"
              >
                {el.admin.logout}
              </button>
            </div>
          </div>
        ) : null}
      </div>
    );
  }

  return (
    <aside className="flex h-full w-56 shrink-0 flex-col border-r border-[var(--border)] bg-[var(--surface)] p-3">
      <PrediqLogo href="/admin" showTagline size="sm" />
      {nav}
      <div className="space-y-1 border-t border-[var(--border)] pt-3">
        <Link
          href="/"
          className="block rounded-[var(--radius)] px-2.5 py-1.5 text-sm text-[var(--text-muted)] hover:text-[var(--neon)]"
        >
          {el.admin.viewPublic}
        </Link>
        <button
          onClick={logout}
          className="block w-full rounded-[var(--radius)] px-2.5 py-1.5 text-left text-sm text-[var(--danger)] hover:bg-[var(--danger)]/10"
        >
          {el.admin.logout}
        </button>
      </div>
    </aside>
  );
}
