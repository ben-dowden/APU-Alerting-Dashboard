import type { ApuStateEvent, FlightStateEvent } from "@/lib/events";
import { isApuStateEvent } from "@/lib/events";
import { createApuEventId, normalizeTail } from "./ids";
import { compareEventTime, compareIsoStrings } from "./time";

export type ApuEventClosureType = "open" | "source_off" | "inferred_departed";
export type ApuEventState = "open" | "closed";

export type DerivedApuEvent = {
  apuEventId: string;
  tail: string;
  port: string;
  startedAt: string;
  endedAt?: string;
  state: ApuEventState;
  closureType: ApuEventClosureType;
  closureConfidence?: "high" | "medium" | "low";
  closureReason?: string;
  closureSourceEventIds: string[];
  sourceEventIds: string[];
};

export type DeriveApuEventsOptions = {
  inferClosureFromFlightState?: boolean;
};

const isFlightStateEvent = (event: unknown): event is FlightStateEvent =>
  typeof event === "object" &&
  event !== null &&
  (event as { eventType?: unknown }).eventType === "flight_state_event";

const transitionTime = (event: ApuStateEvent) => event.payload.transitionedAt || event.occurredAt;

const closeApuEvent = (
  apuEvent: DerivedApuEvent,
  endedAt: string,
  closureType: Exclude<ApuEventClosureType, "open">,
  closureConfidence: "high" | "medium" | "low",
  closureReason: string,
  closureSourceEventIds: string[],
) => {
  apuEvent.endedAt = endedAt;
  apuEvent.state = "closed";
  apuEvent.closureType = closureType;
  apuEvent.closureConfidence = closureConfidence;
  apuEvent.closureReason = closureReason;
  apuEvent.closureSourceEventIds = closureSourceEventIds;
};

export const deriveApuEvents = (
  events: readonly unknown[],
  options: DeriveApuEventsOptions = {},
): DerivedApuEvent[] => {
  const inferClosureFromFlightState = options.inferClosureFromFlightState ?? true;
  const apuEvents: DerivedApuEvent[] = [];
  const openByTail = new Map<string, DerivedApuEvent>();

  const apuStateEvents = events.filter(isApuStateEvent).sort(compareEventTime);

  for (const event of apuStateEvents) {
    const tail = normalizeTail(event.payload.tail);
    const current = openByTail.get(tail);
    const occurredAt = transitionTime(event);

    if (event.payload.state === "on") {
      if (current) {
        current.sourceEventIds.push(event.eventId);
        continue;
      }

      const apuEvent: DerivedApuEvent = {
        apuEventId: createApuEventId(event.payload.port, tail, occurredAt),
        tail,
        port: event.payload.port,
        startedAt: occurredAt,
        endedAt: undefined,
        state: "open",
        closureType: "open",
        closureConfidence: undefined,
        closureReason: undefined,
        closureSourceEventIds: [],
        sourceEventIds: [event.eventId],
      };

      apuEvents.push(apuEvent);
      openByTail.set(tail, apuEvent);
      continue;
    }

    if (!current) {
      continue;
    }

    current.sourceEventIds.push(event.eventId);
    closeApuEvent(
      current,
      occurredAt,
      "source_off",
      "high",
      "Trusted ACMS APU-off transition",
      [event.eventId],
    );
    openByTail.delete(tail);
  }

  if (inferClosureFromFlightState) {
    const departedFlightEvents = events
      .filter(isFlightStateEvent)
      .filter((event) => event.payload.gateState === "departed" && event.payload.offGroundAt)
      .sort(compareEventTime);

    for (const apuEvent of apuEvents.filter((event) => event.state === "open")) {
      const closureEvent = departedFlightEvents.find(
        (event) =>
          normalizeTail(event.payload.tail) === apuEvent.tail &&
          event.payload.port === apuEvent.port &&
          event.payload.offGroundAt &&
          event.payload.offGroundAt >= apuEvent.startedAt,
      );

      if (!closureEvent?.payload.offGroundAt) {
        continue;
      }

      closeApuEvent(
        apuEvent,
        closureEvent.payload.offGroundAt,
        "inferred_departed",
        "low",
        "Inferred from departed flight state without trusted APU-off transition",
        [closureEvent.eventId],
      );
      apuEvent.sourceEventIds.push(closureEvent.eventId);
    }
  }

  return apuEvents.sort((left, right) => compareIsoStrings(left.startedAt, right.startedAt));
};
