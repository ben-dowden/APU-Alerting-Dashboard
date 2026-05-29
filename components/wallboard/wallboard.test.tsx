import { act, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import SeniorBneWallboardPage from "@/app/senior/bne/wallboard/page";
import type { AircraftCardReadModel } from "@/lib/read-models";
import { WallboardAircraftCarousel } from "./wallboard-aircraft-carousel";
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
    expect(screen.getByText("[1 of 11]")).toBeVisible();
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
      name: "VH-VUK wallboard aircraft card",
    });

    expect(within(card).getByText("VH-VUK")).toBeVisible();
    expect(within(card).getByText("B738")).toBeVisible();
    expect(within(card).getByText("Bay 22")).toBeVisible();
    expect(within(card).getByText("APU On")).toBeVisible();
    expect(within(card).getByText("00:57")).toBeVisible();
    expect(within(card).getByText("01:20")).toBeVisible();
    expect(within(card).getByText("106.4 kg")).toBeVisible();
    expect(within(card).getByText("Ground support")).toBeVisible();
    expect(within(card).getByText(/Closest tail:/)).toBeVisible();
    expect(within(card).getByText("Reason pending")).toBeVisible();
    expect(within(card).getByText("No review due")).toBeVisible();
    expect(within(card).getByRole("group", { name: "Source charms for VH-VUK" })).toBeVisible();
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

  it("estimates wallboard ops table density from the rail height", () => {
    expect(estimateWallboardOpsRailDensity(363)).toEqual({
      rowHeightPx: 25,
      rowsPerPage: 12,
    });
    expect(estimateWallboardOpsRailDensity(570)).toEqual({
      rowHeightPx: 34,
      rowsPerPage: 15,
    });
  });

  it("renders a paged wallboard ops table with compact bay, elapsed, ground, and reason cues", () => {
    vi.useFakeTimers();
    const aircraft = Array.from({ length: 21 }, (_, index) =>
      aircraftCard(`VH-${String(index + 1).padStart(3, "0")}`, index + 1),
    );
    aircraft[0] = { ...aircraft[0], bay: undefined, stand: undefined };

    render(<WallboardSideIndex aircraft={aircraft} />);

    const sideIndex = screen.getByRole("region", { name: "Wallboard side index" });
    const table = within(sideIndex).getByRole("table", { name: "Wallboard ground aircraft ops table" });
    const rows = within(table).getAllByRole("row");
    const bodyRows = rows.slice(1);

    expect(sideIndex).toHaveAttribute("data-rotation-interval-ms", "5000");
    expect(sideIndex).toHaveAttribute("data-rows-per-page", "12");
    expect(within(sideIndex).getByRole("heading", { name: "Aircraft on-ground" })).toBeVisible();
    expect(within(sideIndex).getByText("Page 1 of 2")).toBeVisible();
    expect(within(sideIndex).queryByText("[1 of 2]")).not.toBeInTheDocument();
    expect(bodyRows).toHaveLength(12);
    expect(bodyRows.map((row) => Number(row.getAttribute("data-urgency-rank")))).toEqual(
      Array.from({ length: 12 }, (_, index) => index + 1),
    );
    expect(within(rows[0]).getByText("Burn Elpsd / Grnd")).toBeVisible();
    expect(within(rows[0]).queryByText("Elapsed / Ground")).not.toBeInTheDocument();
    expect(within(rows[0]).queryByText("Elapsed")).not.toBeInTheDocument();
    expect(within(rows[0]).queryByText("Ground")).not.toBeInTheDocument();
    expect(within(bodyRows[0]).getByLabelText("Unassigned bay")).toHaveTextContent("U/A");
    expect(within(bodyRows[0]).queryByText("Unassigned")).not.toBeInTheDocument();
    expect(within(bodyRows[1]).getByLabelText("Bay 22")).toHaveTextContent("22");
    expect(within(bodyRows[1]).queryByText("Bay 22")).not.toBeInTheDocument();
    expect(within(bodyRows[0]).getByText("46m / 55m")).toBeVisible();
    expect(within(bodyRows[0]).queryByText("46 min")).not.toBeInTheDocument();
    expect(
      within(bodyRows[0]).getByRole("img", { name: "Reason: Cleaning in progress" }),
    ).toHaveClass("text-virgin-purple");
    expect(within(sideIndex).getByText("Page 1 of 2")).toBeVisible();

    act(() => {
      vi.advanceTimersByTime(5000);
    });

    expect(within(sideIndex).getByText("Page 2 of 2")).toBeVisible();
    expect(within(sideIndex).queryByText("[2 of 2]")).not.toBeInTheDocument();
    expect(within(table).queryByText("VH-001")).not.toBeInTheDocument();
    expect(within(table).getByText("VH-013")).toBeVisible();
  });

  it("renders the wallboard ops table sorted by urgency with passive LED state", () => {
    render(<SeniorBneWallboardPage />);

    const sideIndex = screen.getByRole("region", { name: "Wallboard side index" });
    const table = within(sideIndex).getByRole("table", { name: "Wallboard ground aircraft ops table" });
    const rows = within(table).getAllByRole("row");
    const bodyRows = rows.slice(1);
    const apuOffRow = bodyRows.find((row) => row.getAttribute("data-tail") === "VH-YFX");

    expect(bodyRows).toHaveLength(12);
    expect(bodyRows.map((row) => Number(row.getAttribute("data-urgency-rank")))).toEqual(
      Array.from({ length: 12 }, (_, index) => index + 1),
    );
    expect(bodyRows[0]).toHaveAttribute("data-urgency-rank", "1");
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
