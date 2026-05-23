import { act, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import SeniorBneWallboardPage from "@/app/senior/bne/wallboard/page";
import type { AircraftCardReadModel } from "@/lib/read-models";
import { WallboardAircraftCarousel } from "./wallboard-aircraft-carousel";

const aircraftCard = (tail: string, urgencyRank: number): AircraftCardReadModel => ({
  tail,
  aircraftType: "B738",
  bay: `Bay ${20 + urgencyRank}`,
  stand: `${20 + urgencyRank}`,
  apuState: "on",
  statusLabel: "Review due",
  urgencyBucket: "review_overdue",
  urgencyRank,
  urgencyScore: 100 - urgencyRank,
  urgencyReason: "Review overdue",
  urgencyTiebreakerBreakdown: {
    overdueMinutes: 1,
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
    closestAircraft: {
      tail: "VH-YFX",
      stand: "21",
      bay: "Bay 21",
      apuState: "off",
      distanceMeters: 33,
    },
    nearbyApuAircraft: [],
  },
  sourceCharms: [
    {
      sourceSystem: "ACMS",
      sourceEventId: `${tail}-ACMS`,
      confidence: "high",
      receivedAt: "2026-05-22T08:10:00.000Z",
    },
  ],
});

describe("SeniorBneWallboardPage", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("renders the read-only BNE wallboard shell", () => {
    render(<SeniorBneWallboardPage />);

    expect(screen.getByRole("heading", { name: "BNE Wallboard", level: 1 })).toBeVisible();
    expect(screen.getByText("APU on now")).toBeVisible();
    expect(screen.getByRole("region", { name: "Wallboard side index" })).toBeVisible();
  });

  it("renders a read-only wallboard command bar without workflow controls", () => {
    render(<SeniorBneWallboardPage />);

    expect(screen.getByText("Read-only TV mode")).toBeVisible();
    expect(screen.getByText("Senior Engineer / Wallboard")).toBeVisible();
    expect(screen.queryByText(/scenario/i)).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /manual refresh/i })).not.toBeInTheDocument();
    expect(screen.queryByRole("link", { name: /admin/i })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /change reason/i })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /mark apu off/i })).not.toBeInTheDocument();
    expect(screen.queryByText(/benchmark controls/i)).not.toBeInTheDocument();
  });

  it("amplifies scorecard labels and rotates the benchmark state every 5 seconds", () => {
    vi.useFakeTimers();

    render(<SeniorBneWallboardPage />);

    const scorecard = screen.getByRole("region", { name: "Wallboard scorecard" });
    expect(within(scorecard).getAllByTestId("wallboard-scorecard-label").map((label) => label.textContent)).toEqual([
      "APU on now",
      "Runtime today",
      "Fuel today",
      "Reason coverage",
    ]);

    const benchmark = screen.getByTestId("wallboard-benchmark-rotator");
    expect(benchmark).toHaveAttribute("data-rotation-interval-ms", "5000");
    expect(within(benchmark).getByText("Similar-temperature days")).toBeVisible();

    act(() => {
      vi.advanceTimersByTime(5000);
    });

    expect(within(benchmark).getByText("Weekly average")).toBeVisible();
  });

  it("renders passive aircraft cards with operational detail and no workflow actions", () => {
    render(<SeniorBneWallboardPage />);

    const stage = screen.getByRole("region", { name: "Wallboard carousel stage" });
    const card = within(stage).getByRole("article", {
      name: "VH-8IA wallboard aircraft card",
    });

    expect(within(card).getByText("VH-8IA")).toBeVisible();
    expect(within(card).getByText("B738")).toBeVisible();
    expect(within(card).getByText("Bay 20")).toBeVisible();
    expect(within(card).getByText("APU On")).toBeVisible();
    expect(within(card).getByText("00:46")).toBeVisible();
    expect(within(card).getByText("00:55")).toBeVisible();
    expect(within(card).getByText("85.9 kg")).toBeVisible();
    expect(within(card).getByText("Ground support")).toBeVisible();
    expect(within(card).getByText("Closest tail: VH-YFX")).toBeVisible();
    expect(within(card).getByText("Cleaning in progress")).toBeVisible();
    expect(within(card).getByText("Cleaner onboard")).toBeVisible();
    expect(within(card).getByText("Review due")).toBeVisible();
    expect(within(card).getByRole("group", { name: "Source charms for VH-8IA" })).toBeVisible();
    expect(within(card).getByText("ACMS")).toBeVisible();

    expect(within(card).queryByRole("button", { name: /select reason/i })).not.toBeInTheDocument();
    expect(within(card).queryByRole("button", { name: /change reason/i })).not.toBeInTheDocument();
    expect(within(card).queryByRole("button", { name: /manual off/i })).not.toBeInTheDocument();
    expect(within(card).queryByRole("button", { name: /data issue/i })).not.toBeInTheDocument();
    expect(within(card).queryByRole("button", { name: /reason drawer/i })).not.toBeInTheDocument();
    expect(within(card).queryByRole("button", { name: /qr/i })).not.toBeInTheDocument();
    expect(within(card).queryByRole("link")).not.toBeInTheDocument();
  });

  it("shows two aircraft per carousel page and a marker for multiple pages", () => {
    render(
      <WallboardAircraftCarousel
        aircraft={[
          aircraftCard("VH-AAA", 1),
          aircraftCard("VH-BBB", 2),
          aircraftCard("VH-CCC", 3),
        ]}
      />,
    );

    const stage = screen.getByRole("region", { name: "Wallboard carousel stage" });
    expect(within(stage).getAllByRole("article")).toHaveLength(2);
    expect(screen.getByText("[1 of 2]")).toBeVisible();
    expect(within(stage).getByText("VH-AAA")).toBeVisible();
    expect(within(stage).getByText("VH-BBB")).toBeVisible();
    expect(within(stage).queryByText("VH-CCC")).not.toBeInTheDocument();
  });

  it("hides the carousel marker when there is only one page", () => {
    render(
      <WallboardAircraftCarousel
        aircraft={[aircraftCard("VH-AAA", 1), aircraftCard("VH-BBB", 2)]}
      />,
    );

    expect(screen.queryByText(/\[\d+ of \d+\]/)).not.toBeInTheDocument();
  });

  it("keeps the current carousel page steady until the interval completes", () => {
    vi.useFakeTimers();
    const { rerender } = render(
      <WallboardAircraftCarousel
        aircraft={[
          aircraftCard("VH-AAA", 1),
          aircraftCard("VH-BBB", 2),
          aircraftCard("VH-CCC", 3),
        ]}
      />,
    );

    rerender(
      <WallboardAircraftCarousel
        aircraft={[
          aircraftCard("VH-CCC", 1),
          aircraftCard("VH-AAA", 2),
          aircraftCard("VH-BBB", 3),
        ]}
      />,
    );

    const stage = screen.getByRole("region", { name: "Wallboard carousel stage" });
    expect(within(stage).getByText("VH-AAA")).toBeVisible();
    expect(within(stage).getByText("VH-BBB")).toBeVisible();
    expect(within(stage).queryByText("VH-CCC")).not.toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(10000);
    });

    expect(screen.getByText("[2 of 2]")).toBeVisible();
  });

  it("renders an enlarged side index sorted by urgency with passive state cues", () => {
    render(<SeniorBneWallboardPage />);

    const sideIndex = screen.getByRole("region", { name: "Wallboard side index" });
    const rows = within(sideIndex).getAllByRole("listitem");

    expect(rows.map((row) => row.getAttribute("data-tail"))).toEqual(["VH-8IA", "VH-YFX"]);
    expect(rows[0]).toHaveAttribute("data-urgency-rank", "1");
    expect(rows[0]).toHaveAttribute("data-urgency-cue", "changed");
    expect(within(rows[0]).getByText("On")).toHaveClass("bg-virgin-red");
    expect(within(rows[1]).getByText("Off")).toHaveClass("bg-green-50");
    expect(within(rows[0]).getByText("Cleaning in progress")).toBeVisible();
    expect(within(rows[1]).getByText("APU off")).toBeVisible();
    expect(within(sideIndex).queryByRole("button")).not.toBeInTheDocument();
  });
});
