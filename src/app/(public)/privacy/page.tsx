import type { Metadata } from "next";
import { StaticPage } from "@/components/content/static-page";

export const metadata: Metadata = { title: "Privacy policy" };

export default function PrivacyPage() {
  return (
    <StaticPage title="Privacy policy">
      <p>
        PREDIQ stores administrator authentication sessions in HTTP-only cookies.
        Public visitors can browse published predictions without creating an account.
        Public registration is disabled. Contact the site operator for data requests.
      </p>
    </StaticPage>
  );
}
