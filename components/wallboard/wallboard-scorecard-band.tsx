import {
  scorecardMetricTilesFor,
  type ScorecardMetricTile,
} from "@/components/scorecard/scorecard-metrics";
import { ScorecardSparkline } from "@/components/scorecard/scorecard-sparkline";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  deriveBenchmarkPanel,
  type BenchmarkBaselines,
  type BenchmarkCurrent,
  type BenchmarkMode,
  type DailyScorecard,
  type ScorecardTrendPoint,
} from "@/lib/read-models";

type WallboardScorecardBandProps = {
  activeBenchmarkMode: BenchmarkMode;
  benchmarkBaselines: BenchmarkBaselines;
  benchmarkCurrent: BenchmarkCurrent;
  scorecard: DailyScorecard;
  trend: ScorecardTrendPoint[];
};

const isIntensityMetric = (metric: ScorecardMetricTile) => metric.key === "apu_intensity";

export function WallboardScorecardBand({
  activeBenchmarkMode,
  benchmarkBaselines,
  benchmarkCurrent,
  scorecard,
  trend,
}: WallboardScorecardBandProps) {
  const benchmark = deriveBenchmarkPanel(
    benchmarkCurrent,
    activeBenchmarkMode,
    benchmarkBaselines,
  );
  const metrics = scorecardMetricTilesFor(scorecard, benchmark.activeComparison, trend);

  return (
    <section aria-label="Wallboard scorecard" className="grid grid-cols-4 gap-3 px-6 py-4">
      {metrics.map((metric) => (
        <Card className="overflow-hidden shadow-none" key={metric.key}>
          <CardHeader className="flex flex-row items-start justify-between gap-3 p-4 pb-0">
            <CardTitle
              className="text-sm font-semibold leading-none tracking-normal text-neutral-500"
              data-testid="wallboard-scorecard-label"
            >
              {metric.label}
            </CardTitle>
            {metric.badgeLabel ? (
              <Badge
                aria-live={isIntensityMetric(metric) ? "polite" : undefined}
                className="shrink-0"
                variant={metric.badgeVariant}
              >
                {metric.badgeLabel}
              </Badge>
            ) : null}
          </CardHeader>
          <CardContent className="grid grid-cols-[minmax(0,1fr)_112px] items-end gap-3 p-4 pt-3">
            <div className="min-w-0">
              <p className="text-3xl font-semibold tracking-normal tabular-nums text-neutral-950">
                {metric.value}
              </p>
              <p className="mt-1 text-sm font-medium text-neutral-500">{metric.detail}</p>
            </div>
            <ScorecardSparkline
              className="h-12"
              label={metric.trendLabel}
              values={metric.trendValues}
            />
          </CardContent>
        </Card>
      ))}
    </section>
  );
}
