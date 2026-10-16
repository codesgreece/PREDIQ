import type { Metadata } from "next";
import { StaticPage } from "@/components/content/static-page";
import { prisma } from "@/lib/db";

export const metadata: Metadata = { title: "Methodology" };

export default async function MethodologyPage() {
  const settings = await prisma.siteSettings.findUnique({ where: { id: "default" } });
  return (
    <StaticPage title="Methodology">
      <p className="whitespace-pre-wrap">
        {settings?.methodologyText ||
          "Each prediction is researched, drafted, reviewed, and explicitly published by an administrator. AI may assist research but never publishes autonomously. Hit rate = Won / (Won + Lost). Pending selections are excluded from the denominator. ROI is reported only when stake and odds are complete for settled results."}
      </p>
    </StaticPage>
  );
}
