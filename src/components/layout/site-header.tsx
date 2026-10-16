"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import { PrediqLogo } from "@/components/brand/logo";
import { cn } from "@/lib/utils";

const links = [
  { href: "/", label: "Home" },
  { href: "/predictions", label: "Predictions" },
  { href: "/competitions", label: "Competitions" },
  { href: "/performance", label: "Performance History" },
  { href: "/statistics", label: "Statistics" },
];

export function SiteHeader({ isAdmin }: { isAdmin?: boolean }) {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-white/5 bg-[#080D0C]/80 backdrop-blur-xl">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 md:px-6">
        <PrediqLogo showTagline className="min-w-0" />
        <nav className="hidden items-center gap-6 lg:flex">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm text-[var(--text-muted)] transition-colors hover:text-[var(--neon)]"
            >
              {link.label}
            </Link>
          ))}
          <Link
            href={isAdmin ? "/admin" : "/login"}
            className="inline-flex h-8 items-center rounded-md border border-[var(--neon)]/40 px-3 text-xs font-medium text-[var(--neon)] transition-colors hover:bg-[var(--neon)]/10"
          >
            {isAdmin ? "Admin" : "Login"}
          </Link>
        </nav>
        <button
          className="rounded-md border border-white/10 p-2 text-[var(--text)] lg:hidden"
          aria-label={open ? "Close menu" : "Open menu"}
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
        <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 py-4">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-md px-3 py-2 text-sm text-[var(--text-muted)] hover:bg-white/5 hover:text-[var(--text)]"
              onClick={() => setOpen(false)}
            >
              {link.label}
            </Link>
          ))}
          <Link
            href={isAdmin ? "/admin" : "/login"}
            className="rounded-md px-3 py-2 text-sm text-[var(--neon)]"
            onClick={() => setOpen(false)}
          >
            {isAdmin ? "Admin" : "Login"}
          </Link>
        </div>
      </div>
    </header>
  );
}
