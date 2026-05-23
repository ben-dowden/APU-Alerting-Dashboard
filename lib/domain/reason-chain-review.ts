import type { ReasonTaxonomySnapshot } from "@/lib/events";

import { addMinutesIso } from "./time";
import { closeSegmentAt } from "./reason-chain-segments";
import type { ReasonSegment, ReviewResponseTelemetry } from "./reason-chain-types";

export type ReviewState = {
  reviewDueAt?: string;
  isReviewDue: boolean;
};

const latestKeptTelemetryForSegment = (
  telemetry: ReviewResponseTelemetry[],
  reasonSegmentId: string,
) =>
  telemetry
    .filter((entry) => entry.reasonSegmentId === reasonSegmentId && entry.responseType === "kept")
    .sort((left, right) => right.respondedAt.localeCompare(left.respondedAt))[0];

const findReviewIntervalMinutes = (
  settings: ReasonTaxonomySnapshot,
  categoryId: string,
  detailId: string,
) => {
  const category = settings.categories.find((candidate) => candidate.id === categoryId);
  const detail = category?.details.find((candidate) => candidate.id === detailId);
  return detail?.reviewIntervalMinutes ?? settings.defaultReviewIntervalMinutes;
};

export const closeSegmentsForClosedApuEvent = (
  segments: ReasonSegment[],
  endedAt: string | undefined,
) => (endedAt ? closeSegmentAt(segments, segments.length - 1, endedAt) : segments);

export const deriveReasonReviewState = (
  currentReason: ReasonSegment | undefined,
  reviewResponseTelemetry: ReviewResponseTelemetry[],
  settings: ReasonTaxonomySnapshot,
  nowIso: string,
): ReviewState => {
  if (!currentReason) {
    return {
      reviewDueAt: undefined,
      isReviewDue: false,
    };
  }

  const latestKept = latestKeptTelemetryForSegment(
    reviewResponseTelemetry,
    currentReason.reasonSegmentId,
  );
  const reviewAnchor = latestKept?.respondedAt ?? currentReason.startedAt;
  const reviewDueAt = addMinutesIso(
    reviewAnchor,
    findReviewIntervalMinutes(settings, currentReason.categoryId, currentReason.detailId),
  );

  return {
    reviewDueAt,
    isReviewDue: nowIso >= reviewDueAt,
  };
};
