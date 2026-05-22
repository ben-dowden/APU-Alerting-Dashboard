import { render, screen } from "@testing-library/react";
import { within } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { BneCommandBoard } from "./bne-command-board";

describe("BneCommandBoard", () => {
  it("renders the compact command bar", () => {
    render(<BneCommandBoard />);

    expect(screen.getByRole("heading", { name: "BNE APU Command Board", level: 1 })).toBeVisible();
    expect(screen.getAllByText("BNE")[0]).toBeVisible();
    expect(screen.getByText("Senior Engineer")).toBeVisible();
    expect(screen.getByText("24°C")).toBeVisible();
    expect(screen.queryByText(/METAR/i)).not.toBeInTheDocument();
    expect(screen.getByText(/Feed fresh/i)).toBeVisible();
    expect(screen.getByText("18:55 AEST")).toBeVisible();
    expect(screen.getByRole("link", { name: /Wallboard/i })).toHaveAttribute(
      "href",
      "/senior/bne/wallboard",
    );
  });

  it("renders the scorecard and default similar-temperature benchmark without dollars", () => {
    render(<BneCommandBoard />);

    const scorecard = screen.getByRole("region", { name: "Daily scorecard" });
    expect(within(scorecard).getAllByTestId("scorecard-label").map((label) => label.textContent)).toEqual([
      "APU on now",
      "Runtime today",
      "Fuel burned today",
      "Attributed runtime",
    ]);

    const benchmark = screen.getByRole("region", { name: "Benchmark comparison" });
    expect(within(benchmark).getByText("Similar-temperature days")).toBeVisible();
    expect(within(benchmark).getByText("23-25°C")).toBeVisible();
    expect(within(benchmark).queryByText("Weekly average")).not.toBeInTheDocument();
    expect(within(benchmark).queryByText("Monthly average")).not.toBeInTheDocument();
    expect(within(benchmark).queryByText("Annual average")).not.toBeInTheDocument();

    const benchmarkText = benchmark.textContent ?? "";
    expect(benchmarkText.indexOf("+15.9 kg")).toBeLessThan(benchmarkText.indexOf("+8 min"));
    expect(screen.queryByText(/\$/)).not.toBeInTheDocument();
    expect(screen.queryByText(/AUD/i)).not.toBeInTheDocument();
  });
});
