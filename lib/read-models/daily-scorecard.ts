import type { CurrentBoardState } from "./current-board";
import { deriveReasonTaggedBurnRows } from "./reason-tagged-burn";

export const longRunnerThresholdMinutes = 45;

export type DailyScorecard = {
  activeApuCount: number;
  groundAircraftCount: number;
  longRunnerCount: number;
  longRunnerThresholdMinutes: number;
  runtimeMinutesToday: number;
  estimatedFuelKgToday: number;
  attributedRuntimePercent: number;
  untaggedRuntimeMinutes: number;
  untaggedRuntimePercent: number;
  groundAircraftMinutes: number;
  apuIntensityPercent: number;
};

const roundOne = (value: number) => Math.round(value * 10) / 10;

const percentOf = (part: number, total: number) =>
  total === 0 ? 0 : roundOne((part / total) * 100);

export const deriveDailyScorecard = (boardState: CurrentBoardState): DailyScorecard => {
  const burnRows = deriveReasonTaggedBurnRows(boardState);
  const runtimeMinutesToday = burnRows.reduce((total, row) => total + row.runtimeMinutes, 0);
  const estimatedFuelKgToday = roundOne(burnRows.reduce((total, row) => total + row.estimatedKg, 0));
  const attributedRuntimeMinutes = burnRows
    .filter((row) => !row.isUnattributed)
    .reduce((total, row) => total + row.runtimeMinutes, 0);
  const untaggedRuntimeMinutes = runtimeMinutesToday - attributedRuntimeMinutes;
  const groundAircraftMinutes = boardState.groundAircraft.reduce(
    (total, aircraft) => total + aircraft.groundMinutes,
    0,
  );

  return {
    activeApuCount: boardState.groundAircraft.filter((aircraft) => aircraft.apuState === "on").length,
    groundAircraftCount: boardState.groundAircraft.length,
    longRunnerCount: boardState.groundAircraft.filter(
      (aircraft) =>
        aircraft.apuState === "on" && aircraft.apuRuntimeMinutes > longRunnerThresholdMinutes,
    ).length,
    longRunnerThresholdMinutes,
    runtimeMinutesToday,
    estimatedFuelKgToday,
    attributedRuntimePercent: percentOf(attributedRuntimeMinutes, runtimeMinutesToday),
    untaggedRuntimeMinutes,
    untaggedRuntimePercent: percentOf(untaggedRuntimeMinutes, runtimeMinutesToday),
    groundAircraftMinutes,
    apuIntensityPercent: percentOf(runtimeMinutesToday, groundAircraftMinutes),
  };
};
