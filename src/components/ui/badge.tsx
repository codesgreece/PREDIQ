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
    neutral: "bg-white/5 text-[var(--text-muted)] border-white/10",
    won: "bg-emerald-500/15 text-emerald-300 border-emerald-400/30",
    lost: "bg-red-500/15 text-red-300 border-red-400/30",
    pending: "bg-sky-500/15 text-sky-300 border-sky-400/30",
    void: "bg-zinc-500/15 text-zinc-300 border-zinc-400/30",
    neon: "bg-[var(--neon)]/10 text-[var(--neon)] border-[var(--neon)]/30",
  };
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium tracking-wide",
        tones[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}
