import { act, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import SeniorBneWallboardPage from "@/app/senior/bne/wallboard/page";
import type { AircraftCardReadModel } from "@/lib/read-models";
import { WallboardAircraftCard } from "./wallboard-aircraft-card";
import { WallboardAircraftCarousel } from "./wallboard-aircraft-carousel";
import { WallboardAircraftStage } from "./wallboard-aircraft-stage";
import { estimateWallboardOpsRailDensity, WallboardSideIndex } from "./wallboard-side-index";

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

const numberedAircraft = (count: number) =>
  Array.from({ length: count }, (_, index) =>
    aircraftCard(`VH-${String(index + 1).padStart(3, "0")}`, index + 1),
  );

const articleNames = (stage: HTMLElement) =>
  within(stage)
    .getAllByRole("article")
    .map((article) => article.getAttribute("aria-label"));

describe("SeniorBneWallboardPage", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("renders the read-only BNE wallboard shell", () => {
    render(<SeniorBneWallboardPage />);

    expect(screen.getByRole("heading", { name: "Daily APU Fuel Burn", level: 1 })).toBeVisible();
    expect(screen.queryByRole("heading", { name: "BNE Wallboard", level: 1 })).not.toBeInTheDocument();
    expect(screen.getByText("APU on now")).toBeVisible();
    expect(screen.getByRole("region", { name: "Wallboard side index" })).toBeVisible();
    expect(screen.getByRole("heading", { name: "Aircraft in focus" })).toBeVisible();
    expect(screen.getByText("Page 1 of 6")).toBeVisible();
    expect(screen.queryByText(/\[\d+ of \d+\]/)).not.toBeInTheDocument();
  });

  it("renders a quiet wallboard command bar without workflow controls or mode labels", () => {
    render(<SeniorBneWallboardPage />);

    const header = screen.getByRole("banner");

    expect(
      within(header).getByRole("heading", { name: "Daily APU Fuel Burn", level: 1 }),
    ).toBeVisible();
    expect(within(header).queryByText("BNE")).not.toBeInTheDocument();
    expect(within(header).queryByText("Senior Engineer / Wallboard")).not.toBeInTheDocument();
    expect(within(header).queryByText("Read-only TV mode")).not.toBeInTheDocument();
    expect(within(header).getByText("24°C")).toBeVisible();
    expect(within(header).getByText(/Feed fresh/i)).toBeVisible();
    expect(within(header).getByText("18:55 AEST")).toBeVisible();
    expect(within(header).queryByRole("group", { name: "Wallboard rotation timers" })).not.toBeInTheDocument();
    expect(within(header).queryByText("Rotation")).not.toBeInTheDocument();
    expect(within(header).queryByRole("timer")).not.toBeInTheDocument();
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
    expect(within(benchmark).getByRole("timer", { name: "Benchmark rotates in 5s" })).toHaveAttribute(
      "data-interval-ms",
      "5000",
    );
    expect(within(benchmark).getByText("Similar temp. days:")).toBeVisible();
    expect(within(benchmark).getByText("23-25°C")).toBeVisible();
    expect(within(benchmark).queryByText("Similar-temperature days")).not.toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(5000);
    });

    expect(within(benchmark).getByText("Weekly average")).toBeVisible();
    expect(within(benchmark).queryByText("23-25°C")).not.toBeInTheDocument();
  });

  it("keeps section timers synchronized with card, sidebar, and benchmark rotation", () => {
    vi.useFakeTimers();

    render(<SeniorBneWallboardPage />);

    const benchmark = screen.getByTestId("wallboard-benchmark-rotator");
    const stage = screen.getByRole("region", { name: "Wallboard carousel stage" });
    const sideIndex = screen.getByRole("region", { name: "Wallboard side index" });

    expect(within(stage).getByRole("timer", { name: "Aircraft cards rotate in 5s" })).toBeVisible();
    expect(within(sideIndex).getByRole("timer", { name: "Sidebar page rotates in 20s" })).toBeVisible();
    expect(within(benchmark).getByRole("timer", { name: "Benchmark rotates in 5s" })).toBeVisible();
    expect(within(stage).getByText("Page 1 of 6")).toBeVisible();
    expect(within(sideIndex).getByText("Page 1 of 2")).toBeVisible();
    expect(within(benchmark).getByText("Similar temp. days:")).toBeVisible();

    act(() => {
      vi.advanceTimersByTime(4000);
    });

    expect(within(stage).getByRole("timer", { name: "Aircraft cards rotate in 1s" })).toBeVisible();
    expect(within(sideIndex).getByRole("timer", { name: "Sidebar page rotates in 16s" })).toBeVisible();
    expect(within(benchmark).getByRole("timer", { name: "Benchmark rotates in 1s" })).toBeVisible();

    act(() => {
      vi.advanceTimersByTime(1000);
    });

    expect(within(stage).getByRole("timer", { name: "Aircraft cards rotate in 5s" })).toBeVisible();
    expect(within(sideIndex).getByRole("timer", { name: "Sidebar page rotates in 15s" })).toBeVisible();
    expect(within(benchmark).getByRole("timer", { name: "Benchmark rotates in 5s" })).toBeVisible();
    expect(within(stage).getByText("Page 2 of 6")).toBeVisible();
    expect(within(sideIndex).getByText("Page 1 of 2")).toBeVisible();
    expect(within(benchmark).getByText("Weekly average")).toBeVisible();

    act(() => {
      vi.advanceTimersByTime(15000);
    });

    expect(within(sideIndex).getByRole("timer", { name: "Sidebar page rotates in 20s" })).toBeVisible();
    expect(within(stage).getByText("Page 5 of 6")).toBeVisible();
    expect(within(sideIndex).getByText("Page 2 of 2")).toBeVisible();
    expect(within(benchmark).getByText("Similar temp. days:")).toBeVisible();
  });

  it("renders passive aircraft cards with compact reason context and no workflow actions", () => {
    render(<SeniorBneWallboardPage />);

    const stage = screen.getByRole("region", { name: "Wallboard carousel stage" });
    const card = within(stage).getByRole("article", {
      name: "VH-VUK wallboard aircraft card",
    });

    const identity = within(card).getByRole("group", { name: "VH-VUK identity" });
    expect(within(identity).getByText("VH-VUK")).toBeVisible();
    expect(within(identity).getByText("B738")).toBeVisible();
    expect(within(identity).getByText("Bay 22")).toBeVisible();
    expect(within(card).getByRole("status", { name: "APU On" })).toBeVisible();
    expect(within(card).getByText("APU Runtime")).toBeVisible();
    expect(within(card).getByText("Ground Time")).toBeVisible();
    expect(within(card).getByText("Est. Fuel Burn")).toBeVisible();
    expect(within(card).getByText("00:57")).toBeVisible();
    expect(within(card).getByText("01:20")).toBeVisible();
    expect(within(card).getByText("106.4 kg")).toBeVisible();
    expect(within(card).getByText("Reason")).toBeVisible();
    expect(within(card).getByText("Reason pending")).toBeVisible();
    expect(within(card).queryByText("Nearby Tail")).not.toBeInTheDocument();
    expect(within(card).queryByText("Review Status")).not.toBeInTheDocument();
    expect(within(card).queryByText("No review due")).not.toBeInTheDocument();
    expect(within(card).queryByRole("group", { name: "Source charms for VH-VUK" })).not.toBeInTheDocument();
    expect(within(card).queryByText("ACMS")).not.toBeInTheDocument();

    expect(within(card).queryByRole("button", { name: /select reason/i })).not.toBeInTheDocument();
    expect(within(card).queryByRole("button", { name: /change reason/i })).not.toBeInTheDocument();
    expect(within(card).queryByRole("button", { name: /manual off/i })).not.toBeInTheDocument();
    expect(within(card).queryByRole("button", { name: /data issue/i })).not.toBeInTheDocument();
    expect(within(card).queryByRole("button", { name: /reason drawer/i })).not.toBeInTheDocument();
    expect(within(card).queryByRole("button", { name: /qr/i })).not.toBeInTheDocument();
    expect(within(card).queryByRole("link")).not.toBeInTheDocument();
  });

  it("shows APU off instead of a pending reason on off-state wallboard cards", () => {
    render(
      <WallboardAircraftCard
        aircraft={{
          ...aircraftCard("VH-OFF", 1),
          apuState: "off",
          currentReason: undefined,
          reviewState: { isReviewDue: false },
          statusLabel: "APU off",
          urgencyBucket: "apu_off",
        }}
      />,
    );

    const card = screen.getByRole("article", { name: "VH-OFF wallboard aircraft card" });

    expect(within(card).getByRole("status", { name: "APU Off" })).toBeVisible();
    expect(within(card).getByText("APU off")).toBeVisible();
    expect(within(card).queryByText("Reason pending")).not.toBeInTheDocument();
  });

  it("shows four aircraft per carousel screen with a focus strip and timer wheel", () => {
    render(
      <WallboardAircraftCarousel
        aircraft={[
          aircraftCard("VH-AAA", 1),
          aircraftCard("VH-BBB", 2),
          aircraftCard("VH-CCC", 3),
          aircraftCard("VH-DDD", 4),
        ]}
        intervalMs={5000}
        pageCount={2}
        pageIndex={0}
        remainingMs={5000}
      />,
    );

    const stage = screen.getByRole("region", { name: "Wallboard carousel stage" });
    expect(within(stage).getAllByRole("article")).toHaveLength(4);
    expect(within(stage).getByRole("heading", { name: "Aircraft in focus" })).toBeVisible();
    expect(within(stage).getByText("Page 1 of 2")).toBeVisible();
    expect(within(stage).getByRole("timer", { name: "Aircraft cards rotate in 5s" })).toBeVisible();
    expect(within(stage).queryByText(/\[\d+ of \d+\]/)).not.toBeInTheDocument();
  });

  it("selects card pages from the shared elapsed wallboard time", () => {
    const { rerender } = render(<WallboardAircraftStage aircraft={numberedAircraft(21)} elapsedMs={0} />);

    const stage = screen.getByRole("region", { name: "Wallboard carousel stage" });
    const sideIndex = screen.getByRole("region", { name: "Wallboard side index" });

    expect(articleNames(stage)).toEqual([
      "VH-001 wallboard aircraft card",
      "VH-002 wallboard aircraft card",
      "VH-003 wallboard aircraft card",
      "VH-004 wallboard aircraft card",
    ]);
    expect(within(stage).getByText("Page 1 of 6")).toBeVisible();
    expect(within(sideIndex).getByText("Page 1 of 2")).toBeVisible();
    expect(screen.getByRole("row", { name: /VH-001/ })).toHaveAttribute("data-highlighted", "true");

    rerender(<WallboardAircraftStage aircraft={numberedAircraft(21)} elapsedMs={5000} />);

    expect(articleNames(stage)).toEqual([
      "VH-005 wallboard aircraft card",
      "VH-006 wallboard aircraft card",
      "VH-007 wallboard aircraft card",
      "VH-008 wallboard aircraft card",
    ]);
    expect(within(stage).getByText("Page 2 of 6")).toBeVisible();
    expect(within(sideIndex).getByText("Page 1 of 2")).toBeVisible();
    expect(screen.getByRole("row", { name: /VH-005/ })).toHaveAttribute("data-highlighted", "true");
    expect(screen.getByRole("row", { name: /VH-001/ })).toHaveAttribute("data-highlighted", "false");

    rerender(<WallboardAircraftStage aircraft={numberedAircraft(21)} elapsedMs={15000} />);

    expect(articleNames(stage)).toEqual([
      "VH-013 wallboard aircraft card",
      "VH-014 wallboard aircraft card",
      "VH-015 wallboard aircraft card",
      "VH-016 wallboard aircraft card",
    ]);
    expect(within(stage).getByText("Page 4 of 6")).toBeVisible();
    expect(within(sideIndex).getByText("Page 1 of 2")).toBeVisible();

    rerender(<WallboardAircraftStage aircraft={numberedAircraft(21)} elapsedMs={20000} />);

    expect(articleNames(stage)).toEqual([
      "VH-017 wallboard aircraft card",
      "VH-018 wallboard aircraft card",
      "VH-019 wallboard aircraft card",
      "VH-020 wallboard aircraft card",
    ]);
    expect(within(stage).getByText("Page 5 of 6")).toBeVisible();
    expect(within(sideIndex).getByText("Page 2 of 2")).toBeVisible();
    expect(screen.getByRole("row", { name: /VH-017/ })).toHaveAttribute("data-highlighted", "true");
  });

  it("renders a final incomplete card group without blank placeholders", () => {
    const { rerender } = render(<WallboardAircraftStage aircraft={numberedAircraft(5)} elapsedMs={0} />);

    const stage = screen.getByRole("region", { name: "Wallboard carousel stage" });
    expect(within(stage).getAllByRole("article")).toHaveLength(4);

    rerender(<WallboardAircraftStage aircraft={numberedAircraft(5)} elapsedMs={5000} />);

    expect(within(stage).getAllByRole("article")).toHaveLength(1);
    expect(within(stage).getByRole("article", { name: "VH-005 wallboard aircraft card" })).toBeVisible();
    expect(within(stage).queryByLabelText(/placeholder/i)).not.toBeInTheDocument();
  });

  it("estimates wallboard ops table density from the rail height", () => {
    expect(estimateWallboardOpsRailDensity(363)).toEqual({
      rowHeightPx: 25,
      rowsPerPage: 12,
    });
    expect(estimateWallboardOpsRailDensity(570)).toEqual({
      rowHeightPx: 32,
      rowsPerPage: 16,
    });
  });

  it("renders a controlled wallboard ops table with 16 rows, timer wheel, and highlighted card rows", () => {
    const aircraft = numberedAircraft(21);
    aircraft[0] = { ...aircraft[0], bay: undefined, stand: undefined };

    render(
      <WallboardSideIndex
        aircraft={aircraft.slice(0, 16)}
        highlightedTailIds={["VH-001", "VH-004"]}
        intervalMs={20000}
        pageCount={2}
        pageIndex={0}
        remainingMs={20000}
      />,
    );

    const sideIndex = screen.getByRole("region", { name: "Wallboard side index" });
    const table = within(sideIndex).getByRole("table", { name: "Wallboard ground aircraft ops table" });
    const rows = within(table).getAllByRole("row");
    const bodyRows = rows.slice(1);

    expect(sideIndex).toHaveAttribute("data-rotation-interval-ms", "20000");
    expect(sideIndex).toHaveAttribute("data-rows-per-page", "16");
    expect(within(sideIndex).getByRole("heading", { name: "Aircraft on-ground" })).toBeVisible();
    expect(within(sideIndex).getByText("Page 1 of 2")).toBeVisible();
    expect(within(sideIndex).getByRole("timer", { name: "Sidebar page rotates in 20s" })).toBeVisible();
    expect(within(sideIndex).queryByText("[1 of 2]")).not.toBeInTheDocument();
    expect(bodyRows).toHaveLength(16);
    expect(bodyRows.map((row) => Number(row.getAttribute("data-urgency-rank")))).toEqual(
      Array.from({ length: 16 }, (_, index) => index + 1),
    );
    expect(bodyRows[0]).toHaveAttribute("data-highlighted", "true");
    expect(bodyRows[0]).toHaveClass("bg-neutral-100");
    expect(bodyRows[3]).toHaveAttribute("data-highlighted", "true");
    expect(bodyRows[4]).toHaveAttribute("data-highlighted", "false");
    expect(within(rows[0]).getByText("Burn Elpsd / Grnd")).toBeVisible();
    expect(within(rows[0]).queryByText("Elapsed / Ground")).not.toBeInTheDocument();
    expect(within(bodyRows[0]).getByLabelText("Unassigned bay")).toHaveTextContent("U/A");
    expect(within(bodyRows[1]).getByLabelText("Bay 22")).toHaveTextContent("22");
    expect(within(bodyRows[0]).getByText("46m / 55m")).toBeVisible();
    expect(
      within(bodyRows[0]).getByRole("img", { name: "Reason: Cleaning in progress" }),
    ).toHaveClass("text-virgin-purple");
  });

  it("renders the wallboard ops table sorted by urgency with passive LED state", () => {
    render(<SeniorBneWallboardPage />);

    const sideIndex = screen.getByRole("region", { name: "Wallboard side index" });
    const table = within(sideIndex).getByRole("table", { name: "Wallboard ground aircraft ops table" });
    const rows = within(table).getAllByRole("row");
    const bodyRows = rows.slice(1);
    const apuOffRow = bodyRows.find((row) => row.getAttribute("data-tail") === "VH-YFX");

    expect(bodyRows).toHaveLength(16);
    expect(bodyRows.map((row) => Number(row.getAttribute("data-urgency-rank")))).toEqual(
      Array.from({ length: 16 }, (_, index) => index + 1),
    );
    expect(bodyRows[0]).toHaveAttribute("data-urgency-rank", "1");
    expect(bodyRows[0]).toHaveAttribute("data-highlighted", "true");
    expect(bodyRows[3]).toHaveAttribute("data-highlighted", "true");
    expect(bodyRows[4]).toHaveAttribute("data-highlighted", "false");
    expect(within(bodyRows[0]).getByRole("img", { name: "APU on" })).toHaveClass(
      "bg-virgin-red",
    );
    expect(within(bodyRows[0]).queryByText("On")).not.toBeInTheDocument();
    if (apuOffRow) {
      expect(within(apuOffRow).getByRole("img", { name: "APU off" })).toHaveClass("bg-green-600");
      expect(within(apuOffRow).getByRole("img", { name: "Reason: APU off" })).toHaveAttribute(
        "title",
        "APU off",
      );
    }
    expect(
      within(bodyRows[0]).getByRole("img", {
        name: /Reason: (Reason missing|Review due|Cleaning in progress)/,
      }),
    ).toBeVisible();
    expect(within(sideIndex).queryByRole("button")).not.toBeInTheDocument();
  });
});
