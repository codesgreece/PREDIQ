import type { Metadata } from "next";
import { StaticPage } from "@/components/content/static-page";
import { prisma } from "@/lib/db";

export const metadata: Metadata = { title: "Contact" };

export default async function ContactPage() {
  const settings = await prisma.siteSettings.findUnique({ where: { id: "default" } });
  return (
    <StaticPage title="Contact">
      <p>
        Email: {settings?.contactEmail || "Not configured yet."}
      </p>
    </StaticPage>
  );
}
