import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { reasonTaxonomySettings } from "@/lib/fixtures/reference/reason-taxonomy";
import { ReasonPicker } from "./reason-picker";

const taxonomy = reasonTaxonomySettings.payload.snapshot;

describe("ReasonPicker", () => {
  it("renders select reason as the filled purple primary trigger", () => {
    render(<ReasonPicker mode="select" onSelect={vi.fn()} taxonomy={taxonomy} />);

    expect(screen.getByRole("button", { name: "Select reason" })).toHaveClass("bg-virgin-purple");
  });

  it("renders change reason as a quieter trigger", () => {
    render(<ReasonPicker mode="change" onSelect={vi.fn()} taxonomy={taxonomy} />);

    const trigger = screen.getByRole("button", { name: "Change reason" });
    expect(trigger).toHaveClass("border-neutral-300");
    expect(trigger).not.toHaveClass("bg-virgin-purple");
  });

  it("reveals the detail pane after a category click", () => {
    render(<ReasonPicker mode="select" onSelect={vi.fn()} taxonomy={taxonomy} />);

    fireEvent.click(screen.getByRole("button", { name: "Select reason" }));
    fireEvent.click(screen.getByRole("button", { name: "Engineering requirement" }));

    const detailPane = screen.getByRole("group", { name: "Engineering requirement details" });
    expect(within(detailPane).getByRole("button", { name: "Maintenance task in progress" })).toBeVisible();
  });

  it("calls onSelect once after detail click", () => {
    const onSelect = vi.fn();
    render(<ReasonPicker mode="select" onSelect={onSelect} taxonomy={taxonomy} />);

    fireEvent.click(screen.getByRole("button", { name: "Select reason" }));
    fireEvent.click(screen.getByRole("button", { name: "Cleaning in progress" }));
    fireEvent.click(screen.getByRole("button", { name: "Cleaner onboard" }));

    expect(onSelect).toHaveBeenCalledTimes(1);
    expect(onSelect).toHaveBeenCalledWith({
      categoryId: "cleaning-in-progress",
      categoryLabel: "Cleaning in progress",
      detailId: "cleaner-onboard",
      detailLabel: "Cleaner onboard",
    });
  });

  it("closes on Escape without selecting", () => {
    const onSelect = vi.fn();
    render(<ReasonPicker mode="select" onSelect={onSelect} taxonomy={taxonomy} />);

    fireEvent.click(screen.getByRole("button", { name: "Select reason" }));
    fireEvent.keyDown(document, { key: "Escape" });

    expect(screen.queryByRole("group", { name: "Reason categories" })).not.toBeInTheDocument();
    expect(onSelect).not.toHaveBeenCalled();
  });

  it("renders no more than four active details for a category", () => {
    render(<ReasonPicker mode="select" onSelect={vi.fn()} taxonomy={taxonomy} />);

    fireEvent.click(screen.getByRole("button", { name: "Select reason" }));
    fireEvent.click(screen.getByRole("button", { name: "Infrastructure unavailable" }));

    const detailPane = screen.getByRole("group", { name: "Infrastructure unavailable details" });
    expect(within(detailPane).getAllByRole("button")).toHaveLength(4);
  });

  it("keeps category and detail selection visible without popover scrolling", () => {
    render(<ReasonPicker mode="select" onSelect={vi.fn()} taxonomy={taxonomy} />);

    fireEvent.click(screen.getByRole("button", { name: "Select reason" }));
    fireEvent.click(screen.getByRole("button", { name: "Logistics / agent on the way" }));

    const popover = screen.getByRole("dialog", { name: "Reason picker" });
    const categoryPane = screen.getByRole("group", { name: "Reason categories" });
    const detailPane = screen.getByRole("group", { name: "Logistics / agent on the way details" });

    expect(popover).toHaveClass("overflow-visible");
    expect(categoryPane).not.toHaveClass("overflow-y-auto");
    expect(detailPane).not.toHaveClass("overflow-y-auto");
    expect(within(detailPane).getByRole("button", { name: "Agent on the way" })).toBeVisible();
  });
});
