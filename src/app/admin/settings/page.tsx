import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function AdminSettingsPage() {
  const settings = await prisma.siteSettings.findUnique({ where: { id: "default" } });
  return (
    <div>
      <h1 className="font-[family-name:var(--font-display)] text-3xl">
        Settings
      </h1>
      <div className="mt-6 max-w-2xl space-y-4 rounded-xl border border-[var(--border)] p-5 text-sm">
        <p>
          <span className="text-[var(--text-muted)]">Site name:</span>{" "}
          {settings?.siteName || "PREDIQ"}
        </p>
        <p>
          <span className="text-[var(--text-muted)]">Tagline:</span>{" "}
          {settings?.tagline || "AI SPORTS PREDICTIONS"}
        </p>
        <p>
          <span className="text-[var(--text-muted)]">Contact:</span>{" "}
          {settings?.contactEmail || "Not set"}
        </p>
        <p>
          <span className="text-[var(--text-muted)]">Featured prediction id:</span>{" "}
          {settings?.featuredPredictionId || "None"}
        </p>
        <p className="text-[var(--text-muted)]">
          Environment secrets are managed via <code>.env</code>. Public
          registration remains disabled by design.
        </p>
      </div>
    </div>
  );
}
