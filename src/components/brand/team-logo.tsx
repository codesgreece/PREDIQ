import Image from "next/image";
import { cn } from "@/lib/utils";
import { el } from "@/lib/i18n/el";

export function TeamLogo({
  name,
  logoUrl,
  size = 44,
  className,
}: {
  name: string;
  logoUrl: string | null | undefined;
  size?: number;
  className?: string;
}) {
  if (logoUrl) {
    return (
      <Image
        src={logoUrl}
        alt={`${name} logo`}
        width={size}
        height={size}
        className={cn("object-contain", className)}
        style={{ width: size, height: size }}
        unoptimized
      />
    );
  }

  return (
    <div
      className={cn(
        "flex items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-[11px] font-semibold tracking-wide text-[var(--text-muted)]",
        className,
      )}
      style={{ width: size, height: size }}
      title={el.common.logoUnavailable}
      aria-label={el.common.logoUnavailable}
    >
      {name.slice(0, 2).toUpperCase()}
    </div>
  );
}

export function CompetitionLogo({
  name,
  logoUrl,
  size = 40,
}: {
  name: string;
  logoUrl: string | null | undefined;
  size?: number;
}) {
  return <TeamLogo name={name} logoUrl={logoUrl} size={size} />;
}
