import type { ReasonChangedEvent, ReasonSelectedEvent } from "@/lib/events";

import type { ReasonSegment } from "./reason-chain-types";

const reasonEventTimestamp = (event: ReasonSelectedEvent | ReasonChangedEvent) =>
  event.payload.selectedAt || event.occurredAt;

export const createReasonSegment = (
  event: ReasonSelectedEvent | ReasonChangedEvent,
): ReasonSegment => ({
  reasonSegmentId: event.payload.reasonSegmentId,
  apuEventId: event.payload.apuEventId,
  categoryId: event.payload.categoryId,
  categoryLabel: event.payload.categoryLabel,
  detailId: event.payload.detailId,
  detailLabel: event.payload.detailLabel,
  startedAt: reasonEventTimestamp(event),
  endedAt: undefined,
  selectedBy: event.payload.selectedBy,
  sourceEventIds: [event.eventId],
});

const closeSegment = (segment: ReasonSegment, endedAt: string): ReasonSegment =>
  segment.endedAt ? segment : { ...segment, endedAt };

export const closeSegmentAt = (
  segments: ReasonSegment[],
  index: number,
  endedAt: string,
) =>
  segments.map((segment, segmentIndex) =>
    segmentIndex === index ? closeSegment(segment, endedAt) : segment,
  );

export const findCurrentOpenSegment = (segments: ReasonSegment[]) => {
  for (let index = segments.length - 1; index >= 0; index -= 1) {
    if (!segments[index].endedAt) {
      return segments[index];
    }
  }

  return undefined;
};

export const correctReasonSegment = (
  segments: ReasonSegment[],
  event: ReasonChangedEvent,
) =>
  segments.map((segment) =>
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
  );

export const appendChangedReasonSegment = (
  segments: ReasonSegment[],
  event: ReasonChangedEvent,
) => {
  const changedAt = reasonEventTimestamp(event);
  const previousIndex = segments.findIndex(
    (segment) => segment.reasonSegmentId === event.payload.previousReasonSegmentId,
  );
  const fallbackIndex = segments.length - 1;
  const segmentIndexToClose = previousIndex >= 0 ? previousIndex : fallbackIndex;
  const nextSegment = createReasonSegment(event);

  return segmentIndexToClose >= 0
    ? [...closeSegmentAt(segments, segmentIndexToClose, changedAt), nextSegment]
    : [nextSegment];
};
