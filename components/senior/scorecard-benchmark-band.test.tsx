import { act, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import type { BenchmarkBaselines, BenchmarkCurrent, DailyScorecard } from "@/lib/read-models";
import { ScorecardBenchmarkBand } from "./scorecard-benchmark-band";

const scorecard: DailyScorecard = {
  activeApuCount: 16,
  groundAircraftCount: 21,
  longRunnerCount: 7,
  longRunnerThresholdMinutes: 45,
  runtimeMinutesToday: 679,
  estimatedFuelKgToday: 1251.9,
  attributedRuntimePercent: 48.3,
  untaggedRuntimeMinutes: 351,
  untaggedRuntimePercent: 51.7,
  groundAircraftMinutes: 1179,
  apuIntensityPercent: 57.6,
};

const benchmarkCurrent: BenchmarkCurrent = {
  runtimeMinutes: 679,
  fuelKg: 1251.9,
  temperatureC: 24,
  apuIntensityPercent: 57.6,
};

const benchmarkBaselines: BenchmarkBaselines = {
  similar_temperature: { runtimeMinutes: 38, fuelKg: 70, apuIntensityPercent: 45.6 },
  weekly_average: { runtimeMinutes: 44, fuelKg: 81, apuIntensityPercent: 48.6 },
  monthly_average: { runtimeMinutes: 49, fuelKg: 90, apuIntensityPercent: 42.6 },
  annual_average: { runtimeMinutes: 52, fuelKg: 96, apuIntensityPercent: 39.6 },
};

describe("ScorecardBenchmarkBand", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("renders four stable command metrics without a separate benchmark panel", () => {
    render(
      <ScorecardBenchmarkBand
        benchmarkBaselines={benchmarkBaselines}
        benchmarkCurrent={benchmarkCurrent}
        scorecard={scorecard}
      />,
    );

    const metrics = screen.getByRole("region", { name: "APU command metrics" });

    expect(within(metrics).getAllByTestId("scorecard-label").map((label) => label.textContent)).toEqual([
      "Active now",
      "Long runners",
      "Explanation gap",
      "APU intensity",
    ]);
    expect(within(metrics).getByText("16 / 21")).toBeVisible();
    expect(within(metrics).getByText("ground aircraft")).toBeVisible();
    expect(within(metrics).getByText("live")).toBeVisible();
    expect(within(metrics).getByText("7 aircraft")).toBeVisible();
    expect(within(metrics).getByText("over 45 min")).toBeVisible();
    expect(within(metrics).getByText("current turns")).toBeVisible();
    expect(within(metrics).getByText("351 min")).toBeVisible();
    expect(within(metrics).getByText("untagged today")).toBeVisible();
    expect(within(metrics).getByText("51.7% of runtime")).toBeVisible();
    expect(within(metrics).getByText("58%")).toBeVisible();
    expect(within(metrics).getByText("APU-on ground time")).toBeVisible();
    expect(within(metrics).getByText("vs similar temp +12 pts")).toBeVisible();
    expect(screen.queryByRole("region", { name: "Benchmark comparison" })).not.toBeInTheDocument();
    expect(screen.queryByText(/Today so far/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Normal:/i)).not.toBeInTheDocument();
  });

  it("rotates only the APU intensity comparison line", () => {
    vi.useFakeTimers();

    render(
      <ScorecardBenchmarkBand
        benchmarkBaselines={benchmarkBaselines}
        benchmarkCurrent={benchmarkCurrent}
        scorecard={scorecard}
      />,
    );

    expect(screen.getByText("16 / 21")).toBeVisible();
    expect(screen.getByText("vs similar temp +12 pts")).toBeVisible();

    act(() => {
      vi.advanceTimersByTime(5000);
    });

    expect(screen.getByText("16 / 21")).toBeVisible();
    expect(screen.getByText("7 aircraft")).toBeVisible();
    expect(screen.getByText("351 min")).toBeVisible();
    expect(screen.getByText("vs last week +9 pts")).toBeVisible();
    expect(screen.queryByText("vs similar temp +12 pts")).not.toBeInTheDocument();
  });
});
