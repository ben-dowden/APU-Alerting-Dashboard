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
