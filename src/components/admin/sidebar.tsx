"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { PrediqLogo } from "@/components/brand/logo";
import { cn } from "@/lib/utils";

const links = [
  { href: "/admin", label: "Overview" },
  { href: "/admin/predictions", label: "Predictions" },
  { href: "/admin/predictions/new", label: "Create prediction" },
  { href: "/admin/settlement", label: "Results & settlement" },
  { href: "/admin/competitions", label: "Competitions" },
  { href: "/admin/teams", label: "Teams" },
  { href: "/admin/data-sources", label: "Data sources" },
  { href: "/admin/statistics", label: "Statistics" },
  { href: "/admin/settings", label: "Settings" },
  { href: "/admin/audit", label: "Audit log" },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [csrfToken, setCsrfToken] = useState("");

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

  return (
    <aside className="flex h-full w-64 shrink-0 flex-col border-r border-white/5 bg-[#0b1210] p-4">
      <PrediqLogo href="/admin" showTagline />
      <nav className="mt-8 flex flex-1 flex-col gap-1">
        {links.map((link) => {
          const active =
            link.href === "/admin"
              ? pathname === "/admin"
              : pathname.startsWith(link.href);
          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "rounded-md px-3 py-2 text-sm transition-colors",
                active
                  ? "bg-[var(--neon)]/10 text-[var(--neon)]"
                  : "text-[var(--text-muted)] hover:bg-white/5 hover:text-[var(--text)]",
              )}
            >
              {link.label}
            </Link>
          );
        })}
      </nav>
      <div className="space-y-2 border-t border-white/5 pt-4">
        <Link href="/" className="block text-sm text-[var(--text-muted)] hover:text-[var(--neon)]">
          View public site
        </Link>
        <button
          onClick={logout}
          className="text-sm text-red-300 hover:text-red-200"
        >
          Log out
        </button>
      </div>
    </aside>
  );
}
