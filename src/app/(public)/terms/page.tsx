import type { Metadata } from "next";
import { StaticPage } from "@/components/content/static-page";

export const metadata: Metadata = { title: "Terms of use" };

export default function TermsPage() {
  return (
    <StaticPage title="Terms of use">
      <p>
        PREDIQ content is informational. Predictions are not guarantees. You are
        responsible for complying with local laws regarding sports wagering.
        Past performance does not guarantee future results.
      </p>
    </StaticPage>
  );
}
