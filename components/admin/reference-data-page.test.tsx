import { fireEvent, render, screen, within } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";

import { clearSettingsEvents, readSettingsEvents } from "@/lib/prototype/settings-event-store";

import { ReferenceDataPage } from "./reference-data-page";

describe("ReferenceDataPage", () => {
  beforeEach(() => {
    clearSettingsEvents();
    localStorage.clear();
  });

  it("renders tail equipment and stand coordinate reference tables", () => {
    render(<ReferenceDataPage />);

    const tailTable = screen.getByRole("table", { name: "Tail equipment reference" });
    expect(within(tailTable).getByText("VH-8NB")).toBeVisible();
    expect(within(tailTable).getAllByText("B38M")[0]).toBeVisible();

    const standTable = screen.getByRole("table", { name: "Stand coordinates reference" });
    expect(within(standTable).getByText("Bay 17")).toBeVisible();
    expect(within(standTable).getByText("-27.38601")).toBeVisible();
  });

  it("resets reference defaults by emitting settings snapshot events", () => {
    render(<ReferenceDataPage />);

    fireEvent.click(screen.getByRole("button", { name: "Reset to defaults" }));

    expect(screen.getByText("tail-equipment-reference-v2")).toBeVisible();
    expect(screen.getByText("stand-coordinates-v2")).toBeVisible();
    expect(readSettingsEvents().map((event) => event.payload.settingsFamily)).toEqual([
      "tail_equipment_reference",
      "stand_coordinates",
    ]);
  });
});
