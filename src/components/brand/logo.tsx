import Link from "next/link";
import { cn } from "@/lib/utils";

/** Reusable PREDIQ mark — replace with approved brand asset when available. */
export function PrediqMark({ className, size = 40 }: { className?: string; size?: number }) {
  // Unique gradient ids per instance (header + footer can coexist).
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
        rx="10"
        fill="#0F1A16"
        stroke={`url(#${uid}-g)`}
        strokeWidth="1.5"
      />
      {/* Football-inspired ring */}
      <circle cx="20" cy="20" r="13" stroke="#20E890" strokeOpacity="0.18" strokeWidth="1" />
      <path
        d="M20 7.5c2.2 3.1 3.4 6.6 3.4 12.5S22.2 29.4 20 32.5c-2.2-3.1-3.4-6.6-3.4-12.5S17.8 10.6 20 7.5Z"
        stroke="#00CBA8"
        strokeOpacity="0.28"
        strokeWidth="1"
      />
      <path
        d="M8.5 18.5c4.2 1.4 8.5 2.1 11.5 2.1s7.3-.7 11.5-2.1"
        stroke="#20E890"
        strokeOpacity="0.22"
        strokeWidth="1"
      />
      {/* Clear capital P */}
      <path
        d="M14.5 29V11h7.4c4.05 0 6.55 2.15 6.55 5.55 0 3.45-2.5 5.55-6.55 5.55H18.2V29H14.5Zm3.7-10.3h3.45c1.95 0 3.1-1 3.1-2.65s-1.15-2.65-3.1-2.65H18.2v5.3Z"
        fill="#20E890"
      />
      <circle cx="29.8" cy="10.8" r="1.7" fill="#00CBA8" />
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
  const mark = size === "lg" ? 48 : size === "sm" ? 32 : 40;
  const title =
    size === "lg" ? "text-2xl" : size === "sm" ? "text-lg" : "text-xl";

  return (
    <Link
      href={href}
      className={cn(
        "group inline-flex items-center gap-3 transition-opacity hover:opacity-95",
        className,
      )}
    >
      <PrediqMark
        size={mark}
        className="transition-transform duration-300 group-hover:scale-105"
      />
      <span className="flex min-w-0 flex-col leading-none">
        <span
          className={cn(
            "font-[family-name:var(--font-display)] font-bold tracking-[0.2em] text-[var(--text)]",
            title,
          )}
        >
          PREDIQ
        </span>
        {showTagline ? (
          <span className="mt-1.5 text-[10px] font-medium tracking-[0.24em] text-[var(--text-muted)]">
            AI SPORTS PREDICTIONS
          </span>
        ) : null}
      </span>
    </Link>
  );
}
