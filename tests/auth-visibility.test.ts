import { describe, expect, it } from "vitest";
import { buildPublicWhere } from "@/lib/predictions/queries";

describe("public prediction visibility", () => {
  it("always constrains to PUBLISHED", () => {
    const where = buildPublicWhere({
      page: 1,
      pageSize: 12,
      sort: "published_desc",
    });
    expect(where.publicationStatus).toBe("PUBLISHED");
  });

  it("applies settlement and market filters safely", () => {
    const where = buildPublicWhere({
      page: 1,
      pageSize: 12,
      sort: "published_desc",
      status: "WON",
      market: "MATCH_RESULT_1X2",
      sport: "football",
    });
    expect(where.settlementStatus).toBe("WON");
    expect(where.marketType).toBe("MATCH_RESULT_1X2");
    expect(where.sport).toEqual({ slug: "football" });
  });
});
