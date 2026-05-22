import { describe, expect, it } from "vitest";
import { fuelBurnAssumptionSettings } from "@/lib/fixtures/reference/fuel-assumptions";
import { reasonTaxonomySettings } from "@/lib/fixtures/reference/reason-taxonomy";
import { standCoordinateReferenceEvents } from "@/lib/fixtures/reference/stand-coordinates";
import { bneBaselineScenario, bneMissingBurnAssumptionScenario } from "@/lib/fixtures/scenarios";
import { deriveCurrentBoard } from "./current-board";
import { deriveReasonTaggedBurnRows } from "./reason-tagged-burn";

const settings = {
  reasonTaxonomy: reasonTaxonomySettings.payload.snapshot,
  fuelBurnAssumptions: fuelBurnAssumptionSettings,
  standCoordinates: standCoordinateReferenceEvents,
};

describe("deriveReasonTaggedBurnRows", () => {
  it("reconciles reason-tagged rows to the APU event duration", () => {
    const board = deriveCurrentBoard(
      bneBaselineScenario.events,
      settings,
      "2026-05-22T08:55:00.000Z",
    );
    const rows = deriveReasonTaggedBurnRows(board);

    expect(rows.map((row) => row.runtimeMinutes)).toEqual([11, 35]);
    expect(rows.reduce((total, row) => total + row.runtimeMinutes, 0)).toBe(46);
    expect(rows.reduce((total, row) => total + row.estimatedKg, 0)).toBe(85.9);
  });

  it("keeps unattributed runtime as a first-class bucket", () => {
    const board = deriveCurrentBoard(
      bneBaselineScenario.events,
      settings,
      "2026-05-22T08:55:00.000Z",
    );

    expect(deriveReasonTaggedBurnRows(board)[0]).toEqual(
      expect.objectContaining({
        reasonCategoryId: "unattributed",
        reasonDetailId: "unattributed",
        isUnattributed: true,
      }),
    );
  });

  it("flags fallback burn assumptions", () => {
    const board = deriveCurrentBoard(
      bneMissingBurnAssumptionScenario.events,
      settings,
      "2026-05-22T12:55:00.000Z",
    );

    expect(deriveReasonTaggedBurnRows(board)).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          tail: "VH-ZHA",
          isFallbackFuelAssumption: true,
          fallbackReason: "Configured fallback when equipment type is missing or unmatched.",
        }),
      ]),
    );
  });
});
