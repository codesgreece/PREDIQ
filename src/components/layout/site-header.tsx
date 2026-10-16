"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import { PrediqLogo } from "@/components/brand/logo";
import { cn } from "@/lib/utils";
import { el } from "@/lib/i18n/el";

const links = [
  { href: "/", label: el.nav.home },
  { href: "/predictions", label: el.nav.predictions },
  { href: "/competitions", label: el.nav.competitions },
  { href: "/performance", label: el.nav.performance },
  { href: "/statistics", label: el.nav.statistics },
];

export function SiteHeader({ isAdmin }: { isAdmin?: boolean }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 border-b border-[var(--border)] bg-[var(--bg)]/92 backdrop-blur-xl">
      <div className="section-shell flex h-[var(--nav-h)] items-center justify-between gap-3">
        <PrediqLogo showTagline className="min-w-0 max-w-[70%]" size="sm" />
        <nav className="hidden items-center gap-0.5 lg:flex">
          {links.map((link) => {
            const active =
              link.href === "/"
                ? pathname === "/"
                : pathname.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
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
          <Link
            href={isAdmin ? "/admin" : "/login"}
            className="ml-1.5 inline-flex h-8 items-center rounded-[var(--radius)] border border-[var(--neon)]/40 px-3 text-sm font-medium text-[var(--neon)] transition-colors hover:bg-[var(--neon)]/10"
          >
            {isAdmin ? el.nav.admin : el.nav.login}
          </Link>
        </nav>
        <button
          className="inline-flex h-9 w-9 items-center justify-center rounded-[var(--radius)] border border-[var(--border)] text-[var(--text)] lg:hidden"
          aria-label={open ? el.nav.closeMenu : el.nav.openMenu}
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <X size={18} /> : <Menu size={18} />}
        </button>
      </div>
      {open ? (
        <div className="border-t border-[var(--border)] bg-[var(--surface)] lg:hidden">
          <div className="section-shell flex flex-col gap-0.5 py-2">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="rounded-[var(--radius)] px-3 py-2 text-sm text-[var(--text-muted)] hover:bg-white/[0.04] hover:text-[var(--text)]"
                onClick={() => setOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            <Link
              href={isAdmin ? "/admin" : "/login"}
              className="rounded-[var(--radius)] px-3 py-2 text-sm text-[var(--neon)]"
              onClick={() => setOpen(false)}
            >
              {isAdmin ? el.nav.admin : el.nav.login}
            </Link>
          </div>
        </div>
      ) : null}
    </header>
  );
}
