import type { ApuStateEvent, SourceEvent, SourceEventType } from "./source-events";
import type { DomainEvent, DomainEventType } from "./domain-events";

const sourceEventTypes = new Set<SourceEventType>([
  "flight_state_event",
  "stand_assignment_event",
  "apu_state_event",
  "weather_observation_event",
  "tail_equipment_reference_event",
  "stand_coordinate_reference_event",
]);

const domainEventTypes = new Set<DomainEventType>([
  "reason_selected",
  "reason_changed",
  "reason_kept",
  "reason_note_added",
  "manual_apu_off_observed",
  "data_quality_flag_created",
  "review_resolved",
  "settings_changed",
]);

type EventCandidate = {
  eventType?: unknown;
  payload?: unknown;
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

const hasEventType = (value: unknown): value is EventCandidate =>
  isRecord(value) && typeof value.eventType === "string";

export const isSourceEvent = (value: unknown): value is SourceEvent =>
  hasEventType(value) && sourceEventTypes.has(value.eventType as SourceEventType);

export const isDomainEvent = (value: unknown): value is DomainEvent =>
  hasEventType(value) && domainEventTypes.has(value.eventType as DomainEventType);

export const isApuStateEvent = (value: unknown): value is ApuStateEvent => {
  if (!hasEventType(value) || value.eventType !== "apu_state_event" || !isRecord(value.payload)) {
    return false;
  }

  return value.payload.state === "on" || value.payload.state === "off";
};
