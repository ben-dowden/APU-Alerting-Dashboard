import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { within } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { clearWorkflowEvents, readWorkflowEvents } from "@/lib/prototype/workflow-event-store";
import { BneCommandBoard } from "./bne-command-board";

describe("BneCommandBoard", () => {
  beforeEach(() => {
    clearWorkflowEvents();
    localStorage.clear();
    Object.defineProperty(window.HTMLElement.prototype, "scrollIntoView", {
      configurable: true,
      value: vi.fn(),
    });
  });

  it("renders the production command bar with an area menu", () => {
    render(<BneCommandBoard />);

    const header = screen.getByRole("banner");

    expect(
      within(header).getByRole("heading", {
        name: "Daily APU Fuel Burn - Command",
        level: 1,
      }),
    ).toBeVisible();
    expect(within(header).queryByText("BNE")).not.toBeInTheDocument();
    expect(within(header).queryByText("Senior Engineer")).not.toBeInTheDocument();
    expect(within(header).getByText("24°C")).toBeVisible();
    expect(within(header).queryByText(/METAR/i)).not.toBeInTheDocument();
    expect(within(header).getByText(/Feed fresh/i)).toBeVisible();
    expect(within(header).getByText("18:55 AEST")).toBeVisible();
    expect(within(header).queryByRole("link", { name: "Wallboard" })).not.toBeInTheDocument();
    expect(within(header).queryByRole("link", { name: /HQ/i })).not.toBeInTheDocument();
    expect(within(header).queryByRole("link", { name: /Admin/i })).not.toBeInTheDocument();

    const areaMenuButton = within(header).getByRole("button", { name: "Open area menu" });
    expect(areaMenuButton).toHaveAttribute("aria-expanded", "false");

    fireEvent.click(areaMenuButton);

    expect(areaMenuButton).toHaveAttribute("aria-expanded", "true");
    const areaMenu = within(header).getByRole("navigation", { name: "Area menu" });
    expect(within(areaMenu).getByRole("link", { name: "Wallboard" })).toHaveAttribute(
      "href",
      "/senior/bne/wallboard",
    );
    expect(within(areaMenu).getByRole("link", { name: "HQ Monitoring" })).toHaveAttribute(
      "href",
      "/hq",
    );
    expect(within(areaMenu).getByRole("link", { name: "HQ Reports" })).toHaveAttribute(
      "href",
      "/hq/reports",
    );
    expect(within(areaMenu).getByRole("link", { name: "Data Quality" })).toHaveAttribute(
      "href",
      "/hq/data-quality",
    );
    expect(within(areaMenu).getByRole("link", { name: "Admin Workbench" })).toHaveAttribute(
      "href",
      "/admin",
    );
    expect(within(areaMenu).getByRole("link", { name: "Reason Settings" })).toHaveAttribute(
      "href",
      "/admin/reasons",
    );
    expect(within(areaMenu).getByRole("link", { name: "Fuel Settings" })).toHaveAttribute(
      "href",
      "/admin/fuel",
    );
    expect(within(areaMenu).getByRole("link", { name: "Urgency Ranking" })).toHaveAttribute(
      "href",
      "/admin/urgency",
    );
    expect(within(areaMenu).getByRole("link", { name: "Reference Data" })).toHaveAttribute(
      "href",
      "/admin/reference-data",
    );
  });

  it("renders the command metric bar with APU intensity benchmark context", () => {
    render(<BneCommandBoard />);

    const scorecard = screen.getByRole("region", { name: "APU command metrics" });

    expect(within(scorecard).getAllByTestId("scorecard-label").map((label) => label.textContent)).toEqual([
      "Active now",
      "Long runners",
      "Explanation gap",
      "APU intensity",
    ]);
    expect(within(scorecard).getByText("16 / 21")).toBeVisible();
    expect(within(scorecard).getByText("7 aircraft")).toBeVisible();
    expect(within(scorecard).getByText("351 min")).toBeVisible();
    expect(within(scorecard).getByText("58%")).toBeVisible();
    expect(within(scorecard).getByText("vs similar temp +12 pts")).toBeVisible();
    expect(screen.queryByRole("region", { name: "Benchmark comparison" })).not.toBeInTheDocument();
    expect(screen.queryByText("Similar-temperature days")).not.toBeInTheDocument();
    expect(screen.queryByText(/\$/)).not.toBeInTheDocument();
    expect(screen.queryByText(/AUD/i)).not.toBeInTheDocument();
  });

  it("renders workflow-ready aircraft cards from the read model", () => {
    render(<BneCommandBoard />);

    const board = screen.getByRole("region", { name: "Aircraft work queue" });
    expect(board).toHaveClass("xl:grid-cols-3");
    expect(board).not.toHaveClass("xl:grid-cols-2");
    expect(within(board).getAllByRole("article")).toHaveLength(21);
    const card = within(board).getByRole("article", { name: "VH-8IA aircraft card" });

    expect(within(card).getByText("VH-8IA")).toBeVisible();
    expect(within(card).getByText("B738")).toBeVisible();
    expect(within(card).getByText("Bay 20")).toBeVisible();
    expect(within(card).getByRole("status", { name: "APU On" })).toBeVisible();
    expect(within(card).getByText("00:46")).toBeVisible();
    expect(within(card).getByText("00:55")).toBeVisible();
    expect(within(card).getByText("Est. Fuel Burn")).toBeVisible();
    expect(within(card).getByText("85.9 kg")).toBeVisible();
    expect(within(card).getByText("Cleaning in progress")).toBeVisible();
    expect(within(card).getByText("Cleaner onboard")).toBeVisible();
    expect(within(card).queryByText("Review due")).not.toBeInTheDocument();
    expect(within(card).getByText("Nearby Tail")).toBeVisible();
    expect(
      within(card).getByRole("button", { name: "Nearby aircraft for VH-8IA" }),
    ).not.toHaveTextContent(/Closest tail:/);
    expect(within(card).getByRole("button", { name: "Nearby aircraft for VH-8IA" })).toBeVisible();

    const actionRail = within(card).getByRole("group", { name: "VH-8IA actions" });
    const reasonActions = within(actionRail).getByRole("group", {
      name: "Reason actions for VH-8IA",
    });
    const utilityActions = within(actionRail).getByRole("group", {
      name: "Utility actions for VH-8IA",
    });
    expect(within(reasonActions).getByRole("button", { name: "Change reason" })).toBeVisible();
    expect(
      within(reasonActions).getByRole("button", { name: "Keep current reason for VH-8IA" }),
    ).toHaveAttribute("title", "Keep current reason");
    expect(
      within(utilityActions).getByRole("button", { name: "Open reason drawer for VH-8IA" }),
    ).toHaveClass("text-neutral-800");
  });

  it("renders the dense ground aircraft ops table with LED APU state", () => {
    render(<BneCommandBoard />);

    const table = screen.getByRole("table", { name: "Ground aircraft ops table" });
    const rows = within(table).getAllByRole("row");
    expect(rows).toHaveLength(22);
    expect(within(rows[0]).queryByText("Focus")).not.toBeInTheDocument();
    expect(within(rows[0]).getByText("Burn Elsp")).toBeVisible();
    expect(within(rows[0]).getByText("Ground Time")).toBeVisible();
    expect(within(rows[0]).queryByText("Elapsed")).not.toBeInTheDocument();

    const activeReasonRow = within(table).getByRole("row", {
      name: /Show VH-8IA aircraft card/,
    });
    expect(activeReasonRow).toHaveAttribute("data-focus-tail", "VH-8IA");
    expect(within(activeReasonRow).getByLabelText("Bay 20")).toHaveTextContent("20");
    expect(within(activeReasonRow).queryByText("Bay 20")).not.toBeInTheDocument();
    expect(within(activeReasonRow).getByRole("img", { name: "APU on" })).toHaveClass(
      "bg-virgin-red",
    );
    expect(within(activeReasonRow).queryByText("On")).not.toBeInTheDocument();
    expect(within(activeReasonRow).getByText("46 min")).toBeVisible();
    expect(within(activeReasonRow).getByText("55 min")).toBeVisible();
    expect(
      within(activeReasonRow).getByRole("img", { name: "Reason: Cleaning in progress" }),
    ).toHaveAttribute("title", "Cleaning in progress");
    expect(within(activeReasonRow).queryByText("Cleaning in progress")).not.toBeInTheDocument();
    expect(
      within(activeReasonRow).queryByRole("button", { name: "Focus VH-8IA" }),
    ).not.toBeInTheDocument();

    const unassignedBay = within(table).getByLabelText("Unassigned bay");
    expect(unassignedBay).toHaveTextContent("U/A");
    expect(unassignedBay).toHaveClass("text-virgin-red");

    const missingReasonRow = within(table).getByRole("row", {
      name: /Show VH-VUK aircraft card/,
    });
    expect(
      within(missingReasonRow).getByRole("img", { name: "Reason: Reason pending" }),
    ).toHaveAttribute("title", "Reason pending");

    const apuOffRow = within(table).getByRole("row", {
      name: /Show VH-YFX aircraft card/,
    });
    expect(within(apuOffRow).getByRole("img", { name: "APU off" })).toHaveClass("bg-green-600");
    expect(within(apuOffRow).getByRole("img", { name: "Reason: APU off" })).toHaveAttribute(
      "title",
      "APU off",
    );
  });

  it("snaps to the matching aircraft card when an ops table row is activated", async () => {
    render(<BneCommandBoard />);

    const table = screen.getByRole("table", { name: "Ground aircraft ops table" });
    const row = within(table).getByRole("row", { name: /Show VH-8IA aircraft card/ });
    const card = screen.getByRole("article", { name: "VH-8IA aircraft card" });

    fireEvent.click(row);

    await waitFor(() => expect(card).toHaveFocus());
    expect(card).toHaveAttribute("data-focus-highlight", "true");
    expect(window.HTMLElement.prototype.scrollIntoView).toHaveBeenCalled();
  });

  it("keeps the current reason through the local workflow event stream", async () => {
    render(<BneCommandBoard />);

    const card = screen.getByRole("article", { name: "VH-8IA aircraft card" });
    const keepCurrentReason = within(card).getByRole("button", {
      name: "Keep current reason for VH-8IA",
    });

    fireEvent.click(keepCurrentReason);

    expect(readWorkflowEvents()).toHaveLength(1);
    await waitFor(() =>
      expect(
        within(card).queryByRole("button", { name: "Keep current reason for VH-8IA" }),
      ).not.toBeInTheDocument(),
    );
  });
});
