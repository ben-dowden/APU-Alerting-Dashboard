import { act, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import SeniorBneWallboardPage from "@/app/senior/bne/wallboard/page";

describe("SeniorBneWallboardPage", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("renders the read-only BNE wallboard shell", () => {
    render(<SeniorBneWallboardPage />);

    expect(screen.getByRole("heading", { name: "BNE Wallboard", level: 1 })).toBeVisible();
    expect(screen.getByText("APU on now")).toBeVisible();
    expect(screen.getByRole("region", { name: "Wallboard side index" })).toBeVisible();
  });

  it("renders a read-only wallboard command bar without workflow controls", () => {
    render(<SeniorBneWallboardPage />);

    expect(screen.getByText("Read-only TV mode")).toBeVisible();
    expect(screen.getByText("Senior Engineer / Wallboard")).toBeVisible();
    expect(screen.queryByText(/scenario/i)).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /manual refresh/i })).not.toBeInTheDocument();
    expect(screen.queryByRole("link", { name: /admin/i })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /change reason/i })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /mark apu off/i })).not.toBeInTheDocument();
    expect(screen.queryByText(/benchmark controls/i)).not.toBeInTheDocument();
  });

  it("amplifies scorecard labels and rotates the benchmark state every 5 seconds", () => {
    vi.useFakeTimers();

    render(<SeniorBneWallboardPage />);

    const scorecard = screen.getByRole("region", { name: "Wallboard scorecard" });
    expect(within(scorecard).getAllByTestId("wallboard-scorecard-label").map((label) => label.textContent)).toEqual([
      "APU on now",
      "Runtime today",
      "Fuel today",
      "Reason coverage",
    ]);

    const benchmark = screen.getByTestId("wallboard-benchmark-rotator");
    expect(benchmark).toHaveAttribute("data-rotation-interval-ms", "5000");
    expect(within(benchmark).getByText("Similar-temperature days")).toBeVisible();

    act(() => {
      vi.advanceTimersByTime(5000);
    });

    expect(within(benchmark).getByText("Weekly average")).toBeVisible();
  });

  it("renders passive aircraft cards with operational detail and no workflow actions", () => {
    render(<SeniorBneWallboardPage />);

    const stage = screen.getByRole("region", { name: "Wallboard carousel stage" });
    const card = within(stage).getByRole("article", {
      name: "VH-8IA wallboard aircraft card",
    });

    expect(within(card).getByText("VH-8IA")).toBeVisible();
    expect(within(card).getByText("B738")).toBeVisible();
    expect(within(card).getByText("Bay 20")).toBeVisible();
    expect(within(card).getByText("APU On")).toBeVisible();
    expect(within(card).getByText("00:46")).toBeVisible();
    expect(within(card).getByText("00:55")).toBeVisible();
    expect(within(card).getByText("85.9 kg")).toBeVisible();
    expect(within(card).getByText("Ground support")).toBeVisible();
    expect(within(card).getByText("Closest tail: VH-YFX")).toBeVisible();
    expect(within(card).getByText("Cleaning in progress")).toBeVisible();
    expect(within(card).getByText("Cleaner onboard")).toBeVisible();
    expect(within(card).getByText("Review due")).toBeVisible();
    expect(within(card).getByRole("group", { name: "Source charms for VH-8IA" })).toBeVisible();
    expect(within(card).getByText("ACMS")).toBeVisible();

    expect(within(card).queryByRole("button", { name: /select reason/i })).not.toBeInTheDocument();
    expect(within(card).queryByRole("button", { name: /change reason/i })).not.toBeInTheDocument();
    expect(within(card).queryByRole("button", { name: /manual off/i })).not.toBeInTheDocument();
    expect(within(card).queryByRole("button", { name: /data issue/i })).not.toBeInTheDocument();
    expect(within(card).queryByRole("button", { name: /reason drawer/i })).not.toBeInTheDocument();
    expect(within(card).queryByRole("button", { name: /qr/i })).not.toBeInTheDocument();
    expect(within(card).queryByRole("link")).not.toBeInTheDocument();
  });
});
