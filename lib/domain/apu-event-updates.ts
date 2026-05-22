import type { ApuStateEvent } from "@/lib/events";

import { createApuEventId } from "./ids";
import type { ApuEventClosureType, DerivedApuEvent } from "./apu-event-types";

export const apuTransitionTime = (event: ApuStateEvent) =>
  event.payload.transitionedAt || event.occurredAt;

export const createOpenApuEvent = (
  event: ApuStateEvent,
  tail: string,
): DerivedApuEvent => {
  const startedAt = apuTransitionTime(event);

  return {
    apuEventId: createApuEventId(event.payload.port, tail, startedAt),
    tail,
    port: event.payload.port,
    startedAt,
    endedAt: undefined,
    state: "open",
    closureType: "open",
    closureConfidence: undefined,
    closureReason: undefined,
    closureSourceEventIds: [],
    sourceEventIds: [event.eventId],
  };
};

export const appendSourceEvent = (
  apuEvent: DerivedApuEvent,
  sourceEventId: string,
): DerivedApuEvent => ({
  ...apuEvent,
  sourceEventIds: [...apuEvent.sourceEventIds, sourceEventId],
});

export const closeApuEvent = (
  apuEvent: DerivedApuEvent,
  endedAt: string,
  closureType: Exclude<ApuEventClosureType, "open">,
  closureConfidence: "high" | "medium" | "low",
  closureReason: string,
  closureSourceEventIds: string[],
): DerivedApuEvent => ({
  ...apuEvent,
  endedAt,
  state: "closed",
  closureType,
  closureConfidence,
  closureReason,
  closureSourceEventIds,
});

export const replaceApuEvent = (
  apuEvents: readonly DerivedApuEvent[],
  updatedEvent: DerivedApuEvent,
) =>
  apuEvents.map((apuEvent) =>
    apuEvent.apuEventId === updatedEvent.apuEventId ? updatedEvent : apuEvent,
  );
