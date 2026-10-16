import Link from "next/link";
import { cn } from "@/lib/utils";

/** Replace this SVG with the approved PREDIQ logo asset when available. */
export function PrediqLogo({
  className,
  href = "/",
  showTagline = false,
}: {
  className?: string;
  href?: string;
  showTagline?: boolean;
}) {
  return (
    <Link href={href} className={cn("group inline-flex items-center gap-3", className)}>
      <svg
        width="36"
        height="36"
        viewBox="0 0 36 36"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
        className="shrink-0 transition-transform duration-300 group-hover:scale-105"
      >
        <rect
          x="1.5"
          y="1.5"
          width="33"
          height="33"
          rx="8"
          stroke="url(#prediq-stroke)"
          strokeWidth="1.5"
          fill="#121D19"
        />
        <path
          d="M10 24V12h6.2c2.9 0 4.7 1.6 4.7 4 0 1.7-.9 3-2.4 3.6L22.8 24h-3.2l-3.7-4.1H13.2V24H10Zm3.2-6.5h2.8c1.4 0 2.2-.7 2.2-1.8s-.8-1.8-2.2-1.8h-2.8v3.6Z"
          fill="#20E890"
        />
        <defs>
          <linearGradient id="prediq-stroke" x1="4" y1="2" x2="32" y2="34">
            <stop stopColor="#20E890" />
            <stop offset="1" stopColor="#00CBA8" />
          </linearGradient>
        </defs>
      </svg>
      <span className="flex flex-col leading-none">
        <span className="font-[family-name:var(--font-display)] text-xl tracking-[0.18em] text-[var(--text)]">
          PREDIQ
        </span>
        {showTagline ? (
          <span className="mt-1 text-[10px] tracking-[0.22em] text-[var(--text-muted)]">
            AI SPORTS PREDICTIONS
          </span>
        ) : null}
      </span>
    </Link>
  );
}
