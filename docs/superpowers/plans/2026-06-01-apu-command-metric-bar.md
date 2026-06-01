# APU Command Metric Bar Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the current scorecard plus benchmark card with a four-tile APU command metric bar where only APU Intensity rotates benchmark context.

**Architecture:** Extend the existing read models first so the UI consumes named operational metrics instead of recalculating them in React. Keep the senior command board and wallboard as separate renderers over the same scorecard and benchmark concepts, with the senior board optimized for action scanning and the wallboard optimized for high-level summary.

**Tech Stack:** Next.js, React, TypeScript, Tailwind CSS, local `Card`/`Badge` primitives, Vitest, Testing Library.

---

## File Structure

- Modify: `lib/read-models/daily-scorecard.ts` to derive ground count, long runners, untagged runtime, ground exposure, and APU intensity.
- Modify: `lib/read-models/daily-scorecard.test.ts` to lock the BNE baseline scorecard values.
- Modify: `lib/read-models/benchmark-panel.ts` to add APU intensity baselines, percentage-point deltas, and short rotating labels.
- Modify: `lib/read-models/benchmark-panel.test.ts` to cover intensity labels and missing-baseline fallback.
- Modify: `components/senior/scorecard-benchmark-band.tsx` to render the four stable command tiles and rotate only the APU Intensity comparison line.
- Create: `components/senior/scorecard-benchmark-band.test.tsx` to test command tile copy and rotation.
- Modify: `components/senior/bne-command-board.tsx` to pass intensity-aware benchmark inputs to the senior metric bar.
- Modify: `components/senior/bne-command-board.test.tsx` to remove the old benchmark panel assertions and assert the new command metric bar.
- Modify: `components/wallboard/wallboard-scorecard-band.tsx` to align wallboard metrics with the command bar and remove the separate benchmark rotator panel.
- Modify: `components/wallboard/senior-wallboard-layout.tsx` to pass intensity-aware benchmark current values and baselines.
- Modify: `components/wallboard/wallboard-rotation-shell.tsx` to stop passing benchmark remaining time into the scorecard band.
- Modify: `components/wallboard/wallboard.test.tsx` to assert the wallboard summary metrics and that only APU Intensity benchmark text changes.

### Task 1: Extend Daily Scorecard Metrics

**Files:**
- Modify: `lib/read-models/daily-scorecard.ts`
- Modify: `lib/read-models/daily-scorecard.test.ts`

- [ ] **Step 1: Write the failing daily scorecard test**

Replace `lib/read-models/daily-scorecard.test.ts` with:

```ts
import { describe, expect, it } from "vitest";
import { fuelBurnAssumptionSettings } from "@/lib/fixtures/reference/fuel-assumptions";
import { reasonTaxonomySettings } from "@/lib/fixtures/reference/reason-taxonomy";
import { standCoordinateReferenceEvents } from "@/lib/fixtures/reference/stand-coordinates";
import { bneBaselineScenario } from "@/lib/fixtures/scenarios";
import { deriveCurrentBoard } from "./current-board";
import { deriveDailyScorecard } from "./daily-scorecard";

const settings = {
  reasonTaxonomy: reasonTaxonomySettings.payload.snapshot,
  fuelBurnAssumptions: fuelBurnAssumptionSettings,
  standCoordinates: standCoordinateReferenceEvents,
};

describe("deriveDailyScorecard", () => {
  it("summarizes the command metric bar inputs from the current BNE board", () => {
    const board = deriveCurrentBoard(
      bneBaselineScenario.events,
      settings,
      "2026-05-22T08:55:00.000Z",
    );

    expect(deriveDailyScorecard(board)).toEqual({
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
    });
  });

  it("keeps percentage metrics at zero when there is no runtime or ground exposure", () => {
    expect(
      deriveDailyScorecard({
        port: "BNE",
        nowIso: "2026-05-22T08:55:00.000Z",
        groundAircraft: [],
      }),
    ).toEqual({
      activeApuCount: 0,
      groundAircraftCount: 0,
      longRunnerCount: 0,
      longRunnerThresholdMinutes: 45,
      runtimeMinutesToday: 0,
      estimatedFuelKgToday: 0,
      attributedRuntimePercent: 0,
      untaggedRuntimeMinutes: 0,
      untaggedRuntimePercent: 0,
      groundAircraftMinutes: 0,
      apuIntensityPercent: 0,
    });
  });
});
```

- [ ] **Step 2: Run the daily scorecard test and confirm it fails**

Run:

```bash
npm test -- lib/read-models/daily-scorecard.test.ts
```

Expected: FAIL because `groundAircraftCount`, `longRunnerCount`, `untaggedRuntimeMinutes`, `groundAircraftMinutes`, and `apuIntensityPercent` are not yet present.

- [ ] **Step 3: Implement the extended daily scorecard**

Replace `lib/read-models/daily-scorecard.ts` with:

```ts
import type { CurrentBoardState } from "./current-board";
import { deriveReasonTaggedBurnRows } from "./reason-tagged-burn";

export const longRunnerThresholdMinutes = 45;

export type DailyScorecard = {
  activeApuCount: number;
  groundAircraftCount: number;
  longRunnerCount: number;
  longRunnerThresholdMinutes: number;
  runtimeMinutesToday: number;
  estimatedFuelKgToday: number;
  attributedRuntimePercent: number;
  untaggedRuntimeMinutes: number;
  untaggedRuntimePercent: number;
  groundAircraftMinutes: number;
  apuIntensityPercent: number;
};

const roundOne = (value: number) => Math.round(value * 10) / 10;

const percentOf = (part: number, total: number) =>
  total === 0 ? 0 : roundOne((part / total) * 100);

export const deriveDailyScorecard = (boardState: CurrentBoardState): DailyScorecard => {
  const burnRows = deriveReasonTaggedBurnRows(boardState);
  const runtimeMinutesToday = burnRows.reduce((total, row) => total + row.runtimeMinutes, 0);
  const estimatedFuelKgToday = roundOne(burnRows.reduce((total, row) => total + row.estimatedKg, 0));
  const attributedRuntimeMinutes = burnRows
    .filter((row) => !row.isUnattributed)
    .reduce((total, row) => total + row.runtimeMinutes, 0);
  const untaggedRuntimeMinutes = runtimeMinutesToday - attributedRuntimeMinutes;
  const groundAircraftMinutes = boardState.groundAircraft.reduce(
    (total, aircraft) => total + aircraft.groundMinutes,
    0,
  );

  return {
    activeApuCount: boardState.groundAircraft.filter((aircraft) => aircraft.apuState === "on").length,
    groundAircraftCount: boardState.groundAircraft.length,
    longRunnerCount: boardState.groundAircraft.filter(
      (aircraft) =>
        aircraft.apuState === "on" && aircraft.apuRuntimeMinutes > longRunnerThresholdMinutes,
    ).length,
    longRunnerThresholdMinutes,
    runtimeMinutesToday,
    estimatedFuelKgToday,
    attributedRuntimePercent: percentOf(attributedRuntimeMinutes, runtimeMinutesToday),
    untaggedRuntimeMinutes,
    untaggedRuntimePercent: percentOf(untaggedRuntimeMinutes, runtimeMinutesToday),
    groundAircraftMinutes,
    apuIntensityPercent: percentOf(runtimeMinutesToday, groundAircraftMinutes),
  };
};
```

- [ ] **Step 4: Re-run the daily scorecard test**

Run:

```bash
npm test -- lib/read-models/daily-scorecard.test.ts
```

Expected: PASS.

- [ ] **Step 5: Commit the scorecard read model**

Run:

```bash
git add lib/read-models/daily-scorecard.ts lib/read-models/daily-scorecard.test.ts
git commit -m Add-APU-command-scorecard-metrics
```

Expected: commit succeeds with only the daily scorecard files staged.

### Task 2: Add APU Intensity Benchmark Comparisons

**Files:**
- Modify: `lib/read-models/benchmark-panel.ts`
- Modify: `lib/read-models/benchmark-panel.test.ts`

- [ ] **Step 1: Write the failing benchmark tests**

Replace `lib/read-models/benchmark-panel.test.ts` with:

```ts
import { describe, expect, it } from "vitest";
import { deriveBenchmarkPanel } from "./benchmark-panel";

const current = {
  runtimeMinutes: 60,
  fuelKg: 100,
  temperatureC: 24,
  apuIntensityPercent: 57.6,
};

const baselines = {
  similar_temperature: { runtimeMinutes: 50, fuelKg: 80, apuIntensityPercent: 45.6 },
  weekly_average: { runtimeMinutes: 55, fuelKg: 90, apuIntensityPercent: 48.6 },
  monthly_average: { runtimeMinutes: 65, fuelKg: 110, apuIntensityPercent: 42.6 },
  annual_average: { runtimeMinutes: 70, fuelKg: 120, apuIntensityPercent: 39.6 },
};

describe("deriveBenchmarkPanel", () => {
  it("returns exactly one active comparison plus selectable modes", () => {
    const panel = deriveBenchmarkPanel(current, "weekly_average", baselines);

    expect(panel.activeComparison.mode).toBe("weekly_average");
    expect(panel.modes.map((mode) => mode.mode)).toEqual([
      "similar_temperature",
      "weekly_average",
      "monthly_average",
      "annual_average",
    ]);
  });

  it("calculates exact absolute and percentage deltas without dollars", () => {
    expect(deriveBenchmarkPanel(current, "similar_temperature", baselines).activeComparison).toEqual(
      expect.objectContaining({
        fuelDeltaKg: 20,
        fuelDeltaPercent: 25,
        runtimeDeltaMinutes: 10,
        runtimeDeltaPercent: 20,
        dollarDelta: undefined,
      }),
    );
  });

  it("uses a 3 degree similar-temperature band label", () => {
    expect(deriveBenchmarkPanel(current, "similar_temperature", baselines).activeComparison).toEqual(
      expect.objectContaining({
        basisLabel: "Similar-temperature days",
        temperatureBandLabel: "23-25°C",
      }),
    );
  });

  it("calculates APU intensity percentage-point deltas with short rotating copy", () => {
    expect(deriveBenchmarkPanel(current, "similar_temperature", baselines).activeComparison).toEqual(
      expect.objectContaining({
        apuIntensityDeltaPoints: 12,
        apuIntensityComparisonLabel: "vs similar temp +12 pts",
      }),
    );

    expect(deriveBenchmarkPanel(current, "weekly_average", baselines).activeComparison).toEqual(
      expect.objectContaining({
        apuIntensityDeltaPoints: 9,
        apuIntensityComparisonLabel: "vs last week +9 pts",
      }),
    );
  });

  it("shows a calm fallback when the active intensity baseline is missing", () => {
    const panel = deriveBenchmarkPanel(current, "monthly_average", {
      ...baselines,
      monthly_average: { runtimeMinutes: 65, fuelKg: 110 },
    });

    expect(panel.activeComparison.apuIntensityDeltaPoints).toBeUndefined();
    expect(panel.activeComparison.apuIntensityComparisonLabel).toBe("baseline pending");
  });
});
```

- [ ] **Step 2: Run the benchmark tests and confirm they fail**

Run:

```bash
npm test -- lib/read-models/benchmark-panel.test.ts
```

Expected: FAIL because benchmark current and baseline types do not include `apuIntensityPercent`.

- [ ] **Step 3: Implement benchmark intensity comparisons**

Replace `lib/read-models/benchmark-panel.ts` with:

```ts
export type BenchmarkMode =
  | "similar_temperature"
  | "weekly_average"
  | "monthly_average"
  | "annual_average";

export type BenchmarkCurrent = {
  runtimeMinutes: number;
  fuelKg: number;
  temperatureC: number;
  apuIntensityPercent: number;
};

export type BenchmarkBaseline = {
  runtimeMinutes: number;
  fuelKg: number;
  apuIntensityPercent?: number;
};

export type BenchmarkBaselines = Record<BenchmarkMode, BenchmarkBaseline>;

export type BenchmarkComparison = {
  mode: BenchmarkMode;
  basisLabel: string;
  temperatureBandLabel?: string;
  fuelDeltaKg: number;
  fuelDeltaPercent: number;
  runtimeDeltaMinutes: number;
  runtimeDeltaPercent: number;
  apuIntensityDeltaPoints?: number;
  apuIntensityComparisonLabel: string;
  dollarDelta?: undefined;
};

export type BenchmarkPanel = {
  activeComparison: BenchmarkComparison;
  modes: Array<{
    mode: BenchmarkMode;
    label: string;
    isActive: boolean;
  }>;
};

const labels: Record<BenchmarkMode, string> = {
  similar_temperature: "Similar temp",
  weekly_average: "Week",
  monthly_average: "Month",
  annual_average: "Year",
};

const basisLabels: Record<BenchmarkMode, string> = {
  similar_temperature: "Similar-temperature days",
  weekly_average: "Weekly average",
  monthly_average: "Monthly average",
  annual_average: "Annual average",
};

const intensityBasisLabels: Record<BenchmarkMode, string> = {
  similar_temperature: "similar temp",
  weekly_average: "last week",
  monthly_average: "last month",
  annual_average: "last year",
};

const defaultBaselines: BenchmarkBaselines = {
  similar_temperature: { runtimeMinutes: 0, fuelKg: 0 },
  weekly_average: { runtimeMinutes: 0, fuelKg: 0 },
  monthly_average: { runtimeMinutes: 0, fuelKg: 0 },
  annual_average: { runtimeMinutes: 0, fuelKg: 0 },
};

const roundOne = (value: number) => Math.round(value * 10) / 10;

const formatCompactNumber = (value: number) =>
  Number.isInteger(value) ? `${value}` : `${value}`;

const formatSignedNumber = (value: number) =>
  value > 0 ? `+${formatCompactNumber(value)}` : formatCompactNumber(value);

const percentDelta = (current: number, baseline: number) =>
  baseline === 0 ? 0 : roundOne(((current - baseline) / baseline) * 100);

const temperatureBandLabel = (temperatureC: number) => {
  const rounded = Math.round(temperatureC);
  return `${rounded - 1}-${rounded + 1}°C`;
};

const intensityComparisonFor = (
  current: BenchmarkCurrent,
  mode: BenchmarkMode,
  baseline: BenchmarkBaseline,
) => {
  if (baseline.apuIntensityPercent === undefined) {
    return {
      apuIntensityDeltaPoints: undefined,
      apuIntensityComparisonLabel: "baseline pending",
    };
  }

  const deltaPoints = roundOne(current.apuIntensityPercent - baseline.apuIntensityPercent);

  return {
    apuIntensityDeltaPoints: deltaPoints,
    apuIntensityComparisonLabel: `vs ${intensityBasisLabels[mode]} ${formatSignedNumber(
      deltaPoints,
    )} pts`,
  };
};

const comparisonFor = (
  current: BenchmarkCurrent,
  activeMode: BenchmarkMode,
  baseline: BenchmarkBaseline,
): BenchmarkComparison => ({
  mode: activeMode,
  basisLabel: basisLabels[activeMode],
  temperatureBandLabel:
    activeMode === "similar_temperature" ? temperatureBandLabel(current.temperatureC) : undefined,
  fuelDeltaKg: roundOne(current.fuelKg - baseline.fuelKg),
  fuelDeltaPercent: percentDelta(current.fuelKg, baseline.fuelKg),
  runtimeDeltaMinutes: roundOne(current.runtimeMinutes - baseline.runtimeMinutes),
  runtimeDeltaPercent: percentDelta(current.runtimeMinutes, baseline.runtimeMinutes),
  ...intensityComparisonFor(current, activeMode, baseline),
  dollarDelta: undefined,
});

export const deriveBenchmarkPanel = (
  current: BenchmarkCurrent,
  activeMode: BenchmarkMode = "similar_temperature",
  baselines: BenchmarkBaselines = defaultBaselines,
): BenchmarkPanel => ({
  activeComparison: comparisonFor(current, activeMode, baselines[activeMode]),
  modes: (Object.keys(labels) as BenchmarkMode[]).map((mode) => ({
    mode,
    label: labels[mode],
    isActive: mode === activeMode,
  })),
});
```

- [ ] **Step 4: Re-run the benchmark tests**

Run:

```bash
npm test -- lib/read-models/benchmark-panel.test.ts
```

Expected: PASS.

- [ ] **Step 5: Commit the benchmark model**

Run:

```bash
git add lib/read-models/benchmark-panel.ts lib/read-models/benchmark-panel.test.ts
git commit -m Add-APU-intensity-benchmarks
```

Expected: commit succeeds with only benchmark model files staged.

### Task 3: Build the Senior Command Metric Bar

**Files:**
- Modify: `components/senior/scorecard-benchmark-band.tsx`
- Create: `components/senior/scorecard-benchmark-band.test.tsx`
- Modify: `components/senior/bne-command-board.tsx`
- Modify: `components/senior/bne-command-board.test.tsx`

- [ ] **Step 1: Write the senior metric bar component test**

Create `components/senior/scorecard-benchmark-band.test.tsx`:

```tsx
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
```

- [ ] **Step 2: Run the senior metric bar test and confirm it fails**

Run:

```bash
npm test -- components/senior/scorecard-benchmark-band.test.tsx
```

Expected: FAIL because `ScorecardBenchmarkBand` still expects a pre-derived benchmark panel and renders the old card set.

- [ ] **Step 3: Implement the senior command metric bar**

Replace `components/senior/scorecard-benchmark-band.tsx` with:

```tsx
"use client";

import { useEffect, useState } from "react";

import type { BenchmarkBaselines, BenchmarkCurrent, DailyScorecard } from "@/lib/read-models";
import { deriveBenchmarkPanel } from "@/lib/read-models";
import { Card, CardContent } from "@/components/ui/card";
import {
  activeBenchmarkModeForElapsed,
  wallboardBenchmarkRotationIntervalMs,
  wallboardRotationTickMs,
} from "@/components/wallboard/wallboard-rotation";

type ScorecardBenchmarkBandProps = {
  scorecard: DailyScorecard;
  benchmarkBaselines: BenchmarkBaselines;
  benchmarkCurrent: BenchmarkCurrent;
};

type MetricTile = {
  label: string;
  value: string;
  detail: string;
  context: string;
};

const formatWholePercent = (value: number) => `${Math.round(value)}%`;

const scorecardMetricsFor = (
  scorecard: DailyScorecard,
  intensityComparisonLabel: string,
): MetricTile[] => [
  {
    label: "Active now",
    value: `${scorecard.activeApuCount} / ${scorecard.groundAircraftCount}`,
    detail: "ground aircraft",
    context: "live",
  },
  {
    label: "Long runners",
    value: `${scorecard.longRunnerCount} aircraft`,
    detail: `over ${scorecard.longRunnerThresholdMinutes} min`,
    context: "current turns",
  },
  {
    label: "Explanation gap",
    value: `${scorecard.untaggedRuntimeMinutes} min`,
    detail: "untagged today",
    context: `${scorecard.untaggedRuntimePercent}% of runtime`,
  },
  {
    label: "APU intensity",
    value: formatWholePercent(scorecard.apuIntensityPercent),
    detail: "APU-on ground time",
    context: intensityComparisonLabel,
  },
];

export function ScorecardBenchmarkBand({
  scorecard,
  benchmarkBaselines,
  benchmarkCurrent,
}: ScorecardBenchmarkBandProps) {
  const [elapsedMs, setElapsedMs] = useState(0);
  const activeBenchmarkMode = activeBenchmarkModeForElapsed(elapsedMs);
  const benchmark = deriveBenchmarkPanel(
    benchmarkCurrent,
    activeBenchmarkMode,
    benchmarkBaselines,
  );
  const metrics = scorecardMetricsFor(
    scorecard,
    benchmark.activeComparison.apuIntensityComparisonLabel,
  );

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setElapsedMs((currentElapsedMs) => currentElapsedMs + wallboardRotationTickMs);
    }, wallboardRotationTickMs);

    return () => window.clearInterval(intervalId);
  }, []);

  return (
    <section aria-label="APU command metrics" className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {metrics.map((metric) => (
        <Card key={metric.label}>
          <CardContent className="p-4">
            <p
              className="text-xs font-semibold uppercase tracking-normal text-neutral-500"
              data-testid="scorecard-label"
            >
              {metric.label}
            </p>
            <p className="mt-2 text-2xl font-semibold tracking-normal tabular-nums text-neutral-950">
              {metric.value}
            </p>
            <p className="mt-1 text-xs font-medium text-neutral-500">{metric.detail}</p>
            <p
              aria-live={metric.label === "APU intensity" ? "polite" : undefined}
              className="mt-2 text-xs font-semibold text-neutral-700"
              data-rotation-interval-ms={
                metric.label === "APU intensity"
                  ? wallboardBenchmarkRotationIntervalMs
                  : undefined
              }
            >
              {metric.context}
            </p>
          </CardContent>
        </Card>
      ))}
    </section>
  );
}
```

- [ ] **Step 4: Re-run the senior metric bar component test**

Run:

```bash
npm test -- components/senior/scorecard-benchmark-band.test.tsx
```

Expected: PASS.

- [ ] **Step 5: Wire the command board to intensity-aware benchmark inputs**

In `components/senior/bne-command-board.tsx`, remove `deriveBenchmarkPanel` from the read-model import list.

Replace the `benchmarkBaselines` object with:

```ts
const benchmarkBaselines = {
  similar_temperature: { runtimeMinutes: 38, fuelKg: 70, apuIntensityPercent: 45.6 },
  weekly_average: { runtimeMinutes: 44, fuelKg: 81, apuIntensityPercent: 48.6 },
  monthly_average: { runtimeMinutes: 49, fuelKg: 90, apuIntensityPercent: 42.6 },
  annual_average: { runtimeMinutes: 52, fuelKg: 96, apuIntensityPercent: 39.6 },
};
```

Replace the `benchmarkPanel` declaration with:

```ts
const benchmarkCurrent = {
  runtimeMinutes: scorecard.runtimeMinutesToday,
  fuelKg: scorecard.estimatedFuelKgToday,
  temperatureC: board.weather?.temperatureC ?? 0,
  apuIntensityPercent: scorecard.apuIntensityPercent,
};
```

Replace the scorecard render call with:

```tsx
<ScorecardBenchmarkBand
  benchmarkBaselines={benchmarkBaselines}
  benchmarkCurrent={benchmarkCurrent}
  scorecard={scorecard}
/>
```

- [ ] **Step 6: Update the command-board integration test**

In `components/senior/bne-command-board.test.tsx`, replace the test named `renders the scorecard and default similar-temperature benchmark without dollars` with:

```tsx
it("renders the command metric bar with APU intensity benchmark context", () => {
  render(<BneCommandBoard />);

  const scorecard = screen.getByRole("region", { name: "APU command metrics" });

  expect(within(scorecard).getAllByTestId("scorecard-label").map((label) => label.textContent)).toEqual([
    "Active now",
    "Long runners",
    "Explanation gap",
    "APU intensity",
  ]);
  expect(within(scorecard).getByText("16 / 21")).toBeVisible();
  expect(within(scorecard).getByText("7 aircraft")).toBeVisible();
  expect(within(scorecard).getByText("351 min")).toBeVisible();
  expect(within(scorecard).getByText("58%")).toBeVisible();
  expect(within(scorecard).getByText("vs similar temp +12 pts")).toBeVisible();
  expect(screen.queryByRole("region", { name: "Benchmark comparison" })).not.toBeInTheDocument();
  expect(screen.queryByText("Similar-temperature days")).not.toBeInTheDocument();
  expect(screen.queryByText(/\$/)).not.toBeInTheDocument();
  expect(screen.queryByText(/AUD/i)).not.toBeInTheDocument();
});
```

- [ ] **Step 7: Run senior command board tests**

Run:

```bash
npm test -- components/senior/scorecard-benchmark-band.test.tsx components/senior/bne-command-board.test.tsx
```

Expected: PASS.

- [ ] **Step 8: Commit the senior metric bar**

Run:

```bash
git add components/senior/scorecard-benchmark-band.tsx components/senior/scorecard-benchmark-band.test.tsx components/senior/bne-command-board.tsx components/senior/bne-command-board.test.tsx
git commit -m Implement-APU-command-metric-bar
```

Expected: commit succeeds with only senior metric bar files staged.

### Task 4: Align the Wallboard Summary

**Files:**
- Modify: `components/wallboard/wallboard-scorecard-band.tsx`
- Modify: `components/wallboard/wallboard-rotation-shell.tsx`
- Modify: `components/wallboard/senior-wallboard-layout.tsx`
- Modify: `components/wallboard/wallboard.test.tsx`

- [ ] **Step 1: Update wallboard tests for command-derived summary metrics**

In `components/wallboard/wallboard.test.tsx`, replace the test named `amplifies scorecard labels and rotates the benchmark state every 5 seconds` with:

```tsx
it("amplifies command-derived scorecard labels and rotates only APU intensity", () => {
  vi.useFakeTimers();

  render(<SeniorBneWallboardPage />);

  const scorecard = screen.getByRole("region", { name: "Wallboard scorecard" });
  expect(within(scorecard).getAllByTestId("wallboard-scorecard-label").map((label) => label.textContent)).toEqual([
    "Active now",
    "Long runners",
    "Explanation gap",
    "APU intensity",
  ]);
  expect(within(scorecard).getByText("16 / 21")).toBeVisible();
  expect(within(scorecard).getByText("7 aircraft")).toBeVisible();
  expect(within(scorecard).getByText("351 min")).toBeVisible();
  expect(within(scorecard).getByText("58%")).toBeVisible();
  expect(within(scorecard).getByText("vs similar temp +12 pts")).toBeVisible();
  expect(screen.queryByTestId("wallboard-benchmark-rotator")).not.toBeInTheDocument();
  expect(screen.queryByRole("timer", { name: /Benchmark rotates/i })).not.toBeInTheDocument();

  act(() => {
    vi.advanceTimersByTime(5000);
  });

  expect(within(scorecard).getByText("16 / 21")).toBeVisible();
  expect(within(scorecard).getByText("7 aircraft")).toBeVisible();
  expect(within(scorecard).getByText("351 min")).toBeVisible();
  expect(within(scorecard).getByText("vs last week +9 pts")).toBeVisible();
  expect(within(scorecard).queryByText("vs similar temp +12 pts")).not.toBeInTheDocument();
});
```

Replace the benchmark assertions inside `keeps section timers synchronized with card, sidebar, and benchmark rotation` with this revised test body:

```tsx
it("keeps card and sidebar timers synchronized while benchmark text rides inside APU intensity", () => {
  vi.useFakeTimers();

  render(<SeniorBneWallboardPage />);

  const scorecard = screen.getByRole("region", { name: "Wallboard scorecard" });
  const stage = screen.getByRole("region", { name: "Wallboard carousel stage" });
  const sideIndex = screen.getByRole("region", { name: "Wallboard side index" });

  expect(within(stage).getByRole("timer", { name: "Aircraft cards rotate in 5s" })).toBeVisible();
  expect(within(sideIndex).getByRole("timer", { name: "Sidebar page rotates in 20s" })).toBeVisible();
  expect(within(scorecard).getByText("vs similar temp +12 pts")).toBeVisible();
  expect(within(stage).getByText("Page 1 of 6")).toBeVisible();
  expect(within(sideIndex).getByText("Page 1 of 2")).toBeVisible();

  act(() => {
    vi.advanceTimersByTime(4000);
  });

  expect(within(stage).getByRole("timer", { name: "Aircraft cards rotate in 1s" })).toBeVisible();
  expect(within(sideIndex).getByRole("timer", { name: "Sidebar page rotates in 16s" })).toBeVisible();
  expect(within(scorecard).getByText("vs similar temp +12 pts")).toBeVisible();

  act(() => {
    vi.advanceTimersByTime(1000);
  });

  expect(within(stage).getByRole("timer", { name: "Aircraft cards rotate in 5s" })).toBeVisible();
  expect(within(sideIndex).getByRole("timer", { name: "Sidebar page rotates in 15s" })).toBeVisible();
  expect(within(stage).getByText("Page 2 of 6")).toBeVisible();
  expect(within(sideIndex).getByText("Page 1 of 2")).toBeVisible();
  expect(within(scorecard).getByText("vs last week +9 pts")).toBeVisible();

  act(() => {
    vi.advanceTimersByTime(15000);
  });

  expect(within(sideIndex).getByRole("timer", { name: "Sidebar page rotates in 20s" })).toBeVisible();
  expect(within(stage).getByText("Page 5 of 6")).toBeVisible();
  expect(within(sideIndex).getByText("Page 2 of 2")).toBeVisible();
  expect(within(scorecard).getByText("vs similar temp +12 pts")).toBeVisible();
});
```

- [ ] **Step 2: Run wallboard tests and confirm failures**

Run:

```bash
npm test -- components/wallboard/wallboard.test.tsx
```

Expected: FAIL because the wallboard still renders the old scorecard labels and separate benchmark rotator.

- [ ] **Step 3: Implement the wallboard scorecard band**

Replace `components/wallboard/wallboard-scorecard-band.tsx` with:

```tsx
import {
  deriveBenchmarkPanel,
  type BenchmarkBaselines,
  type BenchmarkComparison,
  type BenchmarkCurrent,
  type BenchmarkMode,
  type DailyScorecard,
} from "@/lib/read-models";

type WallboardScorecardBandProps = {
  activeBenchmarkMode: BenchmarkMode;
  benchmarkBaselines: BenchmarkBaselines;
  benchmarkCurrent: BenchmarkCurrent;
  scorecard: DailyScorecard;
};

type ScorecardMetric = {
  label: string;
  value: string;
  detail: string;
  context: string;
};

const formatWholePercent = (value: number) => `${Math.round(value)}%`;

const scorecardMetricsFor = (
  scorecard: DailyScorecard,
  activeComparison: BenchmarkComparison,
): ScorecardMetric[] => [
  {
    label: "Active now",
    value: `${scorecard.activeApuCount} / ${scorecard.groundAircraftCount}`,
    detail: "ground aircraft",
    context: "live",
  },
  {
    label: "Long runners",
    value: `${scorecard.longRunnerCount} aircraft`,
    detail: `over ${scorecard.longRunnerThresholdMinutes} min`,
    context: "current turns",
  },
  {
    label: "Explanation gap",
    value: `${scorecard.untaggedRuntimeMinutes} min`,
    detail: "untagged today",
    context: `${scorecard.untaggedRuntimePercent}% of runtime`,
  },
  {
    label: "APU intensity",
    value: formatWholePercent(scorecard.apuIntensityPercent),
    detail: "APU-on ground time",
    context: activeComparison.apuIntensityComparisonLabel,
  },
];

export function WallboardScorecardBand({
  activeBenchmarkMode,
  benchmarkBaselines,
  benchmarkCurrent,
  scorecard,
}: WallboardScorecardBandProps) {
  const benchmark = deriveBenchmarkPanel(
    benchmarkCurrent,
    activeBenchmarkMode,
    benchmarkBaselines,
  );
  const metrics = scorecardMetricsFor(scorecard, benchmark.activeComparison);

  return (
    <section aria-label="Wallboard scorecard" className="grid grid-cols-4 gap-3 px-6 py-4">
      {metrics.map((metric) => (
        <div className="rounded-product border border-neutral-200 bg-white p-4" key={metric.label}>
          <p
            className="text-sm font-semibold uppercase tracking-normal text-neutral-500"
            data-testid="wallboard-scorecard-label"
          >
            {metric.label}
          </p>
          <p className="mt-2 text-3xl font-semibold tracking-normal tabular-nums text-neutral-950">
            {metric.value}
          </p>
          <p className="mt-1 text-sm font-medium text-neutral-500">{metric.detail}</p>
          <p
            aria-live={metric.label === "APU intensity" ? "polite" : undefined}
            className="mt-2 text-sm font-semibold text-neutral-700"
          >
            {metric.context}
          </p>
        </div>
      ))}
    </section>
  );
}
```

- [ ] **Step 4: Remove the unused wallboard scorecard prop**

In `components/wallboard/wallboard-rotation-shell.tsx`, remove `wallboardBenchmarkRotationIntervalMs` and `remainingFor` from the import list for `./wallboard-rotation` when they are only used for the scorecard benchmark panel. Keep `remainingFor` imported for `WallboardAircraftStage` through that component's own file.

Replace the `WallboardScorecardBand` render call with:

```tsx
<WallboardScorecardBand
  activeBenchmarkMode={activeBenchmarkMode}
  benchmarkBaselines={benchmarkBaselines}
  benchmarkCurrent={benchmarkCurrent}
  scorecard={scorecard}
/>
```

- [ ] **Step 5: Add intensity values to wallboard benchmark inputs**

In `components/wallboard/senior-wallboard-layout.tsx`, replace the benchmark baselines with:

```ts
const benchmarkBaselines = {
  similar_temperature: { runtimeMinutes: 38, fuelKg: 70, apuIntensityPercent: 45.6 },
  weekly_average: { runtimeMinutes: 44, fuelKg: 81, apuIntensityPercent: 48.6 },
  monthly_average: { runtimeMinutes: 49, fuelKg: 90, apuIntensityPercent: 42.6 },
  annual_average: { runtimeMinutes: 52, fuelKg: 96, apuIntensityPercent: 39.6 },
};
```

Add `apuIntensityPercent` to `benchmarkCurrent`:

```ts
const benchmarkCurrent = {
  runtimeMinutes: scorecard.runtimeMinutesToday,
  fuelKg: scorecard.estimatedFuelKgToday,
  temperatureC: board.weather?.temperatureC ?? 0,
  apuIntensityPercent: scorecard.apuIntensityPercent,
};
```

- [ ] **Step 6: Re-run wallboard tests**

Run:

```bash
npm test -- components/wallboard/wallboard.test.tsx
```

Expected: PASS.

- [ ] **Step 7: Commit the wallboard metric alignment**

Run:

```bash
git add components/wallboard/wallboard-scorecard-band.tsx components/wallboard/wallboard-rotation-shell.tsx components/wallboard/senior-wallboard-layout.tsx components/wallboard/wallboard.test.tsx
git commit -m Align-wallboard-with-command-metrics
```

Expected: commit succeeds with only wallboard metric files staged.

### Task 5: Final Verification

**Files:**
- Verify: `lib/read-models/daily-scorecard.ts`
- Verify: `lib/read-models/benchmark-panel.ts`
- Verify: `components/senior/scorecard-benchmark-band.tsx`
- Verify: `components/senior/bne-command-board.tsx`
- Verify: `components/wallboard/wallboard-scorecard-band.tsx`
- Verify: `components/wallboard/senior-wallboard-layout.tsx`

- [ ] **Step 1: Run targeted read-model tests**

Run:

```bash
npm test -- lib/read-models/daily-scorecard.test.ts lib/read-models/benchmark-panel.test.ts
```

Expected: PASS.

- [ ] **Step 2: Run targeted senior UI tests**

Run:

```bash
npm test -- components/senior/scorecard-benchmark-band.test.tsx components/senior/bne-command-board.test.tsx
```

Expected: PASS.

- [ ] **Step 3: Run wallboard tests**

Run:

```bash
npm test -- components/wallboard/wallboard.test.tsx
```

Expected: PASS.

- [ ] **Step 4: Run the full test suite**

Run:

```bash
npm test
```

Expected: PASS.

- [ ] **Step 5: Run the production build**

Run:

```bash
npm run build
```

Expected: PASS.

- [ ] **Step 6: Verify the senior command board in browser**

Start the dev server:

```bash
npm run dev
```

Open `http://127.0.0.1:3000/senior/bne` and verify the top metric bar renders:

```text
+----------------------------------------------------------------------------------+
| ACTIVE NOW        | LONG RUNNERS        | EXPLANATION GAP    | APU INTENSITY      |
| 16 / 21           | 7 aircraft          | 351 min            | 58%                |
| ground aircraft   | over 45 min         | untagged today     | APU-on ground time |
| live              | current turns       | 51.7% of runtime   | vs similar temp +12 pts |
+----------------------------------------------------------------------------------+
```

Wait 5 seconds and verify only the APU Intensity bottom line changes to:

```text
vs last week +9 pts
```

Confirm there is no separate benchmark panel and no header copy containing `Today so far` or `Normal:`.

- [ ] **Step 7: Verify the wallboard in browser**

With the same dev server running, open `http://127.0.0.1:3000/senior/bne/wallboard` and verify the wallboard top band renders the same four concepts at wallboard scale:

```text
+----------------------------------------------------------------------------------+
| ACTIVE NOW        | LONG RUNNERS        | EXPLANATION GAP    | APU INTENSITY      |
| 16 / 21           | 7 aircraft          | 351 min            | 58%                |
| ground aircraft   | over 45 min         | untagged today     | APU-on ground time |
| live              | current turns       | 51.7% of runtime   | vs similar temp +12 pts |
+----------------------------------------------------------------------------------+
```

Wait 5 seconds and verify only the APU Intensity bottom line changes to:

```text
vs last week +9 pts
```

Confirm aircraft card and side-index rotation still work.

- [ ] **Step 8: Commit final verification notes only when code changed during verification**

Run:

```bash
git status --short
```

Expected: no unstaged implementation changes remain. When there are no changes, do not create a commit.
