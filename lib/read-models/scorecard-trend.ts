import { addMinutesIso } from "@/lib/domain/time";

import { deriveCurrentBoard, type CurrentBoardSettings } from "./current-board";
import { deriveDailyScorecard } from "./daily-scorecard";

export type ScorecardTrendPoint = {
  timestamp: string;
  activeApuCount: number;
  longRunnerCount: number;
  untaggedRuntimePercent: number;
  apuIntensityPercent: number;
};

export const scorecardTrendLookbackHours = 6;

export const deriveScorecardTrend = (
  events: readonly unknown[],
  settings: CurrentBoardSettings,
  nowIso: string,
): ScorecardTrendPoint[] =>
  Array.from({ length: scorecardTrendLookbackHours + 1 }, (_, index) => {
    const timestamp = addMinutesIso(nowIso, (index - scorecardTrendLookbackHours) * 60);
    const scorecard = deriveDailyScorecard(deriveCurrentBoard(events, settings, timestamp));

    return {
      timestamp,
      activeApuCount: scorecard.activeApuCount,
      longRunnerCount: scorecard.longRunnerCount,
      untaggedRuntimePercent: scorecard.untaggedRuntimePercent,
      apuIntensityPercent: scorecard.apuIntensityPercent,
    };
  });
