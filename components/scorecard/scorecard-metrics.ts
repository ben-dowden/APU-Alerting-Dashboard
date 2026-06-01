import type { BadgeProps } from "@/components/ui/badge";
import type {
  BenchmarkComparison,
  DailyScorecard,
  ScorecardTrendPoint,
} from "@/lib/read-models";

export type ScorecardMetricKey =
  | "active_now"
  | "long_runners"
  | "unexplained_apu_runtime"
  | "apu_intensity";

type BadgeVariant = NonNullable<BadgeProps["variant"]>;

export type ScorecardMetricTile = {
  key: ScorecardMetricKey;
  label: string;
  value: string;
  detail: string;
  badgeLabel?: string;
  badgeVariant: BadgeVariant;
  trendLabel: string;
  trendValues: number[];
};

const formatWholePercent = (value: number) => `${Math.round(value)}%`;

const formatFlightsNeedReview = (count: number) =>
  `${count} ${count === 1 ? "flight" : "flights"} need review`;

const intensityBadgeVariantFor = (
  activeComparison: BenchmarkComparison,
): BadgeVariant => {
  if (activeComparison.apuIntensityDeltaPoints === undefined) {
    return "secondary";
  }

  return activeComparison.apuIntensityDeltaPoints > 0 ? "red" : "neutral";
};

export const scorecardMetricTilesFor = (
  scorecard: DailyScorecard,
  activeComparison: BenchmarkComparison,
  trend: readonly ScorecardTrendPoint[],
): ScorecardMetricTile[] => [
  {
    key: "active_now",
    label: "ACTIVE NOW",
    value: `${scorecard.activeApuCount} APU-on`,
    detail: `of ${scorecard.groundAircraftCount} aircraft on ground`,
    badgeVariant: "neutral",
    trendLabel: "Active APU count over the last 6 hours",
    trendValues: trend.map((point) => point.activeApuCount),
  },
  {
    key: "long_runners",
    label: "LONG RUNNERS",
    value: `${scorecard.longRunnerCount} aircraft`,
    detail: `Over ${scorecard.longRunnerThresholdMinutes} min APU runtime`,
    badgeLabel: formatFlightsNeedReview(scorecard.longRunnerCount),
    badgeVariant: "red",
    trendLabel: "Long-runner count over the last 6 hours",
    trendValues: trend.map((point) => point.longRunnerCount),
  },
  {
    key: "unexplained_apu_runtime",
    label: "UNEXPLAINED APU RUNTIME",
    value: `${scorecard.untaggedRuntimeMinutes} min`,
    detail: "Untagged runtime today",
    badgeLabel: `${scorecard.untaggedRuntimePercent}% of runtime`,
    badgeVariant: "secondary",
    trendLabel: "Unexplained APU runtime percent over the last 6 hours",
    trendValues: trend.map((point) => point.untaggedRuntimePercent),
  },
  {
    key: "apu_intensity",
    label: "APU INTENSITY",
    value: formatWholePercent(scorecard.apuIntensityPercent),
    detail: "Ground time with APU-on today",
    badgeLabel: activeComparison.apuIntensityComparisonLabel,
    badgeVariant: intensityBadgeVariantFor(activeComparison),
    trendLabel: "APU intensity over the last 6 hours",
    trendValues: trend.map((point) => point.apuIntensityPercent),
  },
];
