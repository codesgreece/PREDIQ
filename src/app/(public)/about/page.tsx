import type { Metadata } from "next";
import { StaticPage } from "@/components/content/static-page";
import { prisma } from "@/lib/db";
import { el } from "@/lib/i18n/el";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: el.pages.about.title };

export default async function AboutPage() {
  const settings = await prisma.siteSettings.findUnique({
    where: { id: "default" },
  });
  return (
    <StaticPage title={el.pages.about.title}>
      <p className="whitespace-pre-wrap">
        {settings?.aboutText || el.pages.about.fallback}
      </p>
    </StaticPage>
  );
}
