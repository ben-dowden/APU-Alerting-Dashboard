import { fireEvent, render, screen, within } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";

import { clearSettingsEvents } from "@/lib/prototype/settings-event-store";

import { UrgencySettingsPage } from "./urgency-settings-page";

describe("UrgencySettingsPage", () => {
  beforeEach(() => {
    clearSettingsEvents();
    localStorage.clear();
  });

  it("renders fixed bucket order, editable global weights, and the BNE board preview", () => {
    render(<UrgencySettingsPage />);

    const bucketList = screen.getByRole("list", { name: "Fixed urgency bucket order" });
    expect(within(bucketList).getByText("Missing reason")).toBeVisible();
    expect(within(bucketList).getByText("Review overdue")).toBeVisible();
    expect(screen.getByText("Global defaults only")).toBeVisible();
    expect(screen.getByLabelText("Runtime minutes weight")).toHaveValue(0.42);
    expect(screen.getByLabelText("Overdue minutes weight")).toHaveValue(0.32);

    const preview = screen.getByRole("table", { name: "BNE board order preview" });
    expect(within(preview).getByText("Rank")).toBeVisible();
    expect(within(preview).getByText("Tail")).toBeVisible();
  });

  it("validates weights and resets defaults", () => {
    render(<UrgencySettingsPage />);

    fireEvent.change(screen.getByLabelText("Runtime minutes weight"), { target: { value: "0" } });
    fireEvent.change(screen.getByLabelText("Overdue minutes weight"), { target: { value: "0" } });
    fireEvent.change(screen.getByLabelText("Proximity count weight"), { target: { value: "0" } });
    fireEvent.change(screen.getByLabelText("Source staleness minutes weight"), { target: { value: "0" } });

    expect(screen.getByText("At least one urgency weight must be greater than zero.")).toBeVisible();
    expect(screen.getByRole("button", { name: "Save staged settings" })).toBeDisabled();

    fireEvent.click(screen.getByRole("button", { name: "Reset to defaults" }));

    expect(screen.getByLabelText("Runtime minutes weight")).toHaveValue(0.42);
    expect(screen.getByText("urgency-ranking-v2")).toBeVisible();
  });
});
