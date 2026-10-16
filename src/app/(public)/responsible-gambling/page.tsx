import type { Metadata } from "next";
import { StaticPage } from "@/components/content/static-page";
import { el } from "@/lib/i18n/el";

export const metadata: Metadata = { title: el.pages.responsible.title };

export default function ResponsibleGamblingPage() {
  return (
    <StaticPage title={el.pages.responsible.title}>
      <p>{el.pages.responsible.body}</p>
    </StaticPage>
  );
}
