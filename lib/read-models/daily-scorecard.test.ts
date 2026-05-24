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
  it("summarizes active APU count, runtime, fuel, and attributed runtime", () => {
    const board = deriveCurrentBoard(
      bneBaselineScenario.events,
      settings,
      "2026-05-22T08:55:00.000Z",
    );

    expect(deriveDailyScorecard(board)).toEqual(
      expect.objectContaining({
        activeApuCount: 16,
        runtimeMinutesToday: 679,
        estimatedFuelKgToday: 1251.9,
        attributedRuntimePercent: 48.3,
      }),
    );
  });
});
