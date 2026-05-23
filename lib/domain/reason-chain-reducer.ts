import type { DomainEvent, ReasonTaxonomySnapshot } from "@/lib/events";
import type { DerivedApuEvent } from "./apu-reducer";
import { matchesApuEventId } from "./ids";
import { findCurrentOpenSegment } from "./reason-chain-segments";
import { isReasonEvent, replayReasonEvents } from "./reason-chain-replay";
import {
  closeSegmentsForClosedApuEvent,
  deriveReasonReviewState,
} from "./reason-chain-review";
import { compareEventTime } from "./time";
import type { ReasonEvent, ReasonChainState } from "./reason-chain-types";

export type {
  ReasonSegment,
  ReviewResponseTelemetry,
  ReasonChainState,
} from "./reason-chain-types";

const hasApuEventId = (event: DomainEvent): event is DomainEvent & { payload: { apuEventId: string } } =>
  "apuEventId" in event.payload && typeof event.payload.apuEventId === "string";

const matchesApuEvent = (event: DomainEvent, apuEvent: DerivedApuEvent) => {
  if (!hasApuEventId(event)) {
    return false;
  }

  return matchesApuEventId(event.payload.apuEventId, apuEvent);
};

const occursWithinApuEventWindow = (event: ReasonEvent, apuEvent: DerivedApuEvent) =>
  event.occurredAt >= apuEvent.startedAt && (!apuEvent.endedAt || event.occurredAt <= apuEvent.endedAt);

const reasonEventsForApuEvent = (
  domainEvents: readonly DomainEvent[],
  apuEvent: DerivedApuEvent,
) =>
  domainEvents
    .filter(isReasonEvent)
    .filter((event) => matchesApuEvent(event, apuEvent))
    .filter((event) => occursWithinApuEventWindow(event, apuEvent))
    .sort(compareEventTime);

export const deriveReasonChain = (
  apuEvent: DerivedApuEvent,
  domainEvents: readonly DomainEvent[],
  settings: ReasonTaxonomySnapshot,
  nowIso: string,
): ReasonChainState => {
  const replayState = replayReasonEvents(reasonEventsForApuEvent(domainEvents, apuEvent));
  const segments = closeSegmentsForClosedApuEvent(replayState.segments, apuEvent.endedAt);
  const { reviewResponseTelemetry } = replayState;
  const currentReason = apuEvent.state === "open" ? findCurrentOpenSegment(segments) : undefined;
  const reviewState = deriveReasonReviewState(
    currentReason,
    reviewResponseTelemetry,
    settings,
    nowIso,
  );

  return {
    segments,
    currentReason,
    ...reviewState,
    reviewResponseTelemetry,
    isLocked: apuEvent.state === "closed",
  };
};
