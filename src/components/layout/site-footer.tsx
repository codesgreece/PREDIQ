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
    <footer className="mt-20 border-t border-white/5 bg-[#0a1210]">
      <div className="section-shell grid gap-10 py-12 md:grid-cols-[1.25fr_1fr] md:py-14">
        <div>
          <PrediqLogo showTagline />
          <p className="mt-5 max-w-md text-sm leading-relaxed text-[var(--text-muted)]">
            {el.footer.blurb}
          </p>
        </div>
        <div className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
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
      <div className="border-t border-white/5 py-4 text-center text-xs text-[var(--text-muted)]">
        © {new Date().getFullYear()} PREDIQ. {el.footer.copyright}
      </div>
    </footer>
  );
}
