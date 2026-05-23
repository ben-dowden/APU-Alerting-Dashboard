import type {
  ReasonChangedEvent,
  ReasonKeptEvent,
  ReasonSelectedEvent,
  ReviewResolvedEvent,
} from "@/lib/events";

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

export type ReasonEvent =
  | ReasonSelectedEvent
  | ReasonChangedEvent
  | ReasonKeptEvent
  | ReviewResolvedEvent;

export type ReasonChainAccumulator = {
  segments: ReasonSegment[];
  reviewResponseTelemetry: ReviewResponseTelemetry[];
};
