import type { DomainEvent } from "@/lib/events";
import { minutesBetweenIso } from "@/lib/domain/time";
import { fuelBurnAssumptionSettings } from "@/lib/fixtures/reference/fuel-assumptions";
import { reasonTaxonomySettings } from "@/lib/fixtures/reference/reason-taxonomy";
import { standCoordinateReferenceEvents } from "@/lib/fixtures/reference/stand-coordinates";
import { bneBaselineScenario } from "@/lib/fixtures/scenarios";
import { deriveAircraftCards } from "./aircraft-card";
import type { GroundAircraftState } from "./current-board";
import { deriveCurrentBoard } from "./current-board";
import { deriveDailyScorecard } from "./daily-scorecard";
import { deriveScorecardTrend } from "./scorecard-trend";

export const bneBoardNowIso = "2026-05-22T08:55:00.000Z";

export const bneBenchmarkBaselines = {
  similar_temperature: { runtimeMinutes: 38, fuelKg: 70, apuIntensityPercent: 45.6 },
  weekly_average: { runtimeMinutes: 44, fuelKg: 81, apuIntensityPercent: 48.6 },
  monthly_average: { runtimeMinutes: 49, fuelKg: 90, apuIntensityPercent: 42.6 },
  annual_average: { runtimeMinutes: 52, fuelKg: 96, apuIntensityPercent: 39.6 },
};

export const bneBoardProjectionSettings = {
  reasonTaxonomy: reasonTaxonomySettings.payload.snapshot,
  fuelBurnAssumptions: fuelBurnAssumptionSettings,
  standCoordinates: standCoordinateReferenceEvents,
};

const formatBneLocalTime = (iso: string) =>
  `${new Intl.DateTimeFormat("en-AU", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: "Australia/Brisbane",
  }).format(new Date(iso))} AEST`;

const latestSourceReceivedAt = (board: ReturnType<typeof deriveCurrentBoard>) =>
  board.groundAircraft
    .flatMap((aircraft) => aircraft.sourceCharms.map((source) => source.receivedAt))
    .sort()
    .at(-1);

const sourceFreshnessLabel = (board: ReturnType<typeof deriveCurrentBoard>) => {
  const latestReceivedAt = latestSourceReceivedAt(board);

  return latestReceivedAt
    ? `Feed fresh ${minutesBetweenIso(latestReceivedAt, board.nowIso)}m ago`
    : "Feed pending";
};

export const sourceFreshnessForAircraft = (
  aircraft: GroundAircraftState,
  nowIso: string,
) => {
  const latestReceivedAt = aircraft.sourceCharms
    .map((source) => source.receivedAt)
    .sort()
    .at(-1);

  return {
    latestReceivedAt,
    latencyMinutes: latestReceivedAt ? minutesBetweenIso(latestReceivedAt, nowIso) : undefined,
    sourceSystems: [...new Set(aircraft.sourceCharms.map((source) => source.sourceSystem))],
  };
};

export const deriveBneBoardProjection = (workflowEvents: readonly DomainEvent[]) => {
  const boardEvents = [...bneBaselineScenario.events, ...workflowEvents];
  const board = deriveCurrentBoard(boardEvents, bneBoardProjectionSettings, bneBoardNowIso);
  const scorecard = deriveDailyScorecard(board);
  const scorecardTrend = deriveScorecardTrend(
    boardEvents,
    bneBoardProjectionSettings,
    bneBoardNowIso,
  );
  const aircraftCards = deriveAircraftCards(board);
  const benchmarkCurrent = {
    runtimeMinutes: scorecard.runtimeMinutesToday,
    fuelKg: scorecard.estimatedFuelKgToday,
    temperatureC: board.weather?.temperatureC ?? 0,
    apuIntensityPercent: scorecard.apuIntensityPercent,
  };

  return {
    aircraftCards,
    benchmarkBaselines: bneBenchmarkBaselines,
    benchmarkCurrent,
    board,
    boardEvents,
    localTimeLabel: formatBneLocalTime(board.nowIso),
    scorecard,
    scorecardTrend,
    sourceFreshnessLabel: sourceFreshnessLabel(board),
    temperatureLabel: `${board.weather?.temperatureC ?? "--"}°C`,
  };
};
