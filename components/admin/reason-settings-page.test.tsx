import { fireEvent, render, screen, within } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";

import { clearSettingsEvents, readSettingsEvents } from "@/lib/prototype/settings-event-store";

import { ReasonSettingsPage, createReasonSettingsModel } from "./reason-settings-page";

describe("ReasonSettingsPage", () => {
  beforeEach(() => {
    clearSettingsEvents();
    localStorage.clear();
  });

  it("renders category settings, detail editor, review intervals, active switches, and ordering controls", () => {
    render(<ReasonSettingsPage />);

    const categoryTable = screen.getByRole("table", { name: "Reason categories" });
    expect(within(categoryTable).getByText("Infrastructure unavailable")).toBeVisible();
    expect(within(categoryTable).getByText("Cleaning in progress")).toBeVisible();
    expect(within(categoryTable).getAllByRole("checkbox", { name: /category active/i })).toHaveLength(5);
    expect(within(categoryTable).getAllByRole("button", { name: /move .* up/i }).length).toBeGreaterThan(0);

    const detailEditor = screen.getByRole("region", { name: "Reason detail editor" });
    expect(within(detailEditor).getByLabelText("Default review interval")).toHaveValue(30);
    expect(within(detailEditor).getByText("PCA unavailable")).toBeVisible();
    expect(within(detailEditor).getAllByRole("checkbox", { name: /detail active/i })).toHaveLength(4);
    expect(screen.getByRole("region", { name: "Fast capture preview" })).toHaveTextContent(
      "PCA unavailable",
    );
  });

  it("prevents saving when a category has more than four active details", () => {
    render(<ReasonSettingsPage />);

    fireEvent.click(screen.getByRole("button", { name: "Add active detail" }));

    expect(screen.getByText("Maximum four active details per category.")).toBeVisible();
    expect(screen.getByRole("button", { name: "Save staged settings" })).toBeDisabled();
  });

  it("supports staged save and discard for global defaults", () => {
    render(<ReasonSettingsPage />);

    const intervalInput = screen.getByLabelText("Default review interval");
    fireEvent.change(intervalInput, { target: { value: "45" } });

    expect(screen.getByRole("button", { name: "Save staged settings" })).toBeEnabled();

    fireEvent.click(screen.getByRole("button", { name: "Discard staged settings" }));
    expect(screen.getByLabelText("Default review interval")).toHaveValue(30);

    fireEvent.change(screen.getByLabelText("Default review interval"), { target: { value: "45" } });
    fireEvent.click(screen.getByRole("button", { name: "Save staged settings" }));

    expect(screen.getByText("reason-taxonomy-v2")).toBeVisible();
    expect(readSettingsEvents()[0].payload.snapshot).toMatchObject({
      defaultReviewIntervalMinutes: 45,
    });
  });

  it("keeps the settings model ready for BNE overrides while editing global defaults only", () => {
    const model = createReasonSettingsModel();

    expect(model.globalDefaults.defaultReviewIntervalMinutes).toBe(30);
    expect(model.portOverrides.BNE).toEqual({ categories: [] });
  });
});
