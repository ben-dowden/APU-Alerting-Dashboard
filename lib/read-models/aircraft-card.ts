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

type UrgencyPolicy = {
  bucket: UrgencyBucket;
  statusLabel: string;
  matches: (aircraft: GroundAircraftState) => boolean;
};

const urgencyPolicies: UrgencyPolicy[] = [
  {
    bucket: "missing_reason",
    statusLabel: "Reason missing",
    matches: (aircraft) =>
      aircraft.apuState === "on" &&
      !aircraft.manualOffPending &&
      !aircraft.reasonChain.currentReason,
  },
  {
    bucket: "review_overdue",
    statusLabel: "Review due",
    matches: (aircraft) =>
      aircraft.apuState === "on" &&
      !aircraft.manualOffPending &&
      aircraft.reasonChain.isReviewDue,
  },
  {
    bucket: "active_valid_reason",
    statusLabel: "Current reason",
    matches: (aircraft) => aircraft.apuState === "on" && !aircraft.manualOffPending,
  },
  {
    bucket: "manual_off_pending",
    statusLabel: "Manual off pending",
    matches: (aircraft) => aircraft.apuState === "on" && aircraft.manualOffPending,
  },
  {
    bucket: "apu_off",
    statusLabel: "APU off",
    matches: (aircraft) => aircraft.apuState === "off",
  },
];

const urgencyPolicyFor = (aircraft: GroundAircraftState) =>
  urgencyPolicies.find((policy) => policy.matches(aircraft)) ??
  urgencyPolicies[urgencyPolicies.length - 1];

const urgencyBucketFor = (aircraft: GroundAircraftState): UrgencyBucket =>
  urgencyPolicyFor(aircraft).bucket;

const urgencyPriority = (bucket: UrgencyBucket) =>
  urgencyPolicies.findIndex((policy) => policy.bucket === bucket);

const cardForAircraft = (
  aircraft: GroundAircraftState,
  nowIso: string,
  urgencyRank: number,
): AircraftCardReadModel => {
  const urgencyPolicy = urgencyPolicyFor(aircraft);
  const currentReason = aircraft.reasonChain.currentReason;

  return {
    tail: aircraft.tail,
    aircraftType: aircraft.aircraftType,
    bay: aircraft.bay,
    stand: aircraft.stand,
    apuState: aircraft.apuState,
    statusLabel: urgencyPolicy.statusLabel,
    urgencyBucket: urgencyPolicy.bucket,
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
        urgencyPriority(left.urgencyBucket) - urgencyPriority(right.urgencyBucket) ||
        right.aircraft.apuRuntimeMinutes - left.aircraft.apuRuntimeMinutes ||
        compareIsoStrings(left.aircraft.tail, right.aircraft.tail),
    )
    .map(({ aircraft }, index) => cardForAircraft(aircraft, boardState.nowIso, index + 1));
