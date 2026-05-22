import type { EventEnvelope } from "./envelope";
import type { SettingsChangedEvent, SettingsChangedPayload } from "./settings-events";

export type DomainEventType =
  | "reason_selected"
  | "reason_changed"
  | "reason_kept"
  | "reason_note_added"
  | "manual_apu_off_observed"
  | "data_quality_flag_created"
  | "review_resolved"
  | "settings_changed";

export type ReasonSelection = {
  apuEventId: string;
  reasonSegmentId: string;
  categoryId: string;
  categoryLabel: string;
  detailId: string;
  detailLabel: string;
  selectedBy: string;
  selectedAt: string;
  sourceAction: "select_reason" | "change_reason" | "correct_reason";
};

export type ReasonSelectedPayload = ReasonSelection & {
  previousReasonSegmentId?: never;
};

export type ReasonChangedPayload = ReasonSelection & {
  previousReasonSegmentId: string;
  previousCategoryId: string;
  previousDetailId: string;
};

export type ReasonKeptPayload = {
  apuEventId: string;
  reasonSegmentId: string;
  categoryId: string;
  detailId: string;
  keptBy: string;
  keptAt: string;
  reviewDueAt: string;
};

export type ReasonNoteAddedPayload = {
  apuEventId: string;
  reasonSegmentId: string;
  noteId: string;
  note: string;
  addedBy: string;
  addedAt: string;
};

export type ManualApuOffObservedPayload = {
  apuEventId: string;
  tail: string;
  observedBy: string;
  observedAt: string;
  pendingSourceConfirmation: true;
  observationNote?: string;
};

export type DataQualityFlagCreatedPayload = {
  flagId: string;
  tail?: string;
  apuEventId?: string;
  aircraftGroundEventId?: string;
  category:
    | "source_stale"
    | "equipment_mismatch"
    | "missing_reference_data"
    | "manual_user_flag"
    | "state_conflict";
  severity: "info" | "warning" | "critical";
  summary: string;
  createdBy: string;
  createdAt: string;
  relatedEventIds: string[];
};

export type ReviewResolvedPayload = {
  apuEventId: string;
  reasonSegmentId: string;
  reviewDueAt: string;
  reviewResolvedAt: string;
  resolutionType: "kept_current_reason" | "changed_reason" | "dismissed";
  responseMinutes: number;
  resolvedBy: string;
};

export type ReasonSelectedEvent = EventEnvelope<ReasonSelectedPayload> & {
  eventType: "reason_selected";
};

export type ReasonChangedEvent = EventEnvelope<ReasonChangedPayload> & {
  eventType: "reason_changed";
};

export type ReasonKeptEvent = EventEnvelope<ReasonKeptPayload> & {
  eventType: "reason_kept";
};

export type ReasonNoteAddedEvent = EventEnvelope<ReasonNoteAddedPayload> & {
  eventType: "reason_note_added";
};

export type ManualApuOffObservedEvent = EventEnvelope<ManualApuOffObservedPayload> & {
  eventType: "manual_apu_off_observed";
};

export type DataQualityFlagCreatedEvent = EventEnvelope<DataQualityFlagCreatedPayload> & {
  eventType: "data_quality_flag_created";
};

export type ReviewResolvedEvent = EventEnvelope<ReviewResolvedPayload> & {
  eventType: "review_resolved";
};

export type DomainEvent =
  | ReasonSelectedEvent
  | ReasonChangedEvent
  | ReasonKeptEvent
  | ReasonNoteAddedEvent
  | ManualApuOffObservedEvent
  | DataQualityFlagCreatedEvent
  | ReviewResolvedEvent
  | SettingsChangedEvent;

export type { SettingsChangedEvent, SettingsChangedPayload };
