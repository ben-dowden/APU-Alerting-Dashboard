import type { UrgencyBucket } from "@/lib/events";
import { compareIsoStrings, minutesBetweenIso } from "@/lib/domain/time";
import type { GroundAircraftState, SourceCharm, CurrentBoardState } from "./current-board";

export type AircraftCardReadModel = {
  tail: string;
  aircraftType?: string;
  bay?: string;
  stand?: string;
  apuState: "on" | "off";
  statusLabel: string;
  urgencyBucket: UrgencyBucket;
  urgencyRank: number;
  groundMinutes: number;
  apuRuntimeMinutes: number;
  estimatedFuelKg: number;
  currentReason?: {
    categoryId: string;
    categoryLabel: string;
    detailId: string;
    detailLabel: string;
    elapsedMinutes: number;
  };
  reviewState: {
    reviewDueAt?: string;
    isReviewDue: boolean;
  };
  manualOffPending: boolean;
  sourceCharms: SourceCharm[];
};

const bucketOrder: UrgencyBucket[] = [
  "missing_reason",
  "review_overdue",
  "active_valid_reason",
  "manual_off_pending",
  "apu_off",
];

const statusLabels: Record<UrgencyBucket, string> = {
  missing_reason: "Reason missing",
  review_overdue: "Review due",
  active_valid_reason: "Current reason",
  manual_off_pending: "Manual off pending",
  apu_off: "APU off",
};

const urgencyBucketFor = (aircraft: GroundAircraftState): UrgencyBucket => {
  if (aircraft.apuState === "off") {
    return "apu_off";
  }

  if (aircraft.manualOffPending) {
    return "manual_off_pending";
  }

  if (!aircraft.reasonChain.currentReason) {
    return "missing_reason";
  }

  if (aircraft.reasonChain.isReviewDue) {
    return "review_overdue";
  }

  return "active_valid_reason";
};

const cardForAircraft = (
  aircraft: GroundAircraftState,
  nowIso: string,
  urgencyRank: number,
): AircraftCardReadModel => {
  const urgencyBucket = urgencyBucketFor(aircraft);
  const currentReason = aircraft.reasonChain.currentReason;

  return {
    tail: aircraft.tail,
    aircraftType: aircraft.aircraftType,
    bay: aircraft.bay,
    stand: aircraft.stand,
    apuState: aircraft.apuState,
    statusLabel: statusLabels[urgencyBucket],
    urgencyBucket,
    urgencyRank,
    groundMinutes: aircraft.groundMinutes,
    apuRuntimeMinutes: aircraft.apuRuntimeMinutes,
    estimatedFuelKg: aircraft.fuelEstimate?.estimatedKg ?? 0,
    currentReason: currentReason
      ? {
          categoryId: currentReason.categoryId,
          categoryLabel: currentReason.categoryLabel,
          detailId: currentReason.detailId,
          detailLabel: currentReason.detailLabel,
          elapsedMinutes: minutesBetweenIso(currentReason.startedAt, nowIso),
        }
      : undefined,
    reviewState: {
      reviewDueAt: aircraft.reasonChain.reviewDueAt,
      isReviewDue: aircraft.reasonChain.isReviewDue,
    },
    manualOffPending: aircraft.manualOffPending,
    sourceCharms: aircraft.sourceCharms,
  };
};

export const deriveAircraftCards = (boardState: CurrentBoardState): AircraftCardReadModel[] =>
  boardState.groundAircraft
    .map((aircraft) => ({
      aircraft,
      urgencyBucket: urgencyBucketFor(aircraft),
    }))
    .sort(
      (left, right) =>
        bucketOrder.indexOf(left.urgencyBucket) - bucketOrder.indexOf(right.urgencyBucket) ||
        right.aircraft.apuRuntimeMinutes - left.aircraft.apuRuntimeMinutes ||
        compareIsoStrings(left.aircraft.tail, right.aircraft.tail),
    )
    .map(({ aircraft }, index) => cardForAircraft(aircraft, boardState.nowIso, index + 1));
