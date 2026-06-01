import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { ManualApuOffAction } from "./manual-apu-off-action";

describe("ManualApuOffAction", () => {
  it("creates a ghost icon-only mark-off action when confirmation is not pending", () => {
    const onMarkOff = vi.fn();

    render(<ManualApuOffAction isPending={false} onMarkOff={onMarkOff} tail="VH-8IA" />);

    const button = screen.getByRole("button", { name: "Manually mark APU off for VH-8IA" });

    expect(button).toHaveAttribute("title", "Manually mark APU off");
    expect(button).toHaveClass("text-virgin-red");
    expect(button).toHaveClass("hover:bg-neutral-100");
    expect(button).toHaveTextContent("");

    fireEvent.click(button);

    expect(onMarkOff).toHaveBeenCalledOnce();
  });

  it("renders no action while source confirmation is outstanding", () => {
    render(<ManualApuOffAction isPending={true} onMarkOff={vi.fn()} tail="VH-8IA" />);

    expect(
      screen.queryByRole("button", { name: "Manually mark APU off for VH-8IA" }),
    ).not.toBeInTheDocument();
    expect(screen.queryByText("Pending off")).not.toBeInTheDocument();
  });
});
