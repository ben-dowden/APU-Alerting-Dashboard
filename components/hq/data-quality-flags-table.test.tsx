import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { bneScenarios } from "@/lib/fixtures/scenarios";

import { DataQualityFlagsTable } from "./data-quality-flags-table";

const events = bneScenarios.flatMap((scenario) => scenario.events);

describe("DataQualityFlagsTable", () => {
  it("filters flags by port, source, issue type, status, and recency", () => {
    render(<DataQualityFlagsTable events={events} />);

    expect(screen.getByLabelText("Port")).toBeVisible();
    expect(screen.getByLabelText("Source")).toBeVisible();
    expect(screen.getByLabelText("Issue type")).toBeVisible();
    expect(screen.getByLabelText("Status")).toBeVisible();
    expect(screen.getByLabelText("Recency")).toBeVisible();

    const table = screen.getByRole("table", { name: "Data quality flags" });
    expect(within(table).getByText("VH-8NB")).toBeVisible();
    expect(within(table).getByText("Equipment mismatch")).toBeVisible();

    fireEvent.change(screen.getByLabelText("Issue type"), {
      target: { value: "missing_reference_data" },
    });

    expect(within(table).getByText("VH-ZHA")).toBeVisible();
    expect(within(table).queryByText("VH-8NB")).not.toBeInTheDocument();

    fireEvent.change(screen.getByLabelText("Source"), { target: { value: "APU_APP" } });
    fireEvent.change(screen.getByLabelText("Status"), { target: { value: "open" } });
    fireEvent.change(screen.getByLabelText("Recency"), { target: { value: "all" } });

    expect(within(table).getByText("VH-ZHA")).toBeVisible();
  });

  it("opens a detail panel with tail, bay, source metadata, note, and related event ids", () => {
    render(<DataQualityFlagsTable events={events} />);

    fireEvent.click(screen.getByRole("button", { name: "View dq:VH-8NB:equipment-mismatch" }));

    const detailPanel = screen.getByRole("region", { name: "Data quality flag detail" });
    expect(within(detailPanel).getByText("VH-8NB")).toBeVisible();
    expect(within(detailPanel).getByText("Bay not captured")).toBeVisible();
    expect(within(detailPanel).getByText("APU_APP")).toBeVisible();
    expect(within(detailPanel).getByText("APP-DQ-VH8NB-1204")).toBeVisible();
    expect(within(detailPanel).getByText("No user note captured")).toBeVisible();
    expect(within(detailPanel).getByText("AIMS-VH8NB-1200-MISMATCH")).toBeVisible();
  });
});
