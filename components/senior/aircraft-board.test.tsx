import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import type { ReasonSegment } from "@/lib/domain/reason-chain-reducer";
import { reasonTaxonomySettings } from "@/lib/fixtures/reference/reason-taxonomy";
import type { AircraftCardReadModel, GroundAircraftState } from "@/lib/read-models";
import { AircraftBoard } from "./aircraft-board";

const segmentForTail = (tail: string): ReasonSegment => ({
  reasonSegmentId: `reason:${tail}:001`,
  apuEventId: `BNE:${tail}:apu:2026-05-22T08:37:00.000Z`,
  categoryId: "cleaning-in-progress",
  categoryLabel: "Cleaning in progress",
  detailId: "cleaner-onboard",
  detailLabel: "Cleaner onboard",
  startedAt: "2026-05-22T08:45:00.000Z",
  selectedBy: "senior-engineer-bne",
  sourceEventIds: [`reason-selected:${tail}`],
});

const cardForTail = (tail: string): AircraftCardReadModel => ({
  tail,
  aircraftType: "B738",
  bay: "Bay 20",
  stand: "20",
  apuState: "on",
  statusLabel: "Review due",
  urgencyBucket: "review_overdue",
  urgencyRank: 1,
  urgencyScore: 122.5,
  urgencyReason: "Review overdue",
  urgencyTiebreakerBreakdown: {
    overdueMinutes: 0,
    runtimeMinutes: 46,
    estimatedFuelKg: 85.9,
    proximityCount: 0,
    groundMinutes: 55,
    sourceStalenessMinutes: 0,
  },
  groundMinutes: 55,
  apuRuntimeMinutes: 46,
  estimatedFuelKg: 85.9,
  currentReason: {
    categoryId: "cleaning-in-progress",
    categoryLabel: "Cleaning in progress",
    detailId: "cleaner-onboard",
    detailLabel: "Cleaner onboard",
    elapsedMinutes: 35,
  },
  reviewState: {
    reviewDueAt: "2026-05-22T09:15:00.000Z",
    isReviewDue: true,
  },
  manualOffPending: false,
  proximity: {
    closestAircraft: undefined,
    nearbyApuAircraft: [],
  },
  sourceCharms: [],
});

const groundAircraftForTail = (tail: string): GroundAircraftState => {
  const segment = segmentForTail(tail);

  return {
    tail,
    port: "BNE",
    aircraftType: "B738",
    flightNumber: "VA938",
    gateState: "on_ground",
    onGroundAt: "2026-05-22T08:00:00.000Z",
    bay: "Bay 20",
    stand: "20",
    standAssignmentState: "current",
    apuState: "on",
    apuEvent: {
      apuEventId: segment.apuEventId,
      tail,
      port: "BNE",
      startedAt: "2026-05-22T08:37:00.000Z",
      state: "open",
      closureType: "open",
      closureSourceEventIds: [],
      sourceEventIds: [`apu-on:${tail}`],
    },
    reasonChain: {
      segments: [segment],
      currentReason: segment,
      reviewDueAt: "2026-05-22T09:15:00.000Z",
      isReviewDue: true,
      reviewResponseTelemetry: [],
      isLocked: false,
    },
    manualOffPending: false,
    groundMinutes: 55,
    apuRuntimeMinutes: 46,
    fuelEstimate: {
      runtimeMinutes: 46,
      estimatedKg: 85.9,
      kgPerHour: 112,
      equipmentType: "B738",
      requestedEquipmentType: "B738",
      isFallback: false,
    },
    sourceCharms: [],
    sourceEventIds: [`apu-on:${tail}`],
  };
};

const noopHandlers = {
  onAddReasonNote: vi.fn(),
  onChangeReason: vi.fn(),
  onCorrectReason: vi.fn(),
  onCreateDataQualityFlag: vi.fn(),
  onKeepCurrentReason: vi.fn(),
  onMarkManualApuOff: vi.fn(),
  onSelectReason: vi.fn(),
};

describe("AircraftBoard", () => {
  it("positions reason chain drawers by their 3-column board index", () => {
    const tails = ["VH-AAA", "VH-BBB", "VH-CCC"];

    render(
      <AircraftBoard
        aircraft={tails.map(cardForTail)}
        groundAircraft={tails.map(groundAircraftForTail)}
        taxonomy={reasonTaxonomySettings.payload.snapshot}
        {...noopHandlers}
      />,
    );

    const cards = screen.getAllByRole("article");

    fireEvent.click(
      within(cards[0]).getByRole("button", { name: "Open reason drawer for VH-AAA" }),
    );
    expect(screen.getByRole("dialog", { name: "Reason chain for VH-AAA" })).toHaveClass(
      "left-0",
    );
    fireEvent.keyDown(document, { key: "Escape" });

    fireEvent.click(
      within(cards[1]).getByRole("button", { name: "Open reason drawer for VH-BBB" }),
    );
    expect(screen.getByRole("dialog", { name: "Reason chain for VH-BBB" })).toHaveClass(
      "xl:left-1/2",
      "xl:-translate-x-1/2",
    );
    fireEvent.keyDown(document, { key: "Escape" });

    fireEvent.click(
      within(cards[2]).getByRole("button", { name: "Open reason drawer for VH-CCC" }),
    );
    expect(screen.getByRole("dialog", { name: "Reason chain for VH-CCC" })).toHaveClass(
      "xl:right-0",
    );
  });
});
