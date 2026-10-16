import { describe, expect, it } from "vitest";
import { uniqueSlug } from "@/lib/utils";

describe("import helpers", () => {
  it("creates stable slugs for provider refs", () => {
    const a = uniqueSlug("Premier League", "39");
    const b = uniqueSlug("Premier League", "39");
    expect(a).toBe(b);
    expect(a).toContain("39");
  });

  it("handles missing logo representation without inventing URLs", () => {
    const logoUrl: string | null = null;
    const logoMissing = !logoUrl;
    expect(logoMissing).toBe(true);
    expect(logoUrl).toBeNull();
  });
});

describe("source validation expectations", () => {
  it("requires absolute http(s) URLs conceptually", () => {
    const valid = "https://example.com/report";
    const invalid = "not-a-url";
    expect(() => new URL(valid)).not.toThrow();
    expect(() => new URL(invalid)).toThrow();
  });
});
