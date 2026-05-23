import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { ManualApuOffAction } from "./manual-apu-off-action";

describe("ManualApuOffAction", () => {
  it("creates a compact mark-off action when source confirmation is not pending", () => {
    const onMarkOff = vi.fn();

    render(<ManualApuOffAction isPending={false} onMarkOff={onMarkOff} tail="VH-8IA" />);

    fireEvent.click(screen.getByRole("button", { name: "Mark APU off for VH-8IA" }));

    expect(onMarkOff).toHaveBeenCalledOnce();
  });

  it("shows neutral pending state while source confirmation is outstanding", () => {
    render(<ManualApuOffAction isPending={true} onMarkOff={vi.fn()} tail="VH-8IA" />);

    expect(screen.getByText("Pending off")).toHaveAttribute(
      "title",
      "Source confirmation outstanding",
    );
    expect(screen.queryByRole("button", { name: "Mark APU off for VH-8IA" })).not.toBeInTheDocument();
  });
});
