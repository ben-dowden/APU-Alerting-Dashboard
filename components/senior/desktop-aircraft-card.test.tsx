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
    const actionRail = screen.getByRole("group", { name: "VH-8IA actions" });
    const reasonActions = within(actionRail).getByRole("group", {
      name: "Reason actions for VH-8IA",
    });

    expect(within(currentReasonBlock).getByText("Reason pending")).toBeVisible();
    expect(within(currentReasonBlock).queryByRole("button")).not.toBeInTheDocument();
    expect(within(reasonActions).getByRole("button", { name: "Select reason" })).toBeVisible();
  });

  it("lays out the fixed card anatomy with compact context and bottom actions", () => {
    render(
      <DesktopAircraftCard
        aircraft={baseCard}
        groundAircraft={baseGroundAircraft}
        taxonomy={reasonTaxonomySettings.payload.snapshot}
        {...noopHandlers}
      />,
    );

    const card = screen.getByRole("article", { name: "VH-8IA aircraft card" });
    const statusRow = within(card).getByRole("group", { name: "VH-8IA status" });
    const metricRow = within(card).getByRole("group", { name: "VH-8IA metrics" });
    const contextStack = within(card).getByRole("group", { name: "VH-8IA context" });
    const actionRail = within(card).getByRole("group", { name: "VH-8IA actions" });
    const currentReasonBlock = within(contextStack).getByRole("group", {
      name: "Current reason for VH-8IA",
    });
    const reasonActions = within(actionRail).getByRole("group", {
      name: "Reason actions for VH-8IA",
    });
    const utilityActions = within(actionRail).getByRole("group", {
      name: "Utility actions for VH-8IA",
    });
    const keepCurrent = within(reasonActions).getByRole("button", {
      name: "Keep current reason for VH-8IA",
    });
    const changeReason = within(reasonActions).getByRole("button", { name: "Change reason" });
    const manualOffAction = within(utilityActions).getByRole("button", {
      name: "Manually mark APU off for VH-8IA",
    });
    const drawerAction = within(utilityActions).getByRole("button", {
      name: "Open reason drawer for VH-8IA",
    });
    const flagAction = within(utilityActions).getByRole("button", {
      name: "Flag data quality for VH-8IA",
    });

    expect(card).toHaveClass("h-[260px]");
    expect(within(statusRow).getByText("VH-8IA")).toHaveClass("text-lg", "font-semibold");
    expect(within(statusRow).getByRole("status", { name: "APU On" })).toBeVisible();
    expect(within(metricRow).getByText("Est. Fuel Burn")).toBeVisible();
    expect(within(metricRow).getByText("85.9 kg")).toHaveClass(
      "text-base",
      "font-semibold",
      "tabular-nums",
    );
    expect(within(currentReasonBlock).getByText("Cleaning in progress")).toBeVisible();
    expect(within(currentReasonBlock).getByText("00:35")).toHaveClass("tabular-nums");
    expect(within(contextStack).queryByText("Review")).not.toBeInTheDocument();
    expect(keepCurrent).toHaveAttribute("title", "Keep current reason");
    expect(keepCurrent).toHaveClass("text-neutral-800");
    expect(keepCurrent.textContent).toBe("");
    expect(changeReason).toHaveClass("border-neutral-300");
    expect(manualOffAction).toHaveClass("text-virgin-red");
    expect(drawerAction).toHaveClass("text-neutral-800");
    expect(flagAction).toHaveClass("text-neutral-800");
    expect(screen.getByText("Nearby Tail")).toBeVisible();
    expect(screen.getByText("VH-YFX")).toBeVisible();
    expect(screen.getByText("33m")).toBeVisible();
    expect(
      screen.getByRole("button", { name: "Nearby aircraft for VH-8IA" }),
    ).not.toHaveTextContent(/Closest tail:/);
  });

  it("shows pending APU status while manual confirmation is outstanding", () => {
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

    expect(screen.getByRole("status", { name: "Pending off" })).toBeVisible();
    expect(
      screen.queryByRole("button", { name: "Manually mark APU off for VH-8IA" }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Keep current reason for VH-8IA" }),
    ).not.toBeInTheDocument();
  });
});
