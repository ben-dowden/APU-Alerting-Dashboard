import type { BenchmarkPanel, DailyScorecard } from "@/lib/read-models";
import { Card, CardContent } from "@/components/ui/card";

type ScorecardBenchmarkBandProps = {
  scorecard: DailyScorecard;
  benchmark: BenchmarkPanel;
};

const formatSigned = (value: number) => (value > 0 ? `+${value}` : `${value}`);

export function ScorecardBenchmarkBand({ scorecard, benchmark }: ScorecardBenchmarkBandProps) {
  const metrics = [
    { label: "APU on now", value: `${scorecard.activeApuCount}`, detail: "active aircraft" },
    { label: "Runtime today", value: `${scorecard.runtimeMinutesToday} min`, detail: "event-derived" },
    { label: "Fuel burned today", value: `${scorecard.estimatedFuelKgToday} kg`, detail: "estimated fuel" },
    { label: "Attributed runtime", value: `${scorecard.attributedRuntimePercent}%`, detail: "reason tagged" },
  ];
  const activeComparison = benchmark.activeComparison;

  return (
    <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_360px]">
      <section aria-label="Daily scorecard" className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {metrics.map((metric) => (
          <Card key={metric.label}>
            <CardContent className="p-4">
              <p
                className="text-xs font-semibold uppercase tracking-normal text-neutral-500"
                data-testid="scorecard-label"
              >
                {metric.label}
              </p>
              <p className="mt-2 text-2xl font-semibold tracking-normal text-neutral-950">
                {metric.value}
              </p>
              <p className="mt-1 text-xs font-medium text-neutral-500">{metric.detail}</p>
            </CardContent>
          </Card>
        ))}
      </section>

      <section aria-label="Benchmark comparison">
        <Card className="h-full">
          <CardContent className="flex h-full flex-col gap-3 p-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-normal text-neutral-500">
                Benchmark
              </p>
              <p className="mt-1 text-sm font-semibold text-neutral-950">
                {activeComparison.basisLabel}
              </p>
              {activeComparison.temperatureBandLabel ? (
                <p className="mt-1 text-xs font-semibold text-virgin-purple">
                  {activeComparison.temperatureBandLabel}
                </p>
              ) : null}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-xs font-medium text-neutral-500">Fuel delta</p>
                <p className="mt-1 text-2xl font-semibold text-neutral-950">
                  {formatSigned(activeComparison.fuelDeltaKg)} kg
                </p>
                <p className="text-xs font-medium text-neutral-500">
                  {formatSigned(activeComparison.fuelDeltaPercent)}%
                </p>
              </div>
              <div>
                <p className="text-xs font-medium text-neutral-500">Runtime delta</p>
                <p className="mt-1 text-xl font-semibold text-neutral-800">
                  {formatSigned(activeComparison.runtimeDeltaMinutes)} min
                </p>
                <p className="text-xs font-medium text-neutral-500">
                  {formatSigned(activeComparison.runtimeDeltaPercent)}%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
