import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function AdminSettingsPage() {
  const settings = await prisma.siteSettings.findUnique({ where: { id: "default" } });
  return (
    <div>
      <h1 className="page-title">Ρυθμίσεις</h1>
      <div className="admin-panel mt-4 max-w-xl space-y-2.5 text-sm">
        <p>
          <span className="text-[var(--text-muted)]">Όνομα:</span>{" "}
          {settings?.siteName || "PREDIQ"}
        </p>
        <p>
          <span className="text-[var(--text-muted)]">Tagline:</span>{" "}
          {settings?.tagline || "AI SPORTS PREDICTIONS"}
        </p>
        <p>
          <span className="text-[var(--text-muted)]">Επικοινωνία:</span>{" "}
          {settings?.contactEmail || "Δεν έχει οριστεί"}
        </p>
        <p>
          <span className="text-[var(--text-muted)]">Featured prediction id:</span>{" "}
          {settings?.featuredPredictionId || "Κανένα"}
        </p>
        <p className="text-[var(--text-muted)]">
          Τα secrets διαχειρίζονται μέσω <code>.env</code>. Η δημόσια εγγραφή
          παραμένει απενεργοποιημένη.
        </p>
      </div>
    </div>
  );
}
