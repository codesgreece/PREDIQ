import type { PredictionMarketType, SettlementStatus } from "@prisma/client";

export type MatchScore = {
  home: number;
  away: number;
};

export type SettlementInput = {
  marketType: PredictionMarketType;
  selection: string;
  selectionDetail?: string | null;
  score: MatchScore;
  matchAbandoned?: boolean;
};

function normalize(value: string): string {
  return value.trim().toUpperCase().replace(/\s+/g, "_");
}

/**
 * Market-specific settlement rules.
 * A finished match alone does not imply WON/LOST — selection semantics matter.
 */
export function settleSelection(input: SettlementInput): SettlementStatus {
  if (input.matchAbandoned) return "VOID";

  const { home, away } = input.score;
  if (
    !Number.isInteger(home) ||
    !Number.isInteger(away) ||
    home < 0 ||
    away < 0
  ) {
    throw new Error("Invalid final score");
  }

  const selection = normalize(input.selection);
  const totalGoals = home + away;

  switch (input.marketType) {
    case "MATCH_RESULT_1X2": {
      const result = home > away ? "HOME" : home < away ? "AWAY" : "DRAW";
      const aliases: Record<string, string> = {
        "1": "HOME",
        HOME: "HOME",
        HOME_WIN: "HOME",
        X: "DRAW",
        DRAW: "DRAW",
        "2": "AWAY",
        AWAY: "AWAY",
        AWAY_WIN: "AWAY",
      };
      const mapped = aliases[selection];
      if (!mapped) throw new Error(`Unsupported 1X2 selection: ${input.selection}`);
      return mapped === result ? "WON" : "LOST";
    }
    case "DOUBLE_CHANCE": {
      const result = home > away ? "HOME" : home < away ? "AWAY" : "DRAW";
      const map: Record<string, string[]> = {
        "1X": ["HOME", "DRAW"],
        HOME_OR_DRAW: ["HOME", "DRAW"],
        X2: ["DRAW", "AWAY"],
        DRAW_OR_AWAY: ["DRAW", "AWAY"],
        "12": ["HOME", "AWAY"],
        HOME_OR_AWAY: ["HOME", "AWAY"],
      };
      const accepted = map[selection];
      if (!accepted) {
        throw new Error(`Unsupported double-chance selection: ${input.selection}`);
      }
      return accepted.includes(result) ? "WON" : "LOST";
    }
    case "OVER_UNDER": {
      const lineRaw =
        input.selectionDetail ??
        selection.replace(/^(OVER|UNDER)_?/, "").replace(",", ".");
      const line = Number(lineRaw);
      if (!Number.isFinite(line)) {
        throw new Error("Over/Under requires a numeric line in selectionDetail");
      }
      const side = selection.startsWith("UNDER")
        ? "UNDER"
        : selection.startsWith("OVER")
          ? "OVER"
          : normalize(input.selection).includes("UNDER")
            ? "UNDER"
            : "OVER";
      if (totalGoals === line) return "VOID";
      if (side === "OVER") return totalGoals > line ? "WON" : "LOST";
      return totalGoals < line ? "WON" : "LOST";
    }
    case "BOTH_TEAMS_TO_SCORE": {
      const btts = home > 0 && away > 0;
      if (selection === "YES" || selection === "BTTS_YES") {
        return btts ? "WON" : "LOST";
      }
      if (selection === "NO" || selection === "BTTS_NO") {
        return btts ? "LOST" : "WON";
      }
      throw new Error(`Unsupported BTTS selection: ${input.selection}`);
    }
    case "DRAW_NO_BET": {
      if (home === away) return "VOID";
      const winner = home > away ? "HOME" : "AWAY";
      const aliases: Record<string, string> = {
        "1": "HOME",
        HOME: "HOME",
        "2": "AWAY",
        AWAY: "AWAY",
      };
      const mapped = aliases[selection];
      if (!mapped) {
        throw new Error(`Unsupported draw-no-bet selection: ${input.selection}`);
      }
      return mapped === winner ? "WON" : "LOST";
    }
    case "OTHER":
      throw new Error(
        "OTHER markets require manual settlement status — automatic rules are not defined",
      );
    default:
      throw new Error(`Unsupported market type: ${input.marketType}`);
  }
}
