import { describe, expect, it } from "vitest";
import { fuelBurnAssumptionSettings } from "@/lib/fixtures/reference/fuel-assumptions";
import { reasonTaxonomySettings } from "@/lib/fixtures/reference/reason-taxonomy";
import { standCoordinateReferenceEvents } from "@/lib/fixtures/reference/stand-coordinates";
import { bneBaselineScenario, bneMissingBurnAssumptionScenario } from "@/lib/fixtures/scenarios";
import type { CurrentBoardState, GroundAircraftState } from "./current-board";
import { deriveCurrentBoard } from "./current-board";
import { deriveReasonTaggedBurnRows } from "./reason-tagged-burn";

const settings = {
  reasonTaxonomy: reasonTaxonomySettings.payload.snapshot,
  fuelBurnAssumptions: fuelBurnAssumptionSettings,
  standCoordinates: standCoordinateReferenceEvents,
};

const aircraftWithReasonSegments = (
  kgPerHour: number,
  estimatedKg: number,
): GroundAircraftState => ({
  tail: "VH-TST",
  port: "BNE",
  aircraftType: "B737-800",
  flightNumber: "VA100",
  gateState: "on_ground",
  onGroundAt: "2026-05-22T08:00:00.000Z",
  apuState: "on",
  apuEvent: {
    apuEventId: "BNE:VH-TST:apu:2026-05-22T08:00:00.000Z",
    tail: "VH-TST",
    port: "BNE",
    startedAt: "2026-05-22T08:00:00.000Z",
    endedAt: "2026-05-22T09:00:00.000Z",
    state: "closed",
    closureType: "source_off",
    closureConfidence: "high",
    closureSourceEventIds: ["apu-off"],
    sourceEventIds: ["apu-on", "apu-off"],
  },
  reasonChain: {
    segments: [
      {
        reasonSegmentId: "reason:VH-TST:001",
        apuEventId: "BNE:VH-TST:apu:2026-05-22T08:00:00.000Z",
        categoryId: "cleaning-in-progress",
        categoryLabel: "Cleaning in progress",
        detailId: "cleaner-onboard",
        detailLabel: "Cleaner onboard",
        startedAt: "2026-05-22T07:50:00.000Z",
        endedAt: "2026-05-22T08:10:00.000Z",
        selectedBy: "senior-engineer-bne",
        sourceEventIds: ["reason-selected-1"],
      },
      {
        reasonSegmentId: "reason:VH-TST:002",
        apuEventId: "BNE:VH-TST:apu:2026-05-22T08:00:00.000Z",
        categoryId: "engineering-requirement",
        categoryLabel: "Engineering requirement",
        detailId: "maintenance-task-in-progress",
        detailLabel: "Maintenance task in progress",
        startedAt: "2026-05-22T08:30:00.000Z",
        endedAt: "2026-05-22T08:45:00.000Z",
        selectedBy: "senior-engineer-bne",
        sourceEventIds: ["reason-selected-2"],
      },
    ],
    currentReason: undefined,
    reviewDueAt: undefined,
    isReviewDue: false,
    reviewResponseTelemetry: [],
    isLocked: true,
  },
  manualOffPending: false,
  groundMinutes: 60,
  apuRuntimeMinutes: 60,
  fuelEstimate: {
    runtimeMinutes: 60,
    estimatedKg,
    kgPerHour,
    equipmentType: "B737-800",
    requestedEquipmentType: "B737-800",
    isFallback: false,
  },
  sourceCharms: [],
  sourceEventIds: ["flight", "apu-on", "apu-off"],
});

const boardForAircraft = (aircraft: GroundAircraftState): CurrentBoardState => ({
  port: "BNE",
  nowIso: "2026-05-22T09:00:00.000Z",
  groundAircraft: [aircraft],
});

describe("deriveReasonTaggedBurnRows", () => {
  it("reconciles reason-tagged rows to the APU event duration", () => {
    const board = deriveCurrentBoard(
      bneBaselineScenario.events,
      settings,
      "2026-05-22T08:55:00.000Z",
    );
    const rows = deriveReasonTaggedBurnRows(board);

    expect(rows).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          tail: "VH-8IA",
          reasonDetailId: "cleaner-onboard",
          runtimeMinutes: 35,
        }),
        expect.objectContaining({
          tail: "VH-VUK",
          reasonCategoryId: "unattributed",
          runtimeMinutes: 57,
        }),
      ]),
    );
    expect(rows.reduce((total, row) => total + row.runtimeMinutes, 0)).toBe(679);
    expect(rows.reduce((total, row) => Math.round((total + row.estimatedKg) * 10) / 10, 0)).toBe(
      1251.9,
    );
  });

  it("keeps unattributed runtime as a first-class bucket", () => {
    const board = deriveCurrentBoard(
      bneBaselineScenario.events,
      settings,
      "2026-05-22T08:55:00.000Z",
    );

    expect(deriveReasonTaggedBurnRows(board)).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          reasonCategoryId: "unattributed",
          reasonDetailId: "unattributed",
          isUnattributed: true,
        }),
      ]),
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

  it("clamps reason segments to APU runtime and fills unattributed gaps", () => {
    const rows = deriveReasonTaggedBurnRows(
      boardForAircraft(aircraftWithReasonSegments(60, 60)),
    );

    expect(rows.map((row) => [row.reasonDetailId, row.startedAt, row.endedAt, row.runtimeMinutes])).toEqual([
      ["cleaner-onboard", "2026-05-22T08:00:00.000Z", "2026-05-22T08:10:00.000Z", 10],
      ["unattributed", "2026-05-22T08:10:00.000Z", "2026-05-22T08:30:00.000Z", 20],
      ["maintenance-task-in-progress", "2026-05-22T08:30:00.000Z", "2026-05-22T08:45:00.000Z", 15],
      ["unattributed", "2026-05-22T08:45:00.000Z", "2026-05-22T09:00:00.000Z", 15],
    ]);
  });

  it("reconciles row fuel rounding on the final slice", () => {
    const rows = deriveReasonTaggedBurnRows(
      boardForAircraft(aircraftWithReasonSegments(100, 100)),
    );

    expect(rows.map((row) => row.estimatedKg)).toEqual([16.7, 33.3, 25, 25]);
    expect(rows.reduce((total, row) => Math.round((total + row.estimatedKg) * 10) / 10, 0)).toBe(100);
  });
});
