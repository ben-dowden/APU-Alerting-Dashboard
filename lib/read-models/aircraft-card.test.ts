import { describe, expect, it } from "vitest";
import { fuelBurnAssumptionSettings } from "@/lib/fixtures/reference/fuel-assumptions";
import { reasonTaxonomySettings } from "@/lib/fixtures/reference/reason-taxonomy";
import { standCoordinateReferenceEvents } from "@/lib/fixtures/reference/stand-coordinates";
import { bneBaselineScenario } from "@/lib/fixtures/scenarios";
import { deriveAircraftCards } from "./aircraft-card";
import { deriveCurrentBoard } from "./current-board";

const settings = {
  reasonTaxonomy: reasonTaxonomySettings.payload.snapshot,
  fuelBurnAssumptions: fuelBurnAssumptionSettings,
  standCoordinates: standCoordinateReferenceEvents,
};

describe("deriveAircraftCards", () => {
  it("sorts cards as an operational work queue", () => {
    const board = deriveCurrentBoard(
      bneBaselineScenario.events,
      settings,
      "2026-05-22T08:55:00.000Z",
    );

    expect(deriveAircraftCards(board).map((card) => card.tail)).toEqual(["VH-8IA", "VH-YFX"]);
  });

  it("exposes stable aircraft card display fields", () => {
    const board = deriveCurrentBoard(
      bneBaselineScenario.events,
      settings,
      "2026-05-22T08:55:00.000Z",
    );

    expect(deriveAircraftCards(board)[0]).toEqual(
      expect.objectContaining({
        tail: "VH-8IA",
        aircraftType: "B738",
        bay: "Bay 20",
        stand: "20",
        groundMinutes: 55,
        apuRuntimeMinutes: 46,
        estimatedFuelKg: 85.9,
      }),
    );
  });
});
