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
import { matchesApuEventId, normalizeTail } from "@/lib/domain/ids";

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

type BoardEventContext = {
  domainEvents: DomainEvent[];
  latestFlightStateByTail: Map<string, FlightStateEvent>;
  latestStandByTail: Map<string, StandAssignmentEvent>;
  latestApuStateByTail: Map<string, ApuStateEvent>;
  apuEventsByTail: Map<string, DerivedApuEvent>;
  manualOffEvents: ManualApuOffObservedEvent[];
  weather?: WeatherObservationEvent["payload"];
};

type TailEvent = {
  payload: { tail: string };
  occurredAt: string;
  receivedAt: string;
  eventId: string;
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

const latestByTail = <TEvent extends TailEvent>(events: TEvent[]) => {
  const latest = new Map<string, TEvent>();

  for (const event of events.sort(byEventTime)) {
    latest.set(normalizeTail(event.payload.tail), event);
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

const hasNotDepartedBy = (event: FlightStateEvent, nowIso: string) =>
  event.payload.gateState !== "departed" ||
  Boolean(event.payload.offGroundAt && event.payload.offGroundAt > nowIso);

const isAircraftStillOnGround = (event: FlightStateEvent, nowIso: string) =>
  Boolean(event.payload.onGroundAt) && hasNotDepartedBy(event, nowIso);

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

const isReplayableEvent = (
  event: unknown,
  nowIso: string,
): event is SourceEvent | DomainEvent =>
  (isSourceEvent(event) || isDomainEvent(event)) && event.occurredAt <= nowIso;

const createApuEventsByTail = (sourceEvents: SourceEvent[]) =>
  new Map(deriveApuEvents(sourceEvents).map((event) => [event.tail, event] as const));

const createBoardEventContext = (
  events: readonly unknown[],
  nowIso: string,
): BoardEventContext => {
  const replayableEvents = events.filter((event) => isReplayableEvent(event, nowIso));
  const sourceEvents = replayableEvents.filter(isSourceEvent);
  const domainEvents = replayableEvents.filter(isDomainEvent);

  return {
    domainEvents,
    latestFlightStateByTail: latestByTail(sourceEvents.filter(isFlightStateEvent)),
    latestStandByTail: latestByTail(sourceEvents.filter(isStandAssignmentEvent)),
    latestApuStateByTail: latestByTail(sourceEvents.filter(isApuStateEvent)),
    apuEventsByTail: createApuEventsByTail(sourceEvents),
    manualOffEvents: domainEvents.filter(isManualApuOffObservedEvent).sort(byEventTime),
    weather: sourceEvents.filter(isWeatherObservationEvent).sort(byEventTime).at(-1)?.payload,
  };
};

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

const createGroundAircraftState = (
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
    ? minutesBetween(apuEvent.startedAt, apuEvent.endedAt ?? nowIso)
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
    groundMinutes: minutesBetween(flight.payload.onGroundAt ?? flight.occurredAt, nowIso),
    apuRuntimeMinutes,
    fuelEstimate: fuelEstimateFor(apuRuntimeMinutes, apuEvent, flight, settings),
    sourceCharms: sourceCharmsFor(flight, stand, context.latestApuStateByTail.get(tail)),
    sourceEventIds: sourceEventIdsFor(flight, stand, apuEvent),
  };
};

export const deriveCurrentBoard = (
  events: readonly unknown[],
  settings: CurrentBoardSettings,
  nowIso: string,
): CurrentBoardState => {
  const context = createBoardEventContext(events, nowIso);
  const groundAircraft = [...context.latestFlightStateByTail.values()]
    .filter((event) => event.payload.port === "BNE")
    .filter((event) => isAircraftStillOnGround(event, nowIso))
    .map((flight) => createGroundAircraftState(flight, context, settings, nowIso))
    .sort((left, right) => left.tail.localeCompare(right.tail));

  return {
    port: "BNE",
    nowIso,
    weather: context.weather,
    groundAircraft,
  };
};
