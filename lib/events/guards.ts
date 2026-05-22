import type { ApuStateEvent, SourceEvent } from "./source-events";
import { sourceEventTypes } from "./source-events";
import type { DomainEvent } from "./domain-events";
import { domainEventTypes } from "./domain-events";

const sourceEventTypeSet = new Set<string>(sourceEventTypes);
const domainEventTypeSet = new Set<string>(domainEventTypes);

type EventCandidate = {
  eventType: string;
  payload?: unknown;
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

const hasEventType = (value: unknown): value is EventCandidate =>
  isRecord(value) && typeof value.eventType === "string";

export const isSourceEvent = (value: unknown): value is SourceEvent =>
  hasEventType(value) && sourceEventTypeSet.has(value.eventType);

export const isDomainEvent = (value: unknown): value is DomainEvent =>
  hasEventType(value) && domainEventTypeSet.has(value.eventType);

export const isApuStateEvent = (value: unknown): value is ApuStateEvent => {
  if (!hasEventType(value) || value.eventType !== "apu_state_event" || !isRecord(value.payload)) {
    return false;
  }

  return value.payload.state === "on" || value.payload.state === "off";
};
