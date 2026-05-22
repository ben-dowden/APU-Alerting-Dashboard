import type { EventEnvelope } from "./envelope";
import type { SettingsChangedEvent, SettingsChangedPayload } from "./settings-events";

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

export type DomainEventPayloadByType = {
  reason_selected: ReasonSelectedPayload;
  reason_changed: ReasonChangedPayload;
  reason_kept: ReasonKeptPayload;
  reason_note_added: ReasonNoteAddedPayload;
  manual_apu_off_observed: ManualApuOffObservedPayload;
  data_quality_flag_created: DataQualityFlagCreatedPayload;
  review_resolved: ReviewResolvedPayload;
  settings_changed: SettingsChangedPayload;
};

export type DomainEventType = keyof DomainEventPayloadByType;

export const domainEventTypeRegistry = {
  reason_selected: true,
  reason_changed: true,
  reason_kept: true,
  reason_note_added: true,
  manual_apu_off_observed: true,
  data_quality_flag_created: true,
  review_resolved: true,
  settings_changed: true,
} as const satisfies Record<DomainEventType, true>;

export const domainEventTypes = Object.keys(domainEventTypeRegistry) as DomainEventType[];

export type DomainEventOfType<TEventType extends DomainEventType> =
  EventEnvelope<DomainEventPayloadByType[TEventType]> & {
    eventType: TEventType;
  };

export type ReasonSelectedEvent = DomainEventOfType<"reason_selected">;

export type ReasonChangedEvent = DomainEventOfType<"reason_changed">;

export type ReasonKeptEvent = DomainEventOfType<"reason_kept">;

export type ReasonNoteAddedEvent = DomainEventOfType<"reason_note_added">;

export type ManualApuOffObservedEvent = DomainEventOfType<"manual_apu_off_observed">;

export type DataQualityFlagCreatedEvent = DomainEventOfType<"data_quality_flag_created">;

export type ReviewResolvedEvent = DomainEventOfType<"review_resolved">;

export type DomainEvent =
  | {
      [TEventType in Exclude<DomainEventType, "settings_changed">]: DomainEventOfType<TEventType>;
    }[Exclude<DomainEventType, "settings_changed">]
  | SettingsChangedEvent;

export type { SettingsChangedEvent, SettingsChangedPayload };
