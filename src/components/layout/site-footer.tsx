import Link from "next/link";
import { PrediqLogo } from "@/components/brand/logo";
import { el } from "@/lib/i18n/el";

const footerLinks = [
  { href: "/about", label: el.footer.about },
  { href: "/methodology", label: el.footer.methodology },
  { href: "/performance", label: el.footer.performance },
  { href: "/responsible-gambling", label: el.footer.responsible },
  { href: "/privacy", label: el.footer.privacy },
  { href: "/terms", label: el.footer.terms },
  { href: "/contact", label: el.footer.contact },
];

export function SiteFooter() {
  return (
    <footer className="mt-8 border-t border-[var(--border)] bg-[var(--bg)]">
      <div className="section-shell grid gap-6 py-8 md:grid-cols-[1.2fr_1fr]">
        <div>
          <PrediqLogo showTagline size="sm" />
          <p className="mt-3 max-w-md text-sm leading-relaxed text-[var(--text-muted)]">
            {el.footer.blurb}
          </p>
        </div>
        <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
          {footerLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-[var(--text-muted)] transition-colors hover:text-[var(--neon)]"
            >
              {link.label}
            </Link>
          ))}
        </div>
      </div>
      <div className="border-t border-[var(--border)] py-3 text-center text-xs text-[var(--text-muted)]">
        © {new Date().getFullYear()} PREDIQ. {el.footer.copyright}
      </div>
    </footer>
  );
}
