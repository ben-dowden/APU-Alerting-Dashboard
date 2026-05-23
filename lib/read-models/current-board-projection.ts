import type { DerivedApuEvent } from "@/lib/domain/apu-reducer";
import { estimateFuelKgForEquipment } from "@/lib/domain/fuel";
import { matchesApuEventId, normalizeTail } from "@/lib/domain/ids";
import { deriveReasonChain, type ReasonChainState } from "@/lib/domain/reason-chain-reducer";
import { compareIsoStrings, minutesBetweenIso } from "@/lib/domain/time";
import type {
  ApuStateEvent,
  DomainEvent,
  FlightStateEvent,
  ManualApuOffObservedEvent,
  StandAssignmentEvent,
} from "@/lib/events";

import type { BoardEventContext } from "./current-board-context";
import type { CurrentBoardSettings, GroundAircraftState } from "./current-board-types";
import { sourceCharmsForAircraft, sourceEventIdsForAircraft } from "./ground-aircraft-sources";

const emptyReasonChain = (): ReasonChainState => ({
  segments: [],
  currentReason: undefined,
  reviewDueAt: undefined,
  isReviewDue: false,
  reviewResponseTelemetry: [],
  isLocked: false,
});

const isManualOffPending = (
  apuEvent: DerivedApuEvent | undefined,
  manualOffEvents: ManualApuOffObservedEvent[],
  latestApuState: ApuStateEvent | undefined,
) => {
  if (apuEvent?.state !== "open") {
    return false;
  }

  const latestManualOff = manualOffEvents
    .filter((event) => matchesApuEventId(event.payload.apuEventId, apuEvent))
    .at(-1);

  if (!latestManualOff) {
    return false;
  }

  const trustedRunningAfterManualOff =
    latestApuState?.payload.state === "on" &&
    compareIsoStrings(latestApuState.occurredAt, latestManualOff.payload.observedAt) > 0;

  return !trustedRunningAfterManualOff;
};

const reasonChainFor = (
  apuEvent: DerivedApuEvent | undefined,
  domainEvents: DomainEvent[],
  settings: CurrentBoardSettings,
  nowIso: string,
) =>
  apuEvent
    ? deriveReasonChain(apuEvent, domainEvents, settings.reasonTaxonomy, nowIso)
    : emptyReasonChain();

const fuelEstimateFor = (
  apuRuntimeMinutes: number,
  apuEvent: DerivedApuEvent | undefined,
  flight: FlightStateEvent,
  settings: CurrentBoardSettings,
) =>
  apuEvent && apuRuntimeMinutes > 0
    ? estimateFuelKgForEquipment(
        apuRuntimeMinutes,
        flight.payload.aircraftType,
        settings.fuelBurnAssumptions,
      )
    : undefined;

export const createGroundAircraftState = (
  flight: FlightStateEvent,
  context: BoardEventContext,
  settings: CurrentBoardSettings,
  nowIso: string,
): GroundAircraftState => {
  const tail = normalizeTail(flight.payload.tail);
  const stand = context.latestStandByTail.get(tail);
  const apuEvent = context.apuEventsByTail.get(tail);
  const latestApuState = context.latestApuStateByTail.get(tail);
  const reasonChain = reasonChainFor(apuEvent, context.domainEvents, settings, nowIso);
  const apuRuntimeMinutes = apuEvent
    ? minutesBetweenIso(apuEvent.startedAt, apuEvent.endedAt ?? nowIso)
    : 0;

  return {
    tail,
    port: flight.payload.port,
    aircraftType: flight.payload.aircraftType,
    flightNumber: flight.payload.flightNumber,
    gateState: flight.payload.gateState,
    onGroundAt: flight.payload.onGroundAt ?? flight.occurredAt,
    bay: stand?.payload.bay,
    stand: stand?.payload.stand,
    standAssignmentState: stand?.payload.assignmentState,
    apuState: apuEvent?.state === "open" ? "on" : "off",
    apuEvent,
    reasonChain,
    manualOffPending: isManualOffPending(apuEvent, context.manualOffEvents, latestApuState),
    groundMinutes: minutesBetweenIso(flight.payload.onGroundAt ?? flight.occurredAt, nowIso),
    apuRuntimeMinutes,
    fuelEstimate: fuelEstimateFor(apuRuntimeMinutes, apuEvent, flight, settings),
    sourceCharms: sourceCharmsForAircraft(flight, stand, latestApuState),
    sourceEventIds: sourceEventIdsForAircraft(flight, stand, apuEvent),
  };
};
