import type { DerivedApuEvent } from "@/lib/domain/apu-reducer";
import { estimateFuelKgForEquipment } from "@/lib/domain/fuel";
import { matchesApuEventId, normalizeTail } from "@/lib/domain/ids";
import { deriveReasonChain, type ReasonChainState } from "@/lib/domain/reason-chain-reducer";
import { minutesBetweenIso } from "@/lib/domain/time";
import type {
  ApuStateEvent,
  DomainEvent,
  FlightStateEvent,
  ManualApuOffObservedEvent,
  SourceEvent,
  StandAssignmentEvent,
} from "@/lib/events";

import type { BoardEventContext } from "./current-board-context";
import type { CurrentBoardSettings, GroundAircraftState, SourceCharm } from "./current-board-types";

const sourceCharm = (event: SourceEvent): SourceCharm => ({
  sourceSystem: event.sourceSystem,
  sourceEventId: event.sourceEventId,
  confidence: event.quality.confidence,
  receivedAt: event.receivedAt,
  isStale: event.quality.isStale,
  isPlanned: event.quality.isPlanned,
  sourceLatencyMinutes: event.quality.sourceLatencyMinutes,
});

const sourceCharmsFor = (
  flight: FlightStateEvent,
  stand: StandAssignmentEvent | undefined,
  apuState: ApuStateEvent | undefined,
) =>
  [flight, stand, apuState]
    .filter((event): event is FlightStateEvent | StandAssignmentEvent | ApuStateEvent =>
      Boolean(event),
    )
    .map(sourceCharm);

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
) =>
  Boolean(
    apuEvent?.state === "open" &&
      manualOffEvents.some((event) => matchesApuEventId(event.payload.apuEventId, apuEvent)),
  );

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

const compactStrings = (values: Array<string | undefined>) =>
  values.filter((value): value is string => Boolean(value));

const sourceEventIdsFor = (
  flight: FlightStateEvent,
  stand: StandAssignmentEvent | undefined,
  apuEvent: DerivedApuEvent | undefined,
) => compactStrings([flight.eventId, stand?.eventId, ...(apuEvent?.sourceEventIds ?? [])]);

export const createGroundAircraftState = (
  flight: FlightStateEvent,
  context: BoardEventContext,
  settings: CurrentBoardSettings,
  nowIso: string,
): GroundAircraftState => {
  const tail = normalizeTail(flight.payload.tail);
  const stand = context.latestStandByTail.get(tail);
  const apuEvent = context.apuEventsByTail.get(tail);
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
    manualOffPending: isManualOffPending(apuEvent, context.manualOffEvents),
    groundMinutes: minutesBetweenIso(flight.payload.onGroundAt ?? flight.occurredAt, nowIso),
    apuRuntimeMinutes,
    fuelEstimate: fuelEstimateFor(apuRuntimeMinutes, apuEvent, flight, settings),
    sourceCharms: sourceCharmsFor(flight, stand, context.latestApuStateByTail.get(tail)),
    sourceEventIds: sourceEventIdsFor(flight, stand, apuEvent),
  };
};
