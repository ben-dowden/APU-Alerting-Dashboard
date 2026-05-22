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

type TailEvent = {
  payload: { tail: string };
  occurredAt: string;
  receivedAt: string;
  eventId: string;
};

export const latestByTail = <TEvent extends TailEvent>(events: TEvent[]) => {
  const latest = new Map<string, TEvent>();

  for (const event of [...events].sort(compareEventTime)) {
    latest.set(normalizeTail(event.payload.tail), event);
  }

  return latest;
};

export const isFlightStateEvent = (event: SourceEvent): event is FlightStateEvent =>
  event.eventType === "flight_state_event";

export const isStandAssignmentEvent = (event: SourceEvent): event is StandAssignmentEvent =>
  event.eventType === "stand_assignment_event";

export const isWeatherObservationEvent = (event: SourceEvent): event is WeatherObservationEvent =>
  event.eventType === "weather_observation_event";

export const isManualApuOffObservedEvent = (
  event: DomainEvent,
): event is ManualApuOffObservedEvent => event.eventType === "manual_apu_off_observed";

export const isReplayableEvent = (
  event: unknown,
  nowIso: string,
): event is SourceEvent | DomainEvent =>
  (isSourceEvent(event) || isDomainEvent(event)) && event.occurredAt <= nowIso;

export const sourceEventsFrom = (events: ReadonlyArray<SourceEvent | DomainEvent>) =>
  events.filter(isSourceEvent);

export const domainEventsFrom = (events: ReadonlyArray<SourceEvent | DomainEvent>) =>
  events.filter(isDomainEvent);

export const latestFlightStateByTail = (sourceEvents: SourceEvent[]) =>
  latestByTail(sourceEvents.filter(isFlightStateEvent));

export const latestStandByTail = (sourceEvents: SourceEvent[]) =>
  latestByTail(sourceEvents.filter(isStandAssignmentEvent));

export const latestApuStateByTail = (sourceEvents: SourceEvent[]) =>
  latestByTail(sourceEvents.filter(isApuStateEvent));

export const sortedManualOffEvents = (domainEvents: DomainEvent[]) =>
  domainEvents.filter(isManualApuOffObservedEvent).sort(compareEventTime);

export const latestWeather = (sourceEvents: SourceEvent[]) =>
  sourceEvents.filter(isWeatherObservationEvent).sort(compareEventTime).at(-1)?.payload;
