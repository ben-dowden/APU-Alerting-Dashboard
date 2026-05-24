import { fireEvent, render, screen } from "@testing-library/react";
import { within } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";

import { clearWorkflowEvents, readWorkflowEvents } from "@/lib/prototype/workflow-event-store";
import { BneCommandBoard } from "./bne-command-board";

describe("BneCommandBoard", () => {
  beforeEach(() => {
    clearWorkflowEvents();
    localStorage.clear();
  });

  it("renders the compact command bar", () => {
    render(<BneCommandBoard />);

    expect(screen.getByRole("heading", { name: "BNE APU Command Board", level: 1 })).toBeVisible();
    expect(screen.getAllByText("BNE")[0]).toBeVisible();
    expect(screen.getByText("Senior Engineer")).toBeVisible();
    expect(screen.getByText("24°C")).toBeVisible();
    expect(screen.queryByText(/METAR/i)).not.toBeInTheDocument();
    expect(screen.getByText(/Feed fresh/i)).toBeVisible();
    expect(screen.getByText("18:55 AEST")).toBeVisible();
    expect(screen.getByRole("link", { name: /Wallboard/i })).toHaveAttribute(
      "href",
      "/senior/bne/wallboard",
    );
  });

  it("renders the scorecard and default similar-temperature benchmark without dollars", () => {
    render(<BneCommandBoard />);

    const scorecard = screen.getByRole("region", { name: "Daily scorecard" });
    expect(within(scorecard).getAllByTestId("scorecard-label").map((label) => label.textContent)).toEqual([
      "APU on now",
      "Runtime today",
      "Fuel burned today",
      "Attributed runtime",
    ]);

    const benchmark = screen.getByRole("region", { name: "Benchmark comparison" });
    expect(within(benchmark).getByText("Similar-temperature days")).toBeVisible();
    expect(within(benchmark).getByText("23-25°C")).toBeVisible();
    expect(within(benchmark).queryByText("Weekly average")).not.toBeInTheDocument();
    expect(within(benchmark).queryByText("Monthly average")).not.toBeInTheDocument();
    expect(within(benchmark).queryByText("Annual average")).not.toBeInTheDocument();

    const benchmarkText = benchmark.textContent ?? "";
    const fuelDeltaIndex = benchmarkText.search(/[+-]\d+(\.\d)? kg/);
    const runtimeDeltaIndex = benchmarkText.search(/[+-]\d+ min/);
    expect(fuelDeltaIndex).toBeGreaterThanOrEqual(0);
    expect(runtimeDeltaIndex).toBeGreaterThanOrEqual(0);
    expect(fuelDeltaIndex).toBeLessThan(runtimeDeltaIndex);
    expect(screen.queryByText(/\$/)).not.toBeInTheDocument();
    expect(screen.queryByText(/AUD/i)).not.toBeInTheDocument();
  });

  it("renders workflow-ready aircraft cards from the read model", () => {
    render(<BneCommandBoard />);

    const board = screen.getByRole("region", { name: "Aircraft work queue" });
    expect(within(board).getAllByRole("article")).toHaveLength(21);
    const card = within(board).getByRole("article", { name: "VH-8IA aircraft card" });

    expect(within(card).getByText("VH-8IA")).toBeVisible();
    expect(within(card).getByText("B738")).toBeVisible();
    expect(within(card).getByText("Bay 20")).toBeVisible();
    expect(within(card).getByText("APU On")).toBeVisible();
    expect(within(card).getByText("00:46")).toBeVisible();
    expect(within(card).getByText("00:55")).toBeVisible();
    expect(within(card).getByText("85.9 kg")).toBeVisible();
    expect(within(card).getByText("Cleaning in progress")).toBeVisible();
    expect(within(card).getByText("Cleaner onboard")).toBeVisible();
    expect(within(card).getByText("Review due")).toBeVisible();
    expect(within(card).getByText(/Closest tail:/)).toBeVisible();
    expect(within(card).getByRole("button", { name: "Nearby aircraft for VH-8IA" })).toBeVisible();

    const currentReasonBlock = within(card).getByRole("group", { name: "Current reason for VH-8IA" });
    expect(within(currentReasonBlock).getByRole("button", { name: "Change reason" })).toBeVisible();
    expect(
      within(currentReasonBlock).getByRole("button", { name: "Keep current reason for VH-8IA" }),
    ).toHaveAttribute("title", "Keep current reason");
    expect(
      within(currentReasonBlock).getByRole("button", { name: "Open reason drawer for VH-8IA" }),
    ).toHaveClass("text-neutral-800");
  });

  it("renders the ground aircraft side table", () => {
    render(<BneCommandBoard />);

    const table = screen.getByRole("table", { name: "Ground aircraft side table" });
    const rows = within(table).getAllByRole("row");
    expect(rows).toHaveLength(22);

    const activeReasonRow = within(table).getByRole("row", { name: /VH-8IA/ });
    expect(within(activeReasonRow).getByText("Bay 20")).toBeVisible();
    expect(within(activeReasonRow).getByText("On")).toBeVisible();
    expect(within(activeReasonRow).getByText("46 min")).toBeVisible();
    expect(within(activeReasonRow).getByText("55 min")).toBeVisible();
    expect(within(activeReasonRow).getByText("Cleaning in progress")).toBeVisible();
    expect(within(activeReasonRow).getByRole("button", { name: "Focus VH-8IA" })).toHaveAttribute(
      "data-focus-tail",
      "VH-8IA",
    );

    const missingReasonRow = within(table).getByRole("row", { name: /VH-VUK/ });
    expect(within(missingReasonRow).getByText("Reason pending")).toBeVisible();

    const apuOffRow = within(table).getByRole("row", { name: /VH-YFX/ });
    expect(within(apuOffRow).getByText("Off")).toBeVisible();
    expect(within(apuOffRow).getByText("APU off")).toBeVisible();
  });

  it("keeps the current reason through the local workflow event stream", async () => {
    render(<BneCommandBoard />);

    const card = screen.getByRole("article", { name: "VH-8IA aircraft card" });
    expect(within(card).getByText("Review due")).toBeVisible();

    fireEvent.click(
      within(card).getByRole("button", { name: "Keep current reason for VH-8IA" }),
    );

    expect(readWorkflowEvents()).toHaveLength(1);
    expect(await within(card).findByText("Review set")).toBeVisible();
  });
});
