import { describe, expect, it } from "vitest";
import { fuelBurnAssumptionSettings } from "@/lib/fixtures/reference/fuel-assumptions";
import { reasonTaxonomySettings } from "@/lib/fixtures/reference/reason-taxonomy";
import { standCoordinateReferenceEvents } from "@/lib/fixtures/reference/stand-coordinates";
import { bneBaselineScenario } from "@/lib/fixtures/scenarios";
import { deriveCurrentBoard } from "./current-board";
import { deriveDailyScorecard } from "./daily-scorecard";

const settings = {
  reasonTaxonomy: reasonTaxonomySettings.payload.snapshot,
  fuelBurnAssumptions: fuelBurnAssumptionSettings,
  standCoordinates: standCoordinateReferenceEvents,
};

describe("deriveDailyScorecard", () => {
  it("summarizes the command metric bar inputs from the current BNE board", () => {
    const board = deriveCurrentBoard(
      bneBaselineScenario.events,
      settings,
      "2026-05-22T08:55:00.000Z",
    );

    expect(deriveDailyScorecard(board)).toEqual({
      activeApuCount: 16,
      groundAircraftCount: 21,
      longRunnerCount: 7,
      longRunnerThresholdMinutes: 45,
      runtimeMinutesToday: 679,
      estimatedFuelKgToday: 1251.9,
      attributedRuntimePercent: 48.3,
      untaggedRuntimeMinutes: 351,
      untaggedRuntimePercent: 51.7,
      groundAircraftMinutes: 1179,
      apuIntensityPercent: 57.6,
    });
  });

  it("keeps percentage metrics at zero when there is no runtime or ground exposure", () => {
    expect(
      deriveDailyScorecard({
        port: "BNE",
        nowIso: "2026-05-22T08:55:00.000Z",
        groundAircraft: [],
      }),
    ).toEqual({
      activeApuCount: 0,
      groundAircraftCount: 0,
      longRunnerCount: 0,
      longRunnerThresholdMinutes: 45,
      runtimeMinutesToday: 0,
      estimatedFuelKgToday: 0,
      attributedRuntimePercent: 0,
      untaggedRuntimeMinutes: 0,
      untaggedRuntimePercent: 0,
      groundAircraftMinutes: 0,
      apuIntensityPercent: 0,
    });
  });
});
