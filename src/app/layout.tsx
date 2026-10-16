import type { Metadata } from "next";
import { Manrope, Syne } from "next/font/google";
import "./globals.css";
import { getEnv } from "@/lib/env";

const display = Syne({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["600", "700", "800"],
});

const body = Manrope({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const appUrl = process.env.APP_URL || "http://127.0.0.1:3847";

export const metadata: Metadata = {
  metadataBase: new URL(appUrl),
  title: {
    default: "PREDIQ — AI Sports Predictions",
    template: "%s · PREDIQ",
  },
  description:
    "Manually researched, AI-assisted sports predictions. Published analyses only — no fixtures feed, no live scores, no auto-tips.",
  openGraph: {
    title: "PREDIQ — AI Sports Predictions",
    description:
      "Evidence-based sports analysis with administrator-reviewed publication.",
    url: appUrl,
    siteName: "PREDIQ",
    type: "website",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Validate env early in server runtime without crashing static tooling when unset in edge cases.
  try {
    getEnv();
  } catch {
    // Build-time pages that do not touch DB may still render; runtime routes enforce env.
  }

  return (
    <html lang="el">
      <body
        className={`${display.variable} ${body.variable} font-sans antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
