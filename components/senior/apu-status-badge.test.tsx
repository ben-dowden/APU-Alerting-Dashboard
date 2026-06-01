import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { ApuStatusBadge } from "./apu-status-badge";

describe("ApuStatusBadge", () => {
  it("renders urgent pulsing red treatment for APU on", () => {
    render(<ApuStatusBadge state="on" />);

    const badge = screen.getByRole("status", { name: "APU On" });
    const led = screen.getByRole("img", { name: "APU on active" });

    expect(badge).toHaveTextContent("APU On");
    expect(badge).toHaveClass("border-virgin-red/40", "text-virgin-red");
    expect(led).toHaveClass("bg-virgin-red", "motion-safe:animate-pulse");
  });

  it("renders pulsing amber treatment for pending manual off confirmation", () => {
    render(<ApuStatusBadge state="pending" />);

    const badge = screen.getByRole("status", { name: "Pending off" });
    const led = screen.getByRole("img", { name: "APU off confirmation pending" });

    expect(badge).toHaveTextContent("Pending off");
    expect(badge).toHaveClass("border-amber-400/50", "text-amber-700");
    expect(led).toHaveClass("bg-amber-500", "motion-safe:animate-pulse");
  });

  it("renders solid green treatment for APU off", () => {
    render(<ApuStatusBadge state="off" />);

    const badge = screen.getByRole("status", { name: "APU Off" });
    const led = screen.getByRole("img", { name: "APU off" });

    expect(badge).toHaveTextContent("APU Off");
    expect(badge).toHaveClass("border-green-500/40", "text-green-700");
    expect(led).toHaveClass("bg-green-600");
    expect(led).not.toHaveClass("motion-safe:animate-pulse");
  });
});
