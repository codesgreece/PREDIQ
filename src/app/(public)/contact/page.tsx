import type { Metadata } from "next";
import { StaticPage } from "@/components/content/static-page";
import { prisma } from "@/lib/db";
import { el } from "@/lib/i18n/el";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: el.pages.contact.title };

export default async function ContactPage() {
  const settings = await prisma.siteSettings.findUnique({
    where: { id: "default" },
  });
  return (
    <StaticPage title={el.pages.contact.title}>
      <p>
        {el.common.email}: {settings?.contactEmail || el.common.notConfigured}
      </p>
    </StaticPage>
  );
}
