import type { DomainEvent, ReasonChangedEvent, ReviewResolvedEvent } from "@/lib/events";

import {
  appendChangedReasonSegment,
  correctReasonSegment,
  createReasonSegment,
} from "./reason-chain-segments";
import type {
  ReasonChainAccumulator,
  ReasonEvent,
  ReviewResponseTelemetry,
} from "./reason-chain-types";

const emptyReasonChainAccumulator = (): ReasonChainAccumulator => ({
  segments: [],
  reviewResponseTelemetry: [],
});

export const isReasonEvent = (event: DomainEvent): event is ReasonEvent => {
  switch (event.eventType) {
    case "reason_selected":
    case "reason_changed":
    case "reason_kept":
    case "review_resolved":
      return true;
    default:
      return false;
  }
};

const keepFirstReasonSegment = (
  state: ReasonChainAccumulator,
  event: Extract<ReasonEvent, { eventType: "reason_selected" }>,
): ReasonChainAccumulator =>
  state.segments.length === 0 ? { ...state, segments: [createReasonSegment(event)] } : state;

const changeReasonSegment = (
  state: ReasonChainAccumulator,
  event: ReasonChangedEvent,
): ReasonChainAccumulator => ({
  ...state,
  segments:
    event.payload.sourceAction === "correct_reason"
      ? correctReasonSegment(state.segments, event)
      : appendChangedReasonSegment(state.segments, event),
});

const appendReviewTelemetry = (
  state: ReasonChainAccumulator,
  telemetry: ReviewResponseTelemetry,
): ReasonChainAccumulator => ({
  ...state,
  reviewResponseTelemetry: [...state.reviewResponseTelemetry, telemetry],
});

const reviewResponseTypeByResolution: Record<
  ReviewResolvedEvent["payload"]["resolutionType"],
  ReviewResponseTelemetry["responseType"]
> = {
  kept_current_reason: "kept",
  changed_reason: "changed",
  dismissed: "dismissed",
};

const recordKeptReview = (
  state: ReasonChainAccumulator,
  event: Extract<ReasonEvent, { eventType: "reason_kept" }>,
): ReasonChainAccumulator =>
  appendReviewTelemetry(state, {
    reasonSegmentId: event.payload.reasonSegmentId,
    responseType: "kept",
    reviewDueAt: event.payload.reviewDueAt,
    respondedAt: event.payload.keptAt,
    respondedBy: event.payload.keptBy,
    sourceEventId: event.eventId,
  });

const recordResolvedReview = (
  state: ReasonChainAccumulator,
  event: ReviewResolvedEvent,
): ReasonChainAccumulator =>
  appendReviewTelemetry(state, {
    reasonSegmentId: event.payload.reasonSegmentId,
    responseType: reviewResponseTypeByResolution[event.payload.resolutionType],
    reviewDueAt: event.payload.reviewDueAt,
    respondedAt: event.payload.reviewResolvedAt,
    respondedBy: event.payload.resolvedBy,
    sourceEventId: event.eventId,
  });

const applyReasonEvent = (
  state: ReasonChainAccumulator,
  event: ReasonEvent,
): ReasonChainAccumulator => {
  switch (event.eventType) {
    case "reason_selected":
      return keepFirstReasonSegment(state, event);
    case "reason_changed":
      return changeReasonSegment(state, event);
    case "reason_kept":
      return recordKeptReview(state, event);
    case "review_resolved":
      return recordResolvedReview(state, event);
  }
};

export const replayReasonEvents = (
  reasonEvents: readonly ReasonEvent[],
): ReasonChainAccumulator =>
  reasonEvents.reduce(applyReasonEvent, emptyReasonChainAccumulator());
