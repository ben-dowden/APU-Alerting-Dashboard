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

const reasonEventTypes = new Set<DomainEvent["eventType"]>([
  "reason_selected",
  "reason_changed",
  "reason_kept",
  "review_resolved",
]);

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

const closeSegment = (segment: ReasonSegment | undefined, endedAt: string) => {
  if (segment && !segment.endedAt) {
    segment.endedAt = endedAt;
  }
};

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

export const deriveReasonChain = (
  apuEvent: DerivedApuEvent,
  domainEvents: readonly DomainEvent[],
  settings: ReasonTaxonomySnapshot,
  nowIso: string,
): ReasonChainState => {
  const segments: ReasonSegment[] = [];
  const reviewResponseTelemetry: ReviewResponseTelemetry[] = [];

  const reasonEvents = domainEvents
    .filter((event) => reasonEventTypes.has(event.eventType))
    .filter((event) => matchesApuEvent(event, apuEvent))
    .filter((event) => event.occurredAt >= apuEvent.startedAt)
    .filter((event) => !apuEvent.endedAt || event.occurredAt <= apuEvent.endedAt)
    .sort(compareEventTime);

  for (const event of reasonEvents) {
    if (event.eventType === "reason_selected") {
      if (segments.length === 0) {
        segments.push(createSegment(event));
      }
      continue;
    }

    if (event.eventType === "reason_changed") {
      const changedAt = eventTimestamp(event);
      const previous =
        segments.find((segment) => segment.reasonSegmentId === event.payload.previousReasonSegmentId) ??
        segments.at(-1);

      closeSegment(previous, changedAt);
      segments.push(createSegment(event));
      continue;
    }

    if (event.eventType === "reason_kept") {
      reviewResponseTelemetry.push({
        reasonSegmentId: event.payload.reasonSegmentId,
        responseType: "kept",
        reviewDueAt: event.payload.reviewDueAt,
        respondedAt: event.payload.keptAt,
        respondedBy: event.payload.keptBy,
        sourceEventId: event.eventId,
      });
      continue;
    }

    if (event.eventType === "review_resolved") {
      const resolvedEvent = event as ReviewResolvedEvent;
      reviewResponseTelemetry.push({
        reasonSegmentId: resolvedEvent.payload.reasonSegmentId,
        responseType: reviewResponseTypeByResolution[resolvedEvent.payload.resolutionType],
        reviewDueAt: resolvedEvent.payload.reviewDueAt,
        respondedAt: resolvedEvent.payload.reviewResolvedAt,
        respondedBy: resolvedEvent.payload.resolvedBy,
        sourceEventId: resolvedEvent.eventId,
      });
    }
  }

  if (apuEvent.endedAt) {
    closeSegment(segments.at(-1), apuEvent.endedAt);
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
