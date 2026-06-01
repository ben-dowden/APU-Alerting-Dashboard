import { Badge } from "@/components/ui/badge";
import {
  deriveBenchmarkPanel,
  type BenchmarkBaselines,
  type BenchmarkComparison,
  type BenchmarkCurrent,
  type BenchmarkMode,
  type DailyScorecard,
} from "@/lib/read-models";
import { wallboardBenchmarkRotationIntervalMs } from "./wallboard-rotation";
import { WallboardTimerWheel } from "./wallboard-timer-wheel";

type WallboardScorecardBandProps = {
  activeBenchmarkMode: BenchmarkMode;
  benchmarkBaselines: BenchmarkBaselines;
  benchmarkCurrent: BenchmarkCurrent;
  benchmarkRemainingMs: number;
  scorecard: DailyScorecard;
};

type ScorecardMetric = {
  label: string;
  value: string;
  detail: string;
};

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
  activeBenchmarkMode,
  benchmarkBaselines,
  benchmarkCurrent,
  benchmarkRemainingMs,
  scorecard,
}: WallboardScorecardBandProps) {
  const benchmark = deriveBenchmarkPanel(
    benchmarkCurrent,
    activeBenchmarkMode,
    benchmarkBaselines,
  );
  const metrics = scorecardMetricsFor(scorecard);

  return (
    <div className="grid gap-3 px-6 py-4 xl:grid-cols-[minmax(0,1fr)_360px]">
      <ScorecardMetrics metrics={metrics} />
      <BenchmarkRotationPanel
        activeComparison={benchmark.activeComparison}
        remainingMs={benchmarkRemainingMs}
      />
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

function BenchmarkRotationPanel({
  activeComparison,
  remainingMs,
}: {
  activeComparison: BenchmarkComparison;
  remainingMs: number;
}) {
  const title =
    activeComparison.mode === "similar_temperature"
      ? "Similar temp. days:"
      : activeComparison.basisLabel;

  return (
    <section
      aria-label="Wallboard benchmark rotation"
      aria-live="polite"
      className="rounded-product border border-neutral-200 bg-white p-3"
      data-rotation-interval-ms={wallboardBenchmarkRotationIntervalMs}
      data-testid="wallboard-benchmark-rotator"
    >
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-semibold uppercase tracking-normal text-neutral-500">
          Benchmark
        </p>
        <WallboardTimerWheel
          intervalMs={wallboardBenchmarkRotationIntervalMs}
          label="Benchmark rotates"
          remainingMs={remainingMs}
        />
      </div>
      <div className="mt-2 flex min-w-0 items-center gap-2">
        <p className="min-w-0 truncate text-xl font-semibold tracking-normal text-neutral-950">
          {title}
        </p>
        {activeComparison.temperatureBandLabel ? (
          <Badge
            className="shrink-0 px-2 py-0.5 text-sm leading-5 text-virgin-purple"
            variant="secondary"
          >
            {activeComparison.temperatureBandLabel}
          </Badge>
        ) : null}
      </div>
      <div className="mt-2 grid grid-cols-2 gap-3">
        <div>
          <p className="text-sm font-medium text-neutral-500">Fuel delta</p>
          <p className="mt-0.5 text-2xl font-semibold text-neutral-950">
            {formatSigned(activeComparison.fuelDeltaKg)} kg
          </p>
          <p className="text-sm font-medium text-neutral-500">
            {formatSigned(activeComparison.fuelDeltaPercent)}%
          </p>
        </div>
        <div>
          <p className="text-sm font-medium text-neutral-500">Runtime delta</p>
          <p className="mt-0.5 text-2xl font-semibold text-neutral-950">
            {formatSigned(activeComparison.runtimeDeltaMinutes)} min
          </p>
          <p className="text-sm font-medium text-neutral-500">
            {formatSigned(activeComparison.runtimeDeltaPercent)}%
          </p>
        </div>
      </div>
    </section>
  );
}
