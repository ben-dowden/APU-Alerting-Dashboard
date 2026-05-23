import type { UrgencyBucket } from "@/lib/events";
import { compareIsoStrings, minutesBetweenIso } from "./time";

export type UrgencyTiebreakerBreakdown = {
  overdueMinutes: number;
  runtimeMinutes: number;
  estimatedFuelKg: number;
  proximityCount: number;
  groundMinutes: number;
  sourceStalenessMinutes: number;
};

export type UrgencyTiebreakerWeights = UrgencyTiebreakerBreakdown;

export type RankableAircraftCard = {
  tail: string;
  urgencyBucket: UrgencyBucket;
  reviewState: {
    reviewDueAt?: string;
    isReviewDue: boolean;
  };
  groundMinutes: number;
  apuRuntimeMinutes: number;
  estimatedFuelKg: number;
  proximity?: {
    nearbyApuAircraft?: readonly unknown[];
  };
  sourceCharms?: readonly {
    isStale?: boolean;
    sourceLatencyMinutes?: number;
  }[];
};

export type RankedUrgencyFields = {
  urgencyRank: number;
  urgencyScore: number;
  urgencyReason: string;
  urgencyTiebreakerBreakdown: UrgencyTiebreakerBreakdown;
};

export type UrgencyRankingSettings = {
  nowIso: string;
  bucketOrder?: readonly UrgencyBucket[];
  tiebreakerWeights?: Partial<UrgencyTiebreakerWeights>;
};

const defaultBucketOrder: UrgencyBucket[] = [
  "missing_reason",
  "review_overdue",
  "active_valid_reason",
  "manual_off_pending",
  "apu_off",
];

const defaultWeights: UrgencyTiebreakerWeights = {
  overdueMinutes: 4,
  runtimeMinutes: 1,
  estimatedFuelKg: 0.25,
  proximityCount: 15,
  groundMinutes: 0.1,
  sourceStalenessMinutes: 0.5,
};

const tiebreakerKeys: Array<keyof UrgencyTiebreakerBreakdown> = [
  "overdueMinutes",
  "runtimeMinutes",
  "estimatedFuelKg",
  "proximityCount",
  "groundMinutes",
  "sourceStalenessMinutes",
];

const urgencyReasonLabels: Record<UrgencyBucket, string> = {
  missing_reason: "Missing reason",
  review_overdue: "Review overdue",
  active_valid_reason: "APU running with reason",
  manual_off_pending: "Manual off pending",
  apu_off: "APU off",
};

const settingsWithDefaults = (settings: UrgencyRankingSettings) => ({
  bucketOrder: settings.bucketOrder ?? defaultBucketOrder,
  weights: {
    ...defaultWeights,
    ...settings.tiebreakerWeights,
  },
});

const bucketPriority = (bucket: UrgencyBucket, bucketOrder: readonly UrgencyBucket[]) => {
  const priority = bucketOrder.indexOf(bucket);

  return priority === -1 ? bucketOrder.length : priority;
};

const overdueMinutesFor = (card: RankableAircraftCard, nowIso: string) =>
  card.reviewState.isReviewDue && card.reviewState.reviewDueAt
    ? minutesBetweenIso(card.reviewState.reviewDueAt, nowIso)
    : 0;

const sourceStalenessMinutesFor = (card: RankableAircraftCard) =>
  Math.max(
    0,
    ...(card.sourceCharms ?? []).map((charm) =>
      charm.sourceLatencyMinutes ?? (charm.isStale ? 1 : 0),
    ),
  );

const breakdownFor = (
  card: RankableAircraftCard,
  nowIso: string,
): UrgencyTiebreakerBreakdown => ({
  overdueMinutes: overdueMinutesFor(card, nowIso),
  runtimeMinutes: card.apuRuntimeMinutes,
  estimatedFuelKg: card.estimatedFuelKg,
  proximityCount: card.proximity?.nearbyApuAircraft?.length ?? 0,
  groundMinutes: card.groundMinutes,
  sourceStalenessMinutes: sourceStalenessMinutesFor(card),
});

const weightedScore = (
  breakdown: UrgencyTiebreakerBreakdown,
  weights: UrgencyTiebreakerWeights,
) => {
  const score = tiebreakerKeys.reduce(
    (total, key) => total + breakdown[key] * weights[key],
    0,
  );

  return Math.round(score * 10) / 10;
};

const compareWeightedBreakdown = (
  left: UrgencyTiebreakerBreakdown,
  right: UrgencyTiebreakerBreakdown,
  weights: UrgencyTiebreakerWeights,
) => {
  for (const key of tiebreakerKeys) {
    if (weights[key] === 0) {
      continue;
    }

    const difference = right[key] - left[key];

    if (difference !== 0) {
      return difference;
    }
  }

  return 0;
};

export const rankAircraftCards = <TCard extends RankableAircraftCard>(
  cards: readonly TCard[],
  settings: UrgencyRankingSettings,
): Array<TCard & RankedUrgencyFields> => {
  const { bucketOrder, weights } = settingsWithDefaults(settings);
  const scored = cards.map((card) => {
    const urgencyTiebreakerBreakdown = breakdownFor(card, settings.nowIso);

    return {
      ...card,
      urgencyRank: 0,
      urgencyScore: weightedScore(urgencyTiebreakerBreakdown, weights),
      urgencyReason: urgencyReasonLabels[card.urgencyBucket],
      urgencyTiebreakerBreakdown,
    };
  });

  return scored
    .sort(
      (left, right) =>
        bucketPriority(left.urgencyBucket, bucketOrder) -
          bucketPriority(right.urgencyBucket, bucketOrder) ||
        right.urgencyScore - left.urgencyScore ||
        compareWeightedBreakdown(
          left.urgencyTiebreakerBreakdown,
          right.urgencyTiebreakerBreakdown,
          weights,
        ) ||
        compareIsoStrings(left.tail, right.tail),
    )
    .map((card, index) => ({
      ...card,
      urgencyRank: index + 1,
    }));
};
