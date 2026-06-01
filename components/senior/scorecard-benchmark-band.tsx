"use client";

import { useEffect, useState } from "react";

import {
  scorecardMetricTilesFor,
  type ScorecardMetricTile,
} from "@/components/scorecard/scorecard-metrics";
import { ScorecardSparkline } from "@/components/scorecard/scorecard-sparkline";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  type ScorecardTrendPoint,
} from "@/lib/read-models";

type ScorecardBenchmarkBandProps = {
  scorecard: DailyScorecard;
  benchmarkBaselines: BenchmarkBaselines;
  benchmarkCurrent: BenchmarkCurrent;
  trend: ScorecardTrendPoint[];
};

const isIntensityMetric = (metric: ScorecardMetricTile) => metric.key === "apu_intensity";

export function ScorecardBenchmarkBand({
  scorecard,
  benchmarkBaselines,
  benchmarkCurrent,
  trend,
}: ScorecardBenchmarkBandProps) {
  const [elapsedMs, setElapsedMs] = useState(0);
  const activeBenchmarkMode = activeBenchmarkModeForElapsed(elapsedMs);
  const benchmark = deriveBenchmarkPanel(
    benchmarkCurrent,
    activeBenchmarkMode,
    benchmarkBaselines,
  );
  const metrics = scorecardMetricTilesFor(scorecard, benchmark.activeComparison, trend);

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setElapsedMs((currentElapsedMs) => currentElapsedMs + wallboardRotationTickMs);
    }, wallboardRotationTickMs);

    return () => window.clearInterval(intervalId);
  }, []);

  return (
    <section aria-label="APU command metrics" className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {metrics.map((metric) => (
        <Card className="overflow-hidden" key={metric.key}>
          <CardHeader className="flex flex-row items-start justify-between gap-3 p-4 pb-0">
            <CardTitle
              className="text-xs font-semibold leading-none tracking-normal text-neutral-500"
              data-testid="scorecard-label"
            >
              {metric.label}
            </CardTitle>
            {metric.badgeLabel ? (
              <Badge
                aria-live={isIntensityMetric(metric) ? "polite" : undefined}
                className="shrink-0"
                data-rotation-interval-ms={
                  isIntensityMetric(metric) ? wallboardBenchmarkRotationIntervalMs : undefined
                }
                variant={metric.badgeVariant}
              >
                {metric.badgeLabel}
              </Badge>
            ) : null}
          </CardHeader>
          <CardContent className="grid grid-cols-[minmax(0,1fr)_96px] items-end gap-3 p-4 pt-3">
            <div className="min-w-0">
              <p className="text-2xl font-semibold tracking-normal tabular-nums text-neutral-950">
                {metric.value}
              </p>
              <p className="mt-1 text-xs font-medium text-neutral-500">{metric.detail}</p>
            </div>
            <ScorecardSparkline label={metric.trendLabel} values={metric.trendValues} />
          </CardContent>
        </Card>
      ))}
    </section>
  );
}
