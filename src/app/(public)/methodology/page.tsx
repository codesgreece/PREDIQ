import type { Metadata } from "next";
import { StaticPage } from "@/components/content/static-page";
import { prisma } from "@/lib/db";
import { el } from "@/lib/i18n/el";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: el.pages.methodology.title };

export default async function MethodologyPage() {
  const settings = await prisma.siteSettings.findUnique({
    where: { id: "default" },
  });
  return (
    <StaticPage title={el.pages.methodology.title}>
      <p className="whitespace-pre-wrap">
        {settings?.methodologyText || el.pages.methodology.fallback}
      </p>
    </StaticPage>
  );
}
