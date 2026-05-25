import { describe, expect, it } from "vitest";
import { fuelBurnAssumptionSettings } from "@/lib/fixtures/reference/fuel-assumptions";
import { reasonTaxonomySettings } from "@/lib/fixtures/reference/reason-taxonomy";
import { standCoordinateReferenceEvents } from "@/lib/fixtures/reference/stand-coordinates";
import { bneBaselineScenario } from "@/lib/fixtures/scenarios";
import type { CurrentBoardState, GroundAircraftState } from "./current-board";
import { deriveAircraftCards } from "./aircraft-card";
import { deriveCurrentBoard } from "./current-board";

const settings = {
  reasonTaxonomy: reasonTaxonomySettings.payload.snapshot,
  fuelBurnAssumptions: fuelBurnAssumptionSettings,
  standCoordinates: standCoordinateReferenceEvents,
};

const aircraft = (
  tail: string,
  overrides: Partial<GroundAircraftState>,
): GroundAircraftState => ({
  tail,
  port: "BNE",
  flightNumber: `VA-${tail}`,
  gateState: "on_ground",
  onGroundAt: "2026-05-22T08:00:00.000Z",
  apuState: "on",
  reasonChain: {
    segments: [],
    currentReason: undefined,
    reviewDueAt: undefined,
    isReviewDue: false,
    reviewResponseTelemetry: [],
    isLocked: false,
  },
  manualOffPending: false,
  groundMinutes: 60,
  apuRuntimeMinutes: 30,
  sourceCharms: [],
  sourceEventIds: [],
  ...overrides,
});

const boardForAircraft = (groundAircraft: GroundAircraftState[]): CurrentBoardState => ({
  port: "BNE",
  nowIso: "2026-05-22T09:00:00.000Z",
  groundAircraft,
});

describe("deriveAircraftCards", () => {
  it("sorts cards as an operational work queue", () => {
    const board = deriveCurrentBoard(
      bneBaselineScenario.events,
      settings,
      "2026-05-22T08:55:00.000Z",
    );

    expect(deriveAircraftCards(board).map((card) => card.tail)).toEqual([
      "VH-VUK",
      "VH-VUY",
      "VH-YFW",
      "VH-YQO",
      "VH-8FE",
      "VH-YIR",
      "VH-8IA",
      "VH-VUZ",
      "VH-VUT",
      "VH-VOP",
      "VH-VUL",
      "VH-YVA",
      "VH-YIT",
      "VH-8XB",
      "VH-8NJ",
      "VH-YWE",
      "VH-YFX",
      "VH-VUF",
      "VH-8FP",
      "VH-VUQ",
      "VH-YFR",
    ]);
  });

  it("exposes stable aircraft card display fields", () => {
    const board = deriveCurrentBoard(
      bneBaselineScenario.events,
      settings,
      "2026-05-22T08:55:00.000Z",
    );

    expect(deriveAircraftCards(board).find((card) => card.tail === "VH-8IA")).toEqual(
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

  it("applies urgency policy before runtime ordering", () => {
    const currentReason = {
      reasonSegmentId: "reason:VH-OK:001",
      apuEventId: "apu:VH-OK",
      categoryId: "cleaning-in-progress",
      categoryLabel: "Cleaning in progress",
      detailId: "cleaner-onboard",
      detailLabel: "Cleaner onboard",
      startedAt: "2026-05-22T08:30:00.000Z",
      selectedBy: "senior-engineer-bne",
      sourceEventIds: ["reason-selected"],
    };

    const cards = deriveAircraftCards(
      boardForAircraft([
        aircraft("VH-OFF", { apuState: "off", apuRuntimeMinutes: 120 }),
        aircraft("VH-OK", {
          apuRuntimeMinutes: 90,
          reasonChain: {
            segments: [currentReason],
            currentReason,
            reviewDueAt: "2026-05-22T09:30:00.000Z",
            isReviewDue: false,
            reviewResponseTelemetry: [],
            isLocked: false,
          },
        }),
        aircraft("VH-MAN", { manualOffPending: true, apuRuntimeMinutes: 100 }),
        aircraft("VH-MISS", { apuRuntimeMinutes: 10 }),
      ]),
    );

    expect(cards.map((card) => [card.tail, card.urgencyBucket, card.statusLabel])).toEqual([
      ["VH-MISS", "missing_reason", "Reason missing"],
      ["VH-OK", "active_valid_reason", "Current reason"],
      ["VH-MAN", "manual_off_pending", "Manual off pending"],
      ["VH-OFF", "apu_off", "APU off"],
    ]);
  });
});
