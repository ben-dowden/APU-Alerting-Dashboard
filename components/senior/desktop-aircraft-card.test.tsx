import { render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import type { ReasonSegment } from "@/lib/domain/reason-chain-reducer";
import { reasonTaxonomySettings } from "@/lib/fixtures/reference/reason-taxonomy";
import type { AircraftCardReadModel, GroundAircraftState } from "@/lib/read-models";
import { DesktopAircraftCard } from "./desktop-aircraft-card";

const currentSegment: ReasonSegment = {
  reasonSegmentId: "reason:VH-8IA:001",
  apuEventId: "BNE:VH-8IA:apu:2026-05-22T08:37:00.000Z",
  categoryId: "cleaning-in-progress",
  categoryLabel: "Cleaning in progress",
  detailId: "cleaner-onboard",
  detailLabel: "Cleaner onboard",
  startedAt: "2026-05-22T08:45:00.000Z",
  selectedBy: "senior-engineer-bne",
  sourceEventIds: ["reason-selected"],
};

const baseCard: AircraftCardReadModel = {
  tail: "VH-8IA",
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
    categoryId: currentSegment.categoryId,
    categoryLabel: currentSegment.categoryLabel,
    detailId: currentSegment.detailId,
    detailLabel: currentSegment.detailLabel,
    elapsedMinutes: 35,
  },
  reviewState: {
    reviewDueAt: "2026-05-22T09:15:00.000Z",
    isReviewDue: true,
  },
  manualOffPending: false,
  proximity: {
    closestAircraft: {
      tail: "VH-YFX",
      stand: "21",
      bay: "Bay 21",
      apuState: "off",
      distanceMeters: 33,
    },
    nearbyApuAircraft: [],
  },
  sourceCharms: [],
};

const baseGroundAircraft: GroundAircraftState = {
  tail: "VH-8IA",
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
    apuEventId: currentSegment.apuEventId,
    tail: "VH-8IA",
    port: "BNE",
    startedAt: "2026-05-22T08:37:00.000Z",
    state: "open",
    closureType: "open",
    closureSourceEventIds: [],
    sourceEventIds: ["apu-on"],
  },
  reasonChain: {
    segments: [currentSegment],
    currentReason: currentSegment,
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
  sourceEventIds: ["apu-on"],
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

describe("DesktopAircraftCard", () => {
  it("shows Select reason for missing-reason cards", () => {
    render(
      <DesktopAircraftCard
        aircraft={{ ...baseCard, currentReason: undefined, reviewState: { isReviewDue: false }, statusLabel: "Reason missing", urgencyBucket: "missing_reason" }}
        groundAircraft={{
          ...baseGroundAircraft,
          reasonChain: {
            ...baseGroundAircraft.reasonChain,
            segments: [],
            currentReason: undefined,
            reviewDueAt: undefined,
            isReviewDue: false,
          },
        }}
        taxonomy={reasonTaxonomySettings.payload.snapshot}
        {...noopHandlers}
      />,
    );

    const currentReasonBlock = screen.getByRole("group", { name: "Current reason for VH-8IA" });
    expect(within(currentReasonBlock).getByRole("button", { name: "Select reason" })).toBeVisible();
  });

  it("places review and reason actions inside the current-reason block", () => {
    render(
      <DesktopAircraftCard
        aircraft={baseCard}
        groundAircraft={baseGroundAircraft}
        taxonomy={reasonTaxonomySettings.payload.snapshot}
        {...noopHandlers}
      />,
    );

    const currentReasonBlock = screen.getByRole("group", { name: "Current reason for VH-8IA" });
    const keepCurrent = within(currentReasonBlock).getByRole("button", {
      name: "Keep current reason for VH-8IA",
    });
    const changeReason = within(currentReasonBlock).getByRole("button", { name: "Change reason" });
    const drawerAction = within(currentReasonBlock).getByRole("button", {
      name: "Open reason drawer for VH-8IA",
    });

    expect(keepCurrent).toHaveAttribute("title", "Keep current reason");
    expect(keepCurrent.textContent).toBe("");
    expect(changeReason).toHaveClass("border-neutral-300");
    expect(drawerAction).toHaveClass("text-neutral-800");
  });

  it("pauses review prompts while manual APU-off confirmation is pending", () => {
    render(
      <DesktopAircraftCard
        aircraft={{
          ...baseCard,
          manualOffPending: true,
          statusLabel: "Manual off pending",
          urgencyBucket: "manual_off_pending",
        }}
        groundAircraft={{
          ...baseGroundAircraft,
          manualOffPending: true,
        }}
        taxonomy={reasonTaxonomySettings.payload.snapshot}
        {...noopHandlers}
      />,
    );

    expect(screen.getByText("Paused pending off")).toBeVisible();
    expect(screen.getByText("Pending off")).toHaveAttribute(
      "title",
      "Source confirmation outstanding",
    );
    expect(
      screen.queryByRole("button", { name: "Keep current reason for VH-8IA" }),
    ).not.toBeInTheDocument();
  });
});
