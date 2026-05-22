import type { FlightStateEvent } from "@/lib/events";
import { isSourceEvent } from "@/lib/events";

import { appendSourceEvent, closeApuEvent, replaceApuEvent } from "./apu-event-updates";
import type { DerivedApuEvent } from "./apu-event-types";
import { normalizeTail } from "./ids";
import { compareEventTime } from "./time";

const isFlightStateEvent = (event: unknown): event is FlightStateEvent =>
  isSourceEvent(event) && event.eventType === "flight_state_event";

const isDepartedFlightEvent = (event: FlightStateEvent) =>
  event.payload.gateState === "departed" && Boolean(event.payload.offGroundAt);

const departedFlightEvents = (events: readonly unknown[]) =>
  events.filter(isFlightStateEvent).filter(isDepartedFlightEvent).sort(compareEventTime);

const matchesOpenApuEvent = (event: FlightStateEvent, apuEvent: DerivedApuEvent) =>
  normalizeTail(event.payload.tail) === apuEvent.tail &&
  event.payload.port === apuEvent.port &&
  Boolean(event.payload.offGroundAt && event.payload.offGroundAt >= apuEvent.startedAt);

const inferredClosureFor = (
  apuEvent: DerivedApuEvent,
  flightEvents: readonly FlightStateEvent[],
) => {
  const closureEvent = flightEvents.find((event) => matchesOpenApuEvent(event, apuEvent));

  if (!closureEvent?.payload.offGroundAt) {
    return apuEvent;
  }

  return closeApuEvent(
    appendSourceEvent(apuEvent, closureEvent.eventId),
    closureEvent.payload.offGroundAt,
    "inferred_departed",
    "low",
    "Inferred from departed flight state without trusted APU-off transition",
    [closureEvent.eventId],
  );
};

export const inferDepartedApuClosures = (
  apuEvents: readonly DerivedApuEvent[],
  sourceEvents: readonly unknown[],
) => {
  const flightEvents = departedFlightEvents(sourceEvents);

  return apuEvents
    .filter((event) => event.state === "open")
    .reduce(
      (events, apuEvent) => replaceApuEvent(events, inferredClosureFor(apuEvent, flightEvents)),
      [...apuEvents],
    );
};
