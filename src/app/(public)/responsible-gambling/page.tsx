import type { Metadata } from "next";
import { StaticPage } from "@/components/content/static-page";

export const metadata: Metadata = { title: "Responsible gambling" };

export default function ResponsibleGamblingPage() {
  return (
    <StaticPage title="Responsible gambling">
      <p>
        PREDIQ publishes analytical content and does not encourage reckless wagering.
        If gambling is causing harm, seek help from a local responsible-gambling
        organization and use deposit limits, time-outs, or self-exclusion tools
        offered by licensed operators.
      </p>
    </StaticPage>
  );
}
