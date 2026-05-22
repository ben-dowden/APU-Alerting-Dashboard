import {
  buildEventId,
  buildIdempotencyKey,
  type EventCorrelation,
  type EventEnvelope,
  type EventQuality,
  type ReasonChangedEvent,
  type ReasonKeptEvent,
  type ReasonNoteAddedEvent,
  type ReasonSelectedEvent,
} from "@/lib/events";

type WorkflowPort = "BNE";
type WorkflowClock = () => string;

type BaseWorkflowInput = {
  port?: WorkflowPort;
  tail: string;
  apuEventId: string;
};

type ReasonInput = {
  categoryId: string;
  categoryLabel: string;
  detailId: string;
  detailLabel: string;
};

export type SelectReasonInput = BaseWorkflowInput &
  ReasonInput & {
    reasonSegmentId?: string;
    selectedBy: string;
    selectedAt?: string;
  };

export type ChangeReasonInput = SelectReasonInput & {
  previousReasonSegmentId: string;
  previousCategoryId: string;
  previousDetailId: string;
};

export type KeepCurrentReasonInput = BaseWorkflowInput & {
  reasonSegmentId: string;
  categoryId: string;
  detailId: string;
  keptBy: string;
  keptAt?: string;
  reviewDueAt: string;
};

export type AddReasonNoteInput = BaseWorkflowInput & {
  reasonSegmentId: string;
  noteId?: string;
  note: string;
  addedBy: string;
  addedAt?: string;
};

type WorkflowEnvelopeInput<TEventType extends string, TPayload> = BaseWorkflowInput & {
  eventType: TEventType;
  occurredAt: string;
  reasonSegmentId?: string;
  entityId: string;
  payload: TPayload;
};

type ReasonChangeSourceAction = "change_reason" | "correct_reason";

const systemNowIso = () => new Date().toISOString();

const defaultPort = (port: WorkflowPort | undefined) => port ?? "BNE";

const segmentIdFor = (tail: string, occurredAt: string) => `reason:${tail}:${occurredAt}`;

const noteIdFor = (tail: string, occurredAt: string) => `note:${tail}:${occurredAt}`;

const workflowSourceEventId = (eventType: string, entityId: string, occurredAt: string) =>
  `workflow:${eventType}:${entityId}:${occurredAt}`;

const workflowEnvelope = <TEventType extends string, TPayload>({
  eventType,
  port,
  tail,
  apuEventId,
  occurredAt,
  reasonSegmentId,
  entityId,
  payload,
}: WorkflowEnvelopeInput<TEventType, TPayload>): EventEnvelope<TPayload> & {
  eventType: TEventType;
} => {
  const sourceEventId = workflowSourceEventId(eventType, entityId, occurredAt);
  const idempotencyKey = buildIdempotencyKey("APU_APP", sourceEventId);
  const eventPort = defaultPort(port);
  const correlation: EventCorrelation = {
    port: eventPort,
    tail,
    apuEventId,
    reasonSegmentId,
    idempotencyKey,
  };
  const quality: EventQuality = {
    confidence: "high",
    idempotencyKey,
  };

  return {
    eventId: buildEventId(eventType, eventPort, entityId, occurredAt),
    eventType,
    eventVersion: 1,
    sourceSystem: "APU_APP",
    sourceEventId,
    occurredAt,
    receivedAt: occurredAt,
    correlation,
    quality,
    payload,
  };
};

export const buildSelectReasonEvent = (
  input: SelectReasonInput,
  nowIso: WorkflowClock = systemNowIso,
): ReasonSelectedEvent => {
  const selectedAt = input.selectedAt ?? nowIso();
  const reasonSegmentId = input.reasonSegmentId ?? segmentIdFor(input.tail, selectedAt);

  return workflowEnvelope({
    ...input,
    eventType: "reason_selected",
    occurredAt: selectedAt,
    reasonSegmentId,
    entityId: reasonSegmentId,
    payload: {
      apuEventId: input.apuEventId,
      reasonSegmentId,
      categoryId: input.categoryId,
      categoryLabel: input.categoryLabel,
      detailId: input.detailId,
      detailLabel: input.detailLabel,
      selectedBy: input.selectedBy,
      selectedAt,
      sourceAction: "select_reason",
    },
  });
};

const buildReasonChangedEvent = (
  input: ChangeReasonInput,
  sourceAction: ReasonChangeSourceAction,
  nowIso: WorkflowClock = systemNowIso,
): ReasonChangedEvent => {
  const selectedAt = input.selectedAt ?? nowIso();
  const reasonSegmentId = input.reasonSegmentId ?? segmentIdFor(input.tail, selectedAt);

  return workflowEnvelope({
    ...input,
    eventType: "reason_changed",
    occurredAt: selectedAt,
    reasonSegmentId,
    entityId: reasonSegmentId,
    payload: {
      apuEventId: input.apuEventId,
      previousReasonSegmentId: input.previousReasonSegmentId,
      previousCategoryId: input.previousCategoryId,
      previousDetailId: input.previousDetailId,
      reasonSegmentId,
      categoryId: input.categoryId,
      categoryLabel: input.categoryLabel,
      detailId: input.detailId,
      detailLabel: input.detailLabel,
      selectedBy: input.selectedBy,
      selectedAt,
      sourceAction,
    },
  });
};

export const buildChangeReasonEvent = (
  input: ChangeReasonInput,
  nowIso: WorkflowClock = systemNowIso,
): ReasonChangedEvent => buildReasonChangedEvent(input, "change_reason", nowIso);

export const buildCorrectPreviousReasonEvent = (
  input: ChangeReasonInput,
  nowIso: WorkflowClock = systemNowIso,
): ReasonChangedEvent => buildReasonChangedEvent(input, "correct_reason", nowIso);

export const buildKeepCurrentReasonEvent = (
  input: KeepCurrentReasonInput,
  nowIso: WorkflowClock = systemNowIso,
): ReasonKeptEvent => {
  const keptAt = input.keptAt ?? nowIso();

  return workflowEnvelope({
    ...input,
    eventType: "reason_kept",
    occurredAt: keptAt,
    reasonSegmentId: input.reasonSegmentId,
    entityId: input.reasonSegmentId,
    payload: {
      apuEventId: input.apuEventId,
      reasonSegmentId: input.reasonSegmentId,
      categoryId: input.categoryId,
      detailId: input.detailId,
      keptBy: input.keptBy,
      keptAt,
      reviewDueAt: input.reviewDueAt,
    },
  });
};

export const buildAddReasonNoteEvent = (
  input: AddReasonNoteInput,
  nowIso: WorkflowClock = systemNowIso,
): ReasonNoteAddedEvent => {
  const addedAt = input.addedAt ?? nowIso();
  const noteId = input.noteId ?? noteIdFor(input.tail, addedAt);

  return workflowEnvelope({
    ...input,
    eventType: "reason_note_added",
    occurredAt: addedAt,
    reasonSegmentId: input.reasonSegmentId,
    entityId: noteId,
    payload: {
      apuEventId: input.apuEventId,
      reasonSegmentId: input.reasonSegmentId,
      noteId,
      note: input.note,
      addedBy: input.addedBy,
      addedAt,
    },
  });
};
