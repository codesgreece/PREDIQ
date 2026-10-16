import Link from "next/link";
import { PrediqLogo } from "@/components/brand/logo";

const footerLinks = [
  { href: "/about", label: "About PREDIQ" },
  { href: "/methodology", label: "Methodology" },
  { href: "/performance", label: "Performance history" },
  { href: "/responsible-gambling", label: "Responsible gambling" },
  { href: "/privacy", label: "Privacy policy" },
  { href: "/terms", label: "Terms of use" },
  { href: "/contact", label: "Contact" },
];

export function SiteFooter() {
  return (
    <footer className="mt-24 border-t border-white/5 bg-[#0a1210]">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-14 md:grid-cols-[1.2fr_1fr] md:px-6">
        <div>
          <PrediqLogo showTagline />
          <p className="mt-4 max-w-md text-sm leading-relaxed text-[var(--text-muted)]">
            Manually researched, AI-assisted sports predictions. Only
            administrator-approved analyses are published. Past performance is
            not a guarantee of future results.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-3 text-sm">
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
        © {new Date().getFullYear()} PREDIQ. For informational purposes only.
      </div>
    </footer>
  );
}
