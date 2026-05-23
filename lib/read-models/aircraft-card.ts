import type { UrgencyBucket } from "@/lib/events";
import {
  rankAircraftCards,
  type UrgencyTiebreakerBreakdown,
} from "@/lib/domain/urgency-ranking";
import {
  calculateAircraftProximityContext,
  type AircraftProximityContext,
  type AircraftStandPosition,
} from "@/lib/domain/proximity";
import { minutesBetweenIso } from "@/lib/domain/time";
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
  urgencyScore: number;
  urgencyReason: string;
  urgencyTiebreakerBreakdown: UrgencyTiebreakerBreakdown;
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
  proximity: AircraftProximityContext;
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

const emptyProximityContext = (): AircraftProximityContext => ({
  nearbyApuAircraft: [],
});

const standPositionForAircraft = (
  aircraft: GroundAircraftState,
): AircraftStandPosition | undefined =>
  aircraft.stand
    ? {
        tail: aircraft.tail,
        stand: aircraft.stand,
        bay: aircraft.bay,
        apuState: aircraft.apuState,
      }
    : undefined;

const proximityContextFor = (
  aircraft: GroundAircraftState,
  positions: readonly AircraftStandPosition[],
  boardState: CurrentBoardState,
) => {
  const target = standPositionForAircraft(aircraft);

  return target && boardState.standCoordinates
    ? calculateAircraftProximityContext(target, positions, boardState.standCoordinates)
    : emptyProximityContext();
};

const cardForAircraft = (
  aircraft: GroundAircraftState,
  nowIso: string,
  proximity: AircraftProximityContext,
): Omit<
  AircraftCardReadModel,
  "urgencyRank" | "urgencyScore" | "urgencyReason" | "urgencyTiebreakerBreakdown"
> => {
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
    proximity,
    sourceCharms: aircraft.sourceCharms,
  };
};

export const deriveAircraftCards = (boardState: CurrentBoardState): AircraftCardReadModel[] => {
  const standPositions = boardState.groundAircraft
    .map(standPositionForAircraft)
    .filter((position): position is AircraftStandPosition => Boolean(position));

  return rankAircraftCards(
    boardState.groundAircraft.map((aircraft) =>
      cardForAircraft(
        aircraft,
        boardState.nowIso,
        proximityContextFor(aircraft, standPositions, boardState),
      ),
    ),
    { nowIso: boardState.nowIso },
  );
};
