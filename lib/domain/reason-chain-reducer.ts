import type {
  DomainEvent,
  ReasonChangedEvent,
  ReasonKeptEvent,
  ReasonSelectedEvent,
  ReviewResolvedEvent,
  ReasonTaxonomySnapshot,
} from "@/lib/events";
import type { DerivedApuEvent } from "./apu-reducer";
import { matchesApuEventId } from "./ids";
import { addMinutesIso, compareEventTime } from "./time";

export type ReasonSegment = {
  reasonSegmentId: string;
  apuEventId: string;
  categoryId: string;
  categoryLabel: string;
  detailId: string;
  detailLabel: string;
  startedAt: string;
  endedAt?: string;
  selectedBy: string;
  sourceEventIds: string[];
};

export type ReviewResponseTelemetry = {
  reasonSegmentId: string;
  responseType: "kept" | "changed" | "dismissed";
  reviewDueAt: string;
  respondedAt: string;
  respondedBy: string;
  sourceEventId: string;
};

export type ReasonChainState = {
  segments: ReasonSegment[];
  currentReason?: ReasonSegment;
  reviewDueAt?: string;
  isReviewDue: boolean;
  reviewResponseTelemetry: ReviewResponseTelemetry[];
  isLocked: boolean;
};

type ReasonEvent = ReasonSelectedEvent | ReasonChangedEvent | ReasonKeptEvent | ReviewResolvedEvent;

type ReasonChainAccumulator = {
  segments: ReasonSegment[];
  reviewResponseTelemetry: ReviewResponseTelemetry[];
};

const hasApuEventId = (event: DomainEvent): event is DomainEvent & { payload: { apuEventId: string } } =>
  "apuEventId" in event.payload && typeof event.payload.apuEventId === "string";

const matchesApuEvent = (event: DomainEvent, apuEvent: DerivedApuEvent) => {
  if (!hasApuEventId(event)) {
    return false;
  }

  return matchesApuEventId(event.payload.apuEventId, apuEvent);
};

const eventTimestamp = (event: ReasonSelectedEvent | ReasonChangedEvent) =>
  event.payload.selectedAt || event.occurredAt;

const findReviewIntervalMinutes = (
  settings: ReasonTaxonomySnapshot,
  categoryId: string,
  detailId: string,
) => {
  const category = settings.categories.find((candidate) => candidate.id === categoryId);
  const detail = category?.details.find((candidate) => candidate.id === detailId);
  return detail?.reviewIntervalMinutes ?? settings.defaultReviewIntervalMinutes;
};

const createSegment = (event: ReasonSelectedEvent | ReasonChangedEvent): ReasonSegment => ({
  reasonSegmentId: event.payload.reasonSegmentId,
  apuEventId: event.payload.apuEventId,
  categoryId: event.payload.categoryId,
  categoryLabel: event.payload.categoryLabel,
  detailId: event.payload.detailId,
  detailLabel: event.payload.detailLabel,
  startedAt: eventTimestamp(event),
  endedAt: undefined,
  selectedBy: event.payload.selectedBy,
  sourceEventIds: [event.eventId],
});

const closeSegment = (segment: ReasonSegment, endedAt: string): ReasonSegment =>
  segment.endedAt ? segment : { ...segment, endedAt };

const closeSegmentAt = (
  segments: ReasonSegment[],
  index: number,
  endedAt: string,
) =>
  segments.map((segment, segmentIndex) =>
    segmentIndex === index ? closeSegment(segment, endedAt) : segment,
  );

const latestKeptTelemetryForSegment = (
  telemetry: ReviewResponseTelemetry[],
  reasonSegmentId: string,
) =>
  telemetry
    .filter((entry) => entry.reasonSegmentId === reasonSegmentId && entry.responseType === "kept")
    .sort((left, right) => right.respondedAt.localeCompare(left.respondedAt))[0];

const findCurrentOpenSegment = (segments: ReasonSegment[]) => {
  for (let index = segments.length - 1; index >= 0; index -= 1) {
    if (!segments[index].endedAt) {
      return segments[index];
    }
  }

  return undefined;
};

const reviewResponseTypeByResolution: Record<
  ReviewResolvedEvent["payload"]["resolutionType"],
  ReviewResponseTelemetry["responseType"]
> = {
  kept_current_reason: "kept",
  changed_reason: "changed",
  dismissed: "dismissed",
};

const keepFirstReasonSegment = (
  state: ReasonChainAccumulator,
  event: ReasonSelectedEvent,
): ReasonChainAccumulator =>
  state.segments.length === 0 ? { ...state, segments: [createSegment(event)] } : state;

const changeReasonSegment = (
  state: ReasonChainAccumulator,
  event: ReasonChangedEvent,
): ReasonChainAccumulator => {
  if (event.payload.sourceAction === "correct_reason") {
    return {
      ...state,
      segments: state.segments.map((segment) =>
        segment.reasonSegmentId === event.payload.previousReasonSegmentId
          ? {
              ...segment,
              categoryId: event.payload.categoryId,
              categoryLabel: event.payload.categoryLabel,
              detailId: event.payload.detailId,
              detailLabel: event.payload.detailLabel,
              sourceEventIds: [...segment.sourceEventIds, event.eventId],
            }
          : segment,
      ),
    };
  }

  const changedAt = eventTimestamp(event);
  const previousIndex = state.segments.findIndex(
    (segment) => segment.reasonSegmentId === event.payload.previousReasonSegmentId,
  );
  const fallbackIndex = state.segments.length - 1;
  const segmentIndexToClose = previousIndex >= 0 ? previousIndex : fallbackIndex;
  const nextSegment = createSegment(event);

  return {
    ...state,
    segments:
      segmentIndexToClose >= 0
        ? [...closeSegmentAt(state.segments, segmentIndexToClose, changedAt), nextSegment]
        : [nextSegment],
  };
};

const recordKeptReview = (
  state: ReasonChainAccumulator,
  event: ReasonKeptEvent,
): ReasonChainAccumulator => ({
  ...state,
  reviewResponseTelemetry: [
    ...state.reviewResponseTelemetry,
    {
      reasonSegmentId: event.payload.reasonSegmentId,
      responseType: "kept",
      reviewDueAt: event.payload.reviewDueAt,
      respondedAt: event.payload.keptAt,
      respondedBy: event.payload.keptBy,
      sourceEventId: event.eventId,
    },
  ],
});

const recordResolvedReview = (
  state: ReasonChainAccumulator,
  event: ReviewResolvedEvent,
): ReasonChainAccumulator => ({
  ...state,
  reviewResponseTelemetry: [
    ...state.reviewResponseTelemetry,
    {
      reasonSegmentId: event.payload.reasonSegmentId,
      responseType: reviewResponseTypeByResolution[event.payload.resolutionType],
      reviewDueAt: event.payload.reviewDueAt,
      respondedAt: event.payload.reviewResolvedAt,
      respondedBy: event.payload.resolvedBy,
      sourceEventId: event.eventId,
    },
  ],
});

type ReasonEventHandlers = {
  [TEventType in ReasonEvent["eventType"]]: (
    state: ReasonChainAccumulator,
    event: Extract<ReasonEvent, { eventType: TEventType }>,
  ) => ReasonChainAccumulator;
};

const reasonEventHandlers = {
  reason_selected: keepFirstReasonSegment,
  reason_changed: changeReasonSegment,
  reason_kept: recordKeptReview,
  review_resolved: recordResolvedReview,
} satisfies ReasonEventHandlers;

const reasonEventTypes = new Set(
  Object.keys(reasonEventHandlers) as Array<ReasonEvent["eventType"]>,
);

const isReasonEvent = (event: DomainEvent): event is ReasonEvent =>
  reasonEventTypes.has(event.eventType as ReasonEvent["eventType"]);

const applyReasonEvent = (
  state: ReasonChainAccumulator,
  event: ReasonEvent,
): ReasonChainAccumulator => reasonEventHandlers[event.eventType](state, event as never);

export const deriveReasonChain = (
  apuEvent: DerivedApuEvent,
  domainEvents: readonly DomainEvent[],
  settings: ReasonTaxonomySnapshot,
  nowIso: string,
): ReasonChainState => {
  const reasonEvents = domainEvents
    .filter(isReasonEvent)
    .filter((event) => matchesApuEvent(event, apuEvent))
    .filter((event) => event.occurredAt >= apuEvent.startedAt)
    .filter((event) => !apuEvent.endedAt || event.occurredAt <= apuEvent.endedAt)
    .sort(compareEventTime);

  let replayState: ReasonChainAccumulator = {
    segments: [],
    reviewResponseTelemetry: [],
  };

  for (const event of reasonEvents) {
    replayState = applyReasonEvent(replayState, event);
  }

  let { segments } = replayState;
  const { reviewResponseTelemetry } = replayState;

  if (apuEvent.endedAt) {
    segments = closeSegmentAt(segments, segments.length - 1, apuEvent.endedAt);
  }

  const currentReason = apuEvent.state === "open" ? findCurrentOpenSegment(segments) : undefined;
  const latestKept = currentReason
    ? latestKeptTelemetryForSegment(reviewResponseTelemetry, currentReason.reasonSegmentId)
    : undefined;
  const reviewAnchor = latestKept?.respondedAt ?? currentReason?.startedAt;
  const reviewDueAt =
    currentReason && reviewAnchor
      ? addMinutesIso(
          reviewAnchor,
          findReviewIntervalMinutes(settings, currentReason.categoryId, currentReason.detailId),
        )
      : undefined;

  return {
    segments,
    currentReason,
    reviewDueAt,
    isReviewDue: Boolean(reviewDueAt && nowIso >= reviewDueAt),
    reviewResponseTelemetry,
    isLocked: apuEvent.state === "closed",
  };
};
