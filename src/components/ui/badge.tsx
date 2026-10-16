import { cn } from "@/lib/utils";

export function Badge({
  children,
  tone = "neutral",
  className,
}: {
  children: React.ReactNode;
  tone?: "neutral" | "won" | "lost" | "pending" | "void" | "neon";
  className?: string;
}) {
  const tones = {
    neutral: "bg-white/[0.04] text-[var(--text-muted)] border-[var(--border)]",
    won: "bg-[var(--neon)]/10 text-[var(--neon)] border-[var(--neon)]/35",
    lost: "bg-[var(--danger)]/10 text-[var(--danger)] border-[var(--danger)]/35",
    pending: "bg-sky-500/10 text-sky-300 border-sky-400/30",
    void: "bg-zinc-500/10 text-zinc-300 border-zinc-400/25",
    neon: "bg-[var(--neon)]/10 text-[var(--neon)] border-[var(--neon)]/35",
  };
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-[var(--radius-sm)] border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.12em]",
        tones[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}
