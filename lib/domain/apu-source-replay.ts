import type { ApuStateEvent } from "@/lib/events";
import { isApuStateEvent } from "@/lib/events";

import {
  appendSourceEvent,
  apuTransitionTime,
  closeApuEvent,
  createOpenApuEvent,
  replaceApuEvent,
} from "./apu-event-updates";
import type { DerivedApuEvent } from "./apu-event-types";
import { normalizeTail } from "./ids";
import { compareEventTime } from "./time";

type ApuReplayState = {
  apuEvents: DerivedApuEvent[];
  openByTail: Map<string, DerivedApuEvent>;
};

const emptyApuReplayState = (): ApuReplayState => ({
  apuEvents: [],
  openByTail: new Map(),
});

const recordUpdatedOpenEvent = (
  state: ApuReplayState,
  tail: string,
  updatedEvent: DerivedApuEvent,
): ApuReplayState => ({
  apuEvents: replaceApuEvent(state.apuEvents, updatedEvent),
  openByTail: new Map(state.openByTail).set(tail, updatedEvent),
});

const recordNewOpenEvent = (
  state: ApuReplayState,
  tail: string,
  apuEvent: DerivedApuEvent,
): ApuReplayState => ({
  apuEvents: [...state.apuEvents, apuEvent],
  openByTail: new Map(state.openByTail).set(tail, apuEvent),
});

const recordClosedEvent = (
  state: ApuReplayState,
  tail: string,
  closedEvent: DerivedApuEvent,
): ApuReplayState => {
  const openByTail = new Map(state.openByTail);
  openByTail.delete(tail);

  return {
    apuEvents: replaceApuEvent(state.apuEvents, closedEvent),
    openByTail,
  };
};

const replayOnTransition = (
  state: ApuReplayState,
  event: ApuStateEvent,
  tail: string,
): ApuReplayState => {
  const current = state.openByTail.get(tail);

  if (current) {
    return recordUpdatedOpenEvent(state, tail, appendSourceEvent(current, event.eventId));
  }

  return recordNewOpenEvent(state, tail, createOpenApuEvent(event, tail));
};

const replayOffTransition = (
  state: ApuReplayState,
  event: ApuStateEvent,
  tail: string,
): ApuReplayState => {
  const current = state.openByTail.get(tail);

  if (!current) {
    return state;
  }

  const closedEvent = closeApuEvent(
    appendSourceEvent(current, event.eventId),
    apuTransitionTime(event),
    "source_off",
    "high",
    "Trusted ACMS APU-off transition",
    [event.eventId],
  );

  return recordClosedEvent(state, tail, closedEvent);
};

const replayApuStateEvent = (
  state: ApuReplayState,
  event: ApuStateEvent,
): ApuReplayState => {
  const tail = normalizeTail(event.payload.tail);

  return event.payload.state === "on"
    ? replayOnTransition(state, event, tail)
    : replayOffTransition(state, event, tail);
};

export const replayApuStateEvents = (events: readonly unknown[]): DerivedApuEvent[] =>
  events
    .filter(isApuStateEvent)
    .sort(compareEventTime)
    .reduce(replayApuStateEvent, emptyApuReplayState())
    .apuEvents;
