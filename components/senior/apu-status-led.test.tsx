import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { ApuStatusLed } from "./apu-status-led";

describe("ApuStatusLed", () => {
  it("renders a pulsing red LED for active APU state", () => {
    render(<ApuStatusLed status="on" />);

    const led = screen.getByRole("img", { name: "APU on" });
    expect(led).toHaveAttribute("title", "APU on");
    expect(led).toHaveClass("bg-virgin-red");
    expect(led).toHaveClass("motion-safe:animate-pulse");
  });

  it("renders a steady green LED for off APU state", () => {
    render(<ApuStatusLed status="off" />);

    const led = screen.getByRole("img", { name: "APU off" });
    expect(led).toHaveAttribute("title", "APU off");
    expect(led).toHaveClass("bg-green-600");
    expect(led).not.toHaveClass("motion-safe:animate-pulse");
  });

  it("renders a steady amber LED for pending manual off confirmation", () => {
    render(<ApuStatusLed status="pending" />);

    const led = screen.getByRole("img", { name: "Pending manual off confirmation" });
    expect(led).toHaveAttribute("title", "Pending manual off confirmation");
    expect(led).toHaveClass("bg-amber-500");
    expect(led).not.toHaveClass("motion-safe:animate-pulse");
  });
});
