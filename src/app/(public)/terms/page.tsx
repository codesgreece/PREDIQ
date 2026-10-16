import type { Metadata } from "next";
import { StaticPage } from "@/components/content/static-page";
import { el } from "@/lib/i18n/el";

export const metadata: Metadata = { title: el.pages.terms.title };

export default function TermsPage() {
  return (
    <StaticPage title={el.pages.terms.title}>
      <p>{el.pages.terms.body}</p>
    </StaticPage>
  );
}
