import { deriveApuEvents, type DerivedApuEvent } from "@/lib/domain/apu-reducer";
import type {
  ApuStateEvent,
  DomainEvent,
  FlightStateEvent,
  ManualApuOffObservedEvent,
  SourceEvent,
  StandAssignmentEvent,
  WeatherObservationEvent,
} from "@/lib/events";

import {
  domainEventsFrom,
  isReplayableEvent,
  latestApuStateByTail,
  latestFlightStateByTail,
  latestStandByTail,
  latestWeather,
  sourceEventsFrom,
  sortedManualOffEvents,
} from "./current-board-event-index";

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
  const sourceEvents = sourceEventsFrom(replayableEvents);
  const domainEvents = domainEventsFrom(replayableEvents);

  return {
    domainEvents,
    latestFlightStateByTail: latestFlightStateByTail(sourceEvents),
    latestStandByTail: latestStandByTail(sourceEvents),
    latestApuStateByTail: latestApuStateByTail(sourceEvents),
    apuEventsByTail: createApuEventsByTail(sourceEvents),
    manualOffEvents: sortedManualOffEvents(domainEvents),
    weather: latestWeather(sourceEvents),
  };
};
