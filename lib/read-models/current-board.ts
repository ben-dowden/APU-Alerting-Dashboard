import type {
  ApuStateEvent,
  DomainEvent,
  FlightStateEvent,
  ManualApuOffObservedEvent,
  ReasonTaxonomySnapshot,
  SourceEvent,
  StandAssignmentEvent,
  WeatherObservationEvent,
} from "@/lib/events";
import { isApuStateEvent, isDomainEvent, isSourceEvent } from "@/lib/events";
import type { FuelBurnSettingsInput, FuelEstimate } from "@/lib/domain/fuel";
import { estimateFuelKgForEquipment } from "@/lib/domain/fuel";
import { deriveApuEvents, type DerivedApuEvent } from "@/lib/domain/apu-reducer";
import { deriveReasonChain, type ReasonChainState } from "@/lib/domain/reason-chain-reducer";

export type SourceCharm = {
  sourceSystem: string;
  sourceEventId: string;
  confidence: "high" | "medium" | "low";
  receivedAt: string;
  isStale?: boolean;
  isPlanned?: boolean;
  sourceLatencyMinutes?: number;
};

export type CurrentBoardSettings = {
  reasonTaxonomy: ReasonTaxonomySnapshot;
  fuelBurnAssumptions: FuelBurnSettingsInput;
};

export type GroundAircraftState = {
  tail: string;
  port: string;
  aircraftType?: string;
  flightNumber: string;
  gateState: FlightStateEvent["payload"]["gateState"];
  onGroundAt: string;
  bay?: string;
  stand?: string;
  standAssignmentState?: StandAssignmentEvent["payload"]["assignmentState"];
  apuState: "on" | "off";
  apuEvent?: DerivedApuEvent;
  reasonChain: ReasonChainState;
  manualOffPending: boolean;
  groundMinutes: number;
  apuRuntimeMinutes: number;
  fuelEstimate?: FuelEstimate;
  sourceCharms: SourceCharm[];
  sourceEventIds: string[];
};

export type CurrentBoardState = {
  port: string;
  nowIso: string;
  weather?: WeatherObservationEvent["payload"];
  groundAircraft: GroundAircraftState[];
};

const minutesBetween = (startIso: string, endIso: string) =>
  Math.max(0, Math.floor((new Date(endIso).getTime() - new Date(startIso).getTime()) / 60_000));

const byEventTime = <TEvent extends { occurredAt: string; receivedAt: string; eventId: string }>(
  left: TEvent,
  right: TEvent,
) =>
  left.occurredAt.localeCompare(right.occurredAt) ||
  left.receivedAt.localeCompare(right.receivedAt) ||
  left.eventId.localeCompare(right.eventId);

const latestByTail = <TEvent extends { payload: { tail: string }; occurredAt: string; receivedAt: string; eventId: string }>(
  events: TEvent[],
) => {
  const latest = new Map<string, TEvent>();

  for (const event of events.sort(byEventTime)) {
    latest.set(event.payload.tail.trim().toUpperCase(), event);
  }

  return latest;
};

const isFlightStateEvent = (event: SourceEvent): event is FlightStateEvent =>
  event.eventType === "flight_state_event";

const isStandAssignmentEvent = (event: SourceEvent): event is StandAssignmentEvent =>
  event.eventType === "stand_assignment_event";

const isWeatherObservationEvent = (event: SourceEvent): event is WeatherObservationEvent =>
  event.eventType === "weather_observation_event";

const isManualApuOffObservedEvent = (event: DomainEvent): event is ManualApuOffObservedEvent =>
  event.eventType === "manual_apu_off_observed";

const isAircraftStillOnGround = (event: FlightStateEvent, nowIso: string) =>
  Boolean(event.payload.onGroundAt) &&
  (event.payload.gateState !== "departed" || Boolean(event.payload.offGroundAt && event.payload.offGroundAt > nowIso));

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
) => [flight, stand, apuState].filter((event): event is SourceEvent => Boolean(event)).map(sourceCharm);

const matchesApuEvent = (event: ManualApuOffObservedEvent, apuEvent: DerivedApuEvent) => {
  const legacyFixtureId = `apu:${apuEvent.tail}:${apuEvent.startedAt}`;
  return event.payload.apuEventId === apuEvent.apuEventId || event.payload.apuEventId === legacyFixtureId;
};

export const deriveCurrentBoard = (
  events: readonly unknown[],
  settings: CurrentBoardSettings,
  nowIso: string,
): CurrentBoardState => {
  const replayableEvents = events.filter(
    (event): event is SourceEvent | DomainEvent =>
      (isSourceEvent(event) || isDomainEvent(event)) && event.occurredAt <= nowIso,
  );
  const sourceEvents = replayableEvents.filter(isSourceEvent);
  const domainEvents = replayableEvents.filter(isDomainEvent);

  const flightStates = sourceEvents.filter(isFlightStateEvent);
  const standAssignments = sourceEvents.filter(isStandAssignmentEvent);
  const apuStateEvents = sourceEvents.filter(isApuStateEvent);
  const latestFlightStateByTail = latestByTail(flightStates);
  const latestStandByTail = latestByTail(standAssignments);
  const latestApuStateByTail = latestByTail(apuStateEvents);
  const apuEventsByTail = new Map(
    deriveApuEvents(sourceEvents).map((event) => [event.tail, event] as const),
  );

  const weather = sourceEvents.filter(isWeatherObservationEvent).sort(byEventTime).at(-1)?.payload;
  const manualOffEvents = domainEvents.filter(isManualApuOffObservedEvent).sort(byEventTime);

  const groundAircraft = [...latestFlightStateByTail.values()]
    .filter((event) => event.payload.port === "BNE")
    .filter((event) => isAircraftStillOnGround(event, nowIso))
    .map((flight): GroundAircraftState => {
      const tail = flight.payload.tail.trim().toUpperCase();
      const stand = latestStandByTail.get(tail);
      const apuEvent = apuEventsByTail.get(tail);
      const reasonChain = apuEvent
        ? deriveReasonChain(apuEvent, domainEvents, settings.reasonTaxonomy, nowIso)
        : {
            segments: [],
            currentReason: undefined,
            reviewDueAt: undefined,
            isReviewDue: false,
            reviewResponseTelemetry: [],
            isLocked: false,
          };
      const manualOffPending = Boolean(
        apuEvent?.state === "open" &&
          manualOffEvents.find((event) => matchesApuEvent(event, apuEvent)),
      );
      const apuRuntimeMinutes = apuEvent
        ? minutesBetween(apuEvent.startedAt, apuEvent.endedAt ?? nowIso)
        : 0;
      const fuelEstimate =
        apuEvent && apuRuntimeMinutes > 0
          ? estimateFuelKgForEquipment(
              apuRuntimeMinutes,
              flight.payload.aircraftType,
              settings.fuelBurnAssumptions,
            )
          : undefined;

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
        manualOffPending,
        groundMinutes: minutesBetween(flight.payload.onGroundAt ?? flight.occurredAt, nowIso),
        apuRuntimeMinutes,
        fuelEstimate,
        sourceCharms: sourceCharmsFor(flight, stand, latestApuStateByTail.get(tail)),
        sourceEventIds: [flight.eventId, stand?.eventId, apuEvent?.apuEventId].filter(
          (eventId): eventId is string => Boolean(eventId),
        ),
      };
    })
    .sort((left, right) => left.tail.localeCompare(right.tail));

  return {
    port: "BNE",
    nowIso,
    weather,
    groundAircraft,
  };
};
