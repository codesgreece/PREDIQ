import Link from "next/link";
import { cn } from "@/lib/utils";

/** Reusable PREDIQ mark — replace with approved brand asset when available. */
export function PrediqMark({ className, size = 32 }: { className?: string; size?: number }) {
  const uid = `pq-${size}-${Math.random().toString(36).slice(2, 8)}`;
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      className={cn("shrink-0", className)}
    >
      <rect
        x="1"
        y="1"
        width="38"
        height="38"
        rx="9"
        fill="#101512"
        stroke={`url(#${uid}-g)`}
        strokeWidth="1.5"
      />
      <circle cx="20" cy="20" r="12.5" stroke="#20E890" strokeOpacity="0.16" strokeWidth="1" />
      <path
        d="M20 8c2 2.8 3.1 6 3.1 12S22 29.2 20 32c-2-2.8-3.1-6-3.1-12S18 10.8 20 8Z"
        stroke="#00CBA8"
        strokeOpacity="0.25"
        strokeWidth="1"
      />
      <path
        d="M14.5 28.5V11.5h7.2c3.9 0 6.3 2.05 6.3 5.35 0 3.3-2.4 5.35-6.3 5.35H18V28.5h-3.5Zm3.5-9.8h3.3c1.85 0 2.95-.95 2.95-2.55s-1.1-2.55-2.95-2.55H18v5.1Z"
        fill="#20E890"
      />
      <circle cx="29.5" cy="11" r="1.5" fill="#00CBA8" />
      <defs>
        <linearGradient id={`${uid}-g`} x1="4" y1="3" x2="36" y2="37">
          <stop stopColor="#20E890" />
          <stop offset="1" stopColor="#00CBA8" />
        </linearGradient>
      </defs>
    </svg>
  );
}

export function PrediqLogo({
  className,
  href = "/",
  showTagline = false,
  size = "md",
}: {
  className?: string;
  href?: string;
  showTagline?: boolean;
  size?: "sm" | "md" | "lg";
}) {
  const mark = size === "lg" ? 40 : size === "sm" ? 28 : 32;
  const title =
    size === "lg" ? "text-xl" : size === "sm" ? "text-base" : "text-lg";

  return (
    <Link
      href={href}
      className={cn(
        "group inline-flex items-center gap-2.5 transition-opacity hover:opacity-95",
        className,
      )}
    >
      <PrediqMark size={mark} />
      <span className="flex min-w-0 flex-col leading-none">
        <span
          className={cn(
            "font-[family-name:var(--font-display)] font-bold tracking-[0.18em] text-[var(--text)]",
            title,
          )}
        >
          PREDIQ
        </span>
        {showTagline ? (
          <span className="mt-1 text-[9px] font-medium tracking-[0.2em] text-[var(--text-muted)]">
            AI SPORTS PREDICTIONS
          </span>
        ) : null}
      </span>
    </Link>
  );
}
