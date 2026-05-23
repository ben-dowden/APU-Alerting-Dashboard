"use client";

import { useEffect, useState } from "react";

import {
  deriveBenchmarkPanel,
  type BenchmarkBaselines,
  type BenchmarkComparison,
  type BenchmarkCurrent,
  type BenchmarkMode,
  type DailyScorecard,
} from "@/lib/read-models";

type WallboardScorecardBandProps = {
  benchmarkBaselines: BenchmarkBaselines;
  benchmarkCurrent: BenchmarkCurrent;
  scorecard: DailyScorecard;
};

type ScorecardMetric = {
  label: string;
  value: string;
  detail: string;
};

const benchmarkModes: BenchmarkMode[] = [
  "similar_temperature",
  "weekly_average",
  "monthly_average",
  "annual_average",
];

const rotationIntervalMs = 5000;

const formatSigned = (value: number) => (value > 0 ? `+${value}` : `${value}`);

const scorecardMetricsFor = (scorecard: DailyScorecard): ScorecardMetric[] => [
  { label: "APU on now", value: `${scorecard.activeApuCount}`, detail: "active aircraft" },
  {
    label: "Runtime today",
    value: `${scorecard.runtimeMinutesToday} min`,
    detail: "event-derived",
  },
  { label: "Fuel today", value: `${scorecard.estimatedFuelKgToday} kg`, detail: "estimated fuel" },
  {
    label: "Reason coverage",
    value: `${scorecard.attributedRuntimePercent}%`,
    detail: "runtime tagged",
  },
];

export function WallboardScorecardBand({
  benchmarkBaselines,
  benchmarkCurrent,
  scorecard,
}: WallboardScorecardBandProps) {
  const [activeBenchmarkIndex, setActiveBenchmarkIndex] = useState(0);
  const activeMode = benchmarkModes[activeBenchmarkIndex];
  const benchmark = deriveBenchmarkPanel(benchmarkCurrent, activeMode, benchmarkBaselines);
  const metrics = scorecardMetricsFor(scorecard);

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setActiveBenchmarkIndex((currentIndex) => (currentIndex + 1) % benchmarkModes.length);
    }, rotationIntervalMs);

    return () => window.clearInterval(intervalId);
  }, []);

  return (
    <div className="grid gap-3 px-6 py-4 xl:grid-cols-[minmax(0,1fr)_360px]">
      <ScorecardMetrics metrics={metrics} />
      <BenchmarkRotationPanel activeComparison={benchmark.activeComparison} />
    </div>
  );
}

function ScorecardMetrics({ metrics }: { metrics: ScorecardMetric[] }) {
  return (
    <section aria-label="Wallboard scorecard" className="grid grid-cols-4 gap-3">
      {metrics.map((metric) => (
        <div className="rounded-product border border-neutral-200 bg-white p-4" key={metric.label}>
          <p
            className="text-sm font-semibold uppercase tracking-normal text-neutral-500"
            data-testid="wallboard-scorecard-label"
          >
            {metric.label}
          </p>
          <p className="mt-2 text-3xl font-semibold tracking-normal text-neutral-950">
            {metric.value}
          </p>
          <p className="mt-1 text-sm font-medium text-neutral-500">{metric.detail}</p>
        </div>
      ))}
    </section>
  );
}

function BenchmarkRotationPanel({ activeComparison }: { activeComparison: BenchmarkComparison }) {
  return (
    <section
      aria-label="Wallboard benchmark rotation"
      aria-live="polite"
      className="rounded-product border border-neutral-200 bg-white p-4"
      data-rotation-interval-ms={rotationIntervalMs}
      data-testid="wallboard-benchmark-rotator"
    >
      <p className="text-sm font-semibold uppercase tracking-normal text-neutral-500">
        Benchmark
      </p>
      <p className="mt-2 text-2xl font-semibold tracking-normal text-neutral-950">
        {activeComparison.basisLabel}
      </p>
      <div className="mt-3 grid grid-cols-2 gap-3">
        <div>
          <p className="text-sm font-medium text-neutral-500">Fuel delta</p>
          <p className="mt-1 text-2xl font-semibold text-neutral-950">
            {formatSigned(activeComparison.fuelDeltaKg)} kg
          </p>
          <p className="text-sm font-medium text-neutral-500">
            {formatSigned(activeComparison.fuelDeltaPercent)}%
          </p>
        </div>
        <div>
          <p className="text-sm font-medium text-neutral-500">Runtime delta</p>
          <p className="mt-1 text-2xl font-semibold text-neutral-950">
            {formatSigned(activeComparison.runtimeDeltaMinutes)} min
          </p>
          <p className="text-sm font-medium text-neutral-500">
            {formatSigned(activeComparison.runtimeDeltaPercent)}%
          </p>
        </div>
      </div>
      {activeComparison.temperatureBandLabel ? (
        <p className="mt-2 text-sm font-semibold text-virgin-purple">
          {activeComparison.temperatureBandLabel}
        </p>
      ) : null}
    </section>
  );
}
