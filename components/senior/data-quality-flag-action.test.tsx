import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { DataQualityFlagAction } from "./data-quality-flag-action";

describe("DataQualityFlagAction", () => {
  it("collects issue type and optional note from the compact card action", () => {
    const onCreateFlag = vi.fn();

    render(<DataQualityFlagAction onCreateFlag={onCreateFlag} tail="VH-8IA" />);

    fireEvent.click(screen.getByRole("button", { name: "Flag data quality for VH-8IA" }));
    fireEvent.change(screen.getByLabelText("Data quality issue type"), {
      target: { value: "source_stale" },
    });
    fireEvent.change(screen.getByLabelText("Data quality note"), {
      target: { value: "AODB source looks stale against bay display." },
    });
    fireEvent.click(screen.getByRole("button", { name: "Create data quality flag" }));

    expect(onCreateFlag).toHaveBeenCalledWith({
      issueType: "source_stale",
      note: "AODB source looks stale against bay display.",
    });
  });
});
