import { deriveApuEvents, type DerivedApuEvent } from "@/lib/domain/apu-reducer";
import { normalizeTail } from "@/lib/domain/ids";
import { compareEventTime } from "@/lib/domain/time";
import type {
  ApuStateEvent,
  DomainEvent,
  FlightStateEvent,
  ManualApuOffObservedEvent,
  SourceEvent,
  StandAssignmentEvent,
  WeatherObservationEvent,
} from "@/lib/events";
import { isApuStateEvent, isDomainEvent, isSourceEvent } from "@/lib/events";

export const CURRENT_BOARD_PORT = "BNE";

export type BoardEventContext = {
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

const latestByTail = <TEvent extends TailEvent>(events: TEvent[]) => {
  const latest = new Map<string, TEvent>();

  for (const event of [...events].sort(compareEventTime)) {
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

const isReplayableEvent = (
  event: unknown,
  nowIso: string,
): event is SourceEvent | DomainEvent =>
  (isSourceEvent(event) || isDomainEvent(event)) && event.occurredAt <= nowIso;

const createApuEventsByTail = (sourceEvents: SourceEvent[]) =>
  new Map(deriveApuEvents(sourceEvents).map((event) => [event.tail, event] as const));

export const isAircraftStillOnGround = (event: FlightStateEvent, nowIso: string) =>
  Boolean(event.payload.onGroundAt) &&
  (event.payload.gateState !== "departed" ||
    Boolean(event.payload.offGroundAt && event.payload.offGroundAt > nowIso));

export const createBoardEventContext = (
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
    manualOffEvents: domainEvents.filter(isManualApuOffObservedEvent).sort(compareEventTime),
    weather: sourceEvents.filter(isWeatherObservationEvent).sort(compareEventTime).at(-1)?.payload,
  };
};
