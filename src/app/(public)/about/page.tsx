import type { Metadata } from "next";
import { prisma } from "@/lib/db";

export const metadata: Metadata = { title: "About PREDIQ" };

export default async function AboutPage() {
  const settings = await prisma.siteSettings.findUnique({ where: { id: "default" } });
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 md:px-6">
      <h1 className="font-[family-name:var(--font-display)] text-4xl">About PREDIQ</h1>
      <p className="mt-6 whitespace-pre-wrap text-[var(--text-muted)] leading-relaxed">
        {settings?.aboutText ||
          "PREDIQ is a premium platform for manually researched, AI-assisted sports predictions. Administrators select matches, research them, and explicitly publish analyses."}
      </p>
    </div>
  );
}
