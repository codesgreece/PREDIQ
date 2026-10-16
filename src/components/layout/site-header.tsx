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
    <header className="sticky top-0 z-50 border-b border-white/5 bg-[#080D0C]/85 backdrop-blur-xl">
      <div className="section-shell flex items-center justify-between gap-4 py-3.5 md:py-4">
        <PrediqLogo showTagline className="min-w-0" />
        <nav className="hidden items-center gap-1 lg:flex">
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
                  "rounded-lg px-3 py-2 text-sm transition-colors",
                  active
                    ? "bg-[var(--neon)]/10 text-[var(--neon)]"
                    : "text-[var(--text-muted)] hover:bg-white/5 hover:text-[var(--text)]",
                )}
              >
                {link.label}
              </Link>
            );
          })}
          <Link
            href={isAdmin ? "/admin" : "/login"}
            className="ml-2 inline-flex h-9 items-center rounded-lg border border-[var(--neon)]/40 px-3.5 text-sm font-medium text-[var(--neon)] transition-colors hover:bg-[var(--neon)]/10"
          >
            {isAdmin ? el.nav.admin : el.nav.login}
          </Link>
        </nav>
        <button
          className="rounded-lg border border-white/10 p-2.5 text-[var(--text)] lg:hidden"
          aria-label={open ? el.nav.closeMenu : el.nav.openMenu}
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <X size={18} /> : <Menu size={18} />}
        </button>
      </div>
      <div
        className={cn(
          "border-t border-white/5 bg-[#0c1412] lg:hidden",
          open ? "block" : "hidden",
        )}
      >
        <div className="section-shell flex flex-col gap-1 py-3">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-lg px-3 py-2.5 text-sm text-[var(--text-muted)] hover:bg-white/5 hover:text-[var(--text)]"
              onClick={() => setOpen(false)}
            >
              {link.label}
            </Link>
          ))}
          <Link
            href={isAdmin ? "/admin" : "/login"}
            className="rounded-lg px-3 py-2.5 text-sm text-[var(--neon)]"
            onClick={() => setOpen(false)}
          >
            {isAdmin ? el.nav.admin : el.nav.login}
          </Link>
        </div>
      </div>
    </header>
  );
}
