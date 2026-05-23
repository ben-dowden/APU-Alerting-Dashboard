import { fireEvent, render, screen, within } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";

import { clearSettingsEvents, readSettingsEvents } from "@/lib/prototype/settings-event-store";

import { FuelSettingsPage } from "./fuel-settings-page";

describe("FuelSettingsPage", () => {
  beforeEach(() => {
    clearSettingsEvents();
    localStorage.clear();
  });

  it("renders fuel price, equipment burn rates, fallback warning, versions, and kg preview", () => {
    render(<FuelSettingsPage />);

    expect(screen.getByLabelText("Fuel price per kg")).toHaveValue(1.18);
    expect(screen.getByText("fuel-price-v1")).toBeVisible();
    expect(screen.getByText("fuel-burn-assumptions-v1")).toBeVisible();

    const table = screen.getByRole("table", { name: "Fuel burn assumptions" });
    expect(within(table).getByText("B738")).toBeVisible();
    expect(within(table).getByText("UNKNOWN")).toBeVisible();
    expect(screen.getByText("Fallback rate applies when equipment is missing or unmatched.")).toBeVisible();

    const preview = screen.getByRole("region", { name: "Estimated fuel preview" });
    expect(within(preview).getByText("Estimated kg preview")).toBeVisible();
  });

  it("saves staged fuel settings and reset creates default snapshots", () => {
    render(<FuelSettingsPage />);

    fireEvent.change(screen.getByLabelText("Fuel price per kg"), { target: { value: "1.42" } });
    fireEvent.click(screen.getByRole("button", { name: "Save staged settings" }));

    expect(screen.getByText("fuel-price-v2")).toBeVisible();
    expect(readSettingsEvents().some((event) => event.payload.settingsFamily === "fuel_price")).toBe(true);

    fireEvent.change(screen.getByLabelText("Fuel price per kg"), { target: { value: "1.70" } });
    fireEvent.click(screen.getByRole("button", { name: "Reset to defaults" }));

    expect(screen.getByLabelText("Fuel price per kg")).toHaveValue(1.18);
    expect(readSettingsEvents().filter((event) => event.payload.settingsFamily === "fuel_price")).toHaveLength(2);
  });
});
