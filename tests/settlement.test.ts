import { describe, expect, it } from "vitest";
import { settleSelection } from "@/lib/settlement/rules";

describe("settlement rules", () => {
  it("settles 1X2 by match winner, not merely by match finishing", () => {
    expect(
      settleSelection({
        marketType: "MATCH_RESULT_1X2",
        selection: "HOME",
        score: { home: 2, away: 1 },
      }),
    ).toBe("WON");
    expect(
      settleSelection({
        marketType: "MATCH_RESULT_1X2",
        selection: "HOME",
        score: { home: 0, away: 1 },
      }),
    ).toBe("LOST");
  });

  it("voids over/under on exact line", () => {
    expect(
      settleSelection({
        marketType: "OVER_UNDER",
        selection: "OVER",
        selectionDetail: "2.5",
        score: { home: 1, away: 1 },
      }),
    ).toBe("LOST");
    expect(
      settleSelection({
        marketType: "OVER_UNDER",
        selection: "OVER",
        selectionDetail: "2.0",
        score: { home: 1, away: 1 },
      }),
    ).toBe("VOID");
  });

  it("does not settle over/under from match winner alone", () => {
    expect(
      settleSelection({
        marketType: "OVER_UNDER",
        selection: "UNDER",
        selectionDetail: "2.5",
        score: { home: 3, away: 0 },
      }),
    ).toBe("LOST");
  });

  it("settles BTTS and draw-no-bet including void on draw", () => {
    expect(
      settleSelection({
        marketType: "BOTH_TEAMS_TO_SCORE",
        selection: "YES",
        score: { home: 1, away: 1 },
      }),
    ).toBe("WON");
    expect(
      settleSelection({
        marketType: "DRAW_NO_BET",
        selection: "HOME",
        score: { home: 1, away: 1 },
      }),
    ).toBe("VOID");
  });

  it("voids abandoned matches", () => {
    expect(
      settleSelection({
        marketType: "MATCH_RESULT_1X2",
        selection: "HOME",
        score: { home: 0, away: 0 },
        matchAbandoned: true,
      }),
    ).toBe("VOID");
  });
});
