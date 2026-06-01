import { act, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import type {
  BenchmarkBaselines,
  BenchmarkCurrent,
  DailyScorecard,
  ScorecardTrendPoint,
} from "@/lib/read-models";
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

const trend: ScorecardTrendPoint[] = Array.from({ length: 7 }, (_, index) => ({
  timestamp: `2026-05-22T0${index}:55:00.000Z`,
  activeApuCount: 10 + index,
  longRunnerCount: index,
  untaggedRuntimePercent: 20 + index,
  apuIntensityPercent: 40 + index,
}));

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
        trend={trend}
      />,
    );

    const metrics = screen.getByRole("region", { name: "APU command metrics" });

    expect(within(metrics).getAllByTestId("scorecard-label").map((label) => label.textContent)).toEqual([
      "ACTIVE NOW",
      "LONG RUNNERS",
      "UNEXPLAINED APU RUNTIME",
      "APU INTENSITY",
    ]);
    expect(within(metrics).getByText("16 APU-on")).toBeVisible();
    expect(within(metrics).getByText("of 21 aircraft on ground")).toBeVisible();
    expect(within(metrics).queryByText("Live")).not.toBeInTheDocument();
    expect(within(metrics).getByText("7 aircraft")).toBeVisible();
    expect(within(metrics).getByText("Over 45 min APU runtime")).toBeVisible();
    expect(within(metrics).getByText("7 flights need review")).toBeVisible();
    expect(within(metrics).getByText("351 min")).toBeVisible();
    expect(within(metrics).getByText("Untagged runtime today")).toBeVisible();
    expect(within(metrics).getByText("51.7% of runtime")).toBeVisible();
    expect(within(metrics).getByText("58%")).toBeVisible();
    expect(within(metrics).getByText("Ground time with APU-on today")).toBeVisible();
    expect(within(metrics).getByText("+12 pts vs similar temp")).toBeVisible();
    expect(within(metrics).getAllByRole("img", { name: /last 6 hours/i })).toHaveLength(4);
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
        trend={trend}
      />,
    );

    expect(screen.getByText("16 APU-on")).toBeVisible();
    expect(screen.getByText("+12 pts vs similar temp")).toBeVisible();

    act(() => {
      vi.advanceTimersByTime(5000);
    });

    expect(screen.getByText("16 APU-on")).toBeVisible();
    expect(screen.getByText("7 aircraft")).toBeVisible();
    expect(screen.getByText("351 min")).toBeVisible();
    expect(screen.getByText("+9 pts vs last week")).toBeVisible();
    expect(screen.queryByText("+12 pts vs similar temp")).not.toBeInTheDocument();
  });
});
