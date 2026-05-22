import { describe, expect, it } from "vitest";
import { buildEventId, buildIdempotencyKey } from "@/lib/events";
import type {
  DomainEvent,
  EventEnvelope,
  ReasonChangedPayload,
  ReasonKeptPayload,
  ReasonSelectedPayload,
} from "@/lib/events";
import { reasonTaxonomySettings } from "@/lib/fixtures/reference/reason-taxonomy";
import type { DerivedApuEvent } from "./apu-reducer";
import { deriveReasonChain } from "./reason-chain-reducer";

const apuEvent: DerivedApuEvent = {
  apuEventId: "BNE:VH-8IA:apu:2026-05-22T08:37:00.000Z",
  tail: "VH-8IA",
  port: "BNE",
  startedAt: "2026-05-22T08:37:00.000Z",
  endedAt: undefined,
  state: "open",
  closureType: "open",
  closureConfidence: undefined,
  closureReason: undefined,
  closureSourceEventIds: [],
  sourceEventIds: ["apu-on"],
};

const settings = reasonTaxonomySettings.payload.snapshot;

const envelope = <TEvent extends DomainEvent["eventType"], TPayload>(
  eventType: TEvent,
  payload: TPayload,
  occurredAt: string,
): EventEnvelope<TPayload> & { eventType: TEvent } => {
  const sourceEventId = `${eventType}:${occurredAt}`;

  return {
    eventId: buildEventId(eventType, "BNE", apuEvent.tail, occurredAt),
    eventType,
    eventVersion: 1,
    sourceSystem: "APU_APP",
    sourceEventId,
    occurredAt,
    receivedAt: occurredAt,
    correlation: {
      port: "BNE",
      tail: apuEvent.tail,
      apuEventId: apuEvent.apuEventId,
      idempotencyKey: buildIdempotencyKey("APU_APP", sourceEventId),
    },
    quality: {
      confidence: "high",
      idempotencyKey: buildIdempotencyKey("APU_APP", sourceEventId),
    },
    payload,
  };
};

const reasonSelected = (occurredAt = "2026-05-22T08:45:00.000Z") =>
  envelope<"reason_selected", ReasonSelectedPayload>(
    "reason_selected",
    {
      apuEventId: apuEvent.apuEventId,
      reasonSegmentId: "reason:VH-8IA:001",
      categoryId: "cleaning-in-progress",
      categoryLabel: "Cleaning in progress",
      detailId: "cleaner-onboard",
      detailLabel: "Cleaner onboard",
      selectedBy: "senior-engineer-bne",
      selectedAt: occurredAt,
      sourceAction: "select_reason",
    },
    occurredAt,
  );

describe("deriveReasonChain", () => {
  it("creates the current segment from the first reason", () => {
    const chain = deriveReasonChain(
      apuEvent,
      [reasonSelected()],
      settings,
      "2026-05-22T09:00:00.000Z",
    );

    expect(chain.segments).toEqual([
      expect.objectContaining({
        reasonSegmentId: "reason:VH-8IA:001",
        categoryId: "cleaning-in-progress",
        detailId: "cleaner-onboard",
        startedAt: "2026-05-22T08:45:00.000Z",
        endedAt: undefined,
      }),
    ]);
    expect(chain.currentReason).toEqual(
      expect.objectContaining({
        categoryLabel: "Cleaning in progress",
        detailLabel: "Cleaner onboard",
      }),
    );
  });

  it("closes the previous segment and opens the changed reason", () => {
    const changedAt = "2026-05-22T09:05:00.000Z";
    const reasonChanged = envelope<"reason_changed", ReasonChangedPayload>(
      "reason_changed",
      {
        apuEventId: apuEvent.apuEventId,
        previousReasonSegmentId: "reason:VH-8IA:001",
        previousCategoryId: "cleaning-in-progress",
        previousDetailId: "cleaner-onboard",
        reasonSegmentId: "reason:VH-8IA:002",
        categoryId: "engineering-requirement",
        categoryLabel: "Engineering requirement",
        detailId: "maintenance-task-in-progress",
        detailLabel: "Maintenance task in progress",
        selectedBy: "senior-engineer-bne",
        selectedAt: changedAt,
        sourceAction: "change_reason",
      },
      changedAt,
    );

    const chain = deriveReasonChain(
      apuEvent,
      [reasonSelected(), reasonChanged],
      settings,
      "2026-05-22T09:10:00.000Z",
    );

    expect(chain.segments).toEqual([
      expect.objectContaining({
        reasonSegmentId: "reason:VH-8IA:001",
        endedAt: changedAt,
      }),
      expect.objectContaining({
        reasonSegmentId: "reason:VH-8IA:002",
        categoryId: "engineering-requirement",
        startedAt: changedAt,
        endedAt: undefined,
      }),
    ]);
  });

  it("records kept review telemetry without creating a visible segment", () => {
    const keptAt = "2026-05-22T09:15:00.000Z";
    const reasonKept = envelope<"reason_kept", ReasonKeptPayload>(
      "reason_kept",
      {
        apuEventId: apuEvent.apuEventId,
        reasonSegmentId: "reason:VH-8IA:001",
        categoryId: "cleaning-in-progress",
        detailId: "cleaner-onboard",
        keptBy: "senior-engineer-bne",
        keptAt,
        reviewDueAt: "2026-05-22T09:15:00.000Z",
      },
      keptAt,
    );

    const chain = deriveReasonChain(
      apuEvent,
      [reasonSelected(), reasonKept],
      settings,
      "2026-05-22T09:16:00.000Z",
    );

    expect(chain.segments).toHaveLength(1);
    expect(chain.reviewResponseTelemetry).toEqual([
      expect.objectContaining({
        reasonSegmentId: "reason:VH-8IA:001",
        responseType: "kept",
        respondedAt: keptAt,
      }),
    ]);
  });

  it("derives review due state from the current segment and configured interval", () => {
    const chain = deriveReasonChain(
      apuEvent,
      [reasonSelected()],
      settings,
      "2026-05-22T09:16:00.000Z",
    );

    expect(chain.reviewDueAt).toBe("2026-05-22T09:15:00.000Z");
    expect(chain.isReviewDue).toBe(true);
  });

  it("locks the current segment when the APU event is closed", () => {
    const closedApuEvent: DerivedApuEvent = {
      ...apuEvent,
      endedAt: "2026-05-22T09:22:00.000Z",
      state: "closed",
      closureType: "source_off",
      closureConfidence: "high",
    };

    const chain = deriveReasonChain(
      closedApuEvent,
      [reasonSelected()],
      settings,
      "2026-05-22T09:30:00.000Z",
    );

    expect(chain.isLocked).toBe(true);
    expect(chain.segments[0]).toEqual(
      expect.objectContaining({
        endedAt: "2026-05-22T09:22:00.000Z",
      }),
    );
  });
});
