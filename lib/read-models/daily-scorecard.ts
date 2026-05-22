import type { CurrentBoardState } from "./current-board";
import { deriveReasonTaggedBurnRows } from "./reason-tagged-burn";

export type DailyScorecard = {
  activeApuCount: number;
  runtimeMinutesToday: number;
  estimatedFuelKgToday: number;
  attributedRuntimePercent: number;
};

const roundOne = (value: number) => Math.round(value * 10) / 10;

export const deriveDailyScorecard = (boardState: CurrentBoardState): DailyScorecard => {
  const burnRows = deriveReasonTaggedBurnRows(boardState);
  const runtimeMinutesToday = burnRows.reduce((total, row) => total + row.runtimeMinutes, 0);
  const estimatedFuelKgToday = roundOne(burnRows.reduce((total, row) => total + row.estimatedKg, 0));
  const attributedRuntimeMinutes = burnRows
    .filter((row) => !row.isUnattributed)
    .reduce((total, row) => total + row.runtimeMinutes, 0);

  return {
    activeApuCount: boardState.groundAircraft.filter((aircraft) => aircraft.apuState === "on").length,
    runtimeMinutesToday,
    estimatedFuelKgToday,
    attributedRuntimePercent:
      runtimeMinutesToday === 0 ? 0 : roundOne((attributedRuntimeMinutes / runtimeMinutesToday) * 100),
  };
};
