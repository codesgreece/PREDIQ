import type { Metadata } from "next";
import { StaticPage } from "@/components/content/static-page";
import { el } from "@/lib/i18n/el";

export const metadata: Metadata = { title: el.pages.privacy.title };

export default function PrivacyPage() {
  return (
    <StaticPage title={el.pages.privacy.title}>
      <p>{el.pages.privacy.body}</p>
    </StaticPage>
  );
}
