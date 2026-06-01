"use client";

import { useEffect, useState } from "react";

import { Card, CardContent } from "@/components/ui/card";
import {
  activeBenchmarkModeForElapsed,
  wallboardBenchmarkRotationIntervalMs,
  wallboardRotationTickMs,
} from "@/components/wallboard/wallboard-rotation";
import {
  deriveBenchmarkPanel,
  type BenchmarkBaselines,
  type BenchmarkCurrent,
  type DailyScorecard,
} from "@/lib/read-models";

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
