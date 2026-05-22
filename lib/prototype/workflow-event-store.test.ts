import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import type { DomainEvent } from "@/lib/events";
import {
  appendWorkflowEvent,
  clearWorkflowEvents,
  readWorkflowEvents,
  WORKFLOW_EVENT_STORAGE_KEY,
} from "./workflow-event-store";

const event = (eventId: string): DomainEvent => ({
  eventId,
  eventType: "reason_selected",
  eventVersion: 1,
  sourceSystem: "APU_APP",
  sourceEventId: eventId,
  occurredAt: "2026-05-22T08:10:00.000Z",
  receivedAt: "2026-05-22T08:10:00.000Z",
  correlation: {
    port: "BNE",
    tail: "VH-8IA",
    apuEventId: "apu:VH-8IA:2026-05-22T08:00:00.000Z",
    idempotencyKey: `APU_APP:${eventId}`,
  },
  quality: {
    confidence: "high",
    idempotencyKey: `APU_APP:${eventId}`,
  },
  payload: {
    apuEventId: "apu:VH-8IA:2026-05-22T08:00:00.000Z",
    reasonSegmentId: "reason-segment-1",
    categoryId: "cleaning-in-progress",
    categoryLabel: "Cleaning in progress",
    detailId: "cleaner-onboard",
    detailLabel: "Cleaner onboard",
    selectedBy: "senior-bne",
    selectedAt: "2026-05-22T08:10:00.000Z",
    sourceAction: "select_reason",
  },
});

describe("workflow event store", () => {
  beforeEach(() => {
    clearWorkflowEvents();
    localStorage.clear();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    clearWorkflowEvents();
    localStorage.clear();
  });

  it("appends and lists workflow events in order", () => {
    appendWorkflowEvent(event("workflow-1"));
    appendWorkflowEvent(event("workflow-2"));

    expect(readWorkflowEvents().map((workflowEvent) => workflowEvent.eventId)).toEqual([
      "workflow-1",
      "workflow-2",
    ]);
  });

  it("clears workflow events from memory and localStorage", () => {
    appendWorkflowEvent(event("workflow-1"));

    clearWorkflowEvents();

    expect(readWorkflowEvents()).toEqual([]);
    expect(localStorage.getItem(WORKFLOW_EVENT_STORAGE_KEY)).toBeNull();
  });

  it("hydrates events from localStorage", () => {
    localStorage.setItem(WORKFLOW_EVENT_STORAGE_KEY, JSON.stringify([event("hydrated")]));

    expect(readWorkflowEvents()).toHaveLength(1);
    expect(readWorkflowEvents()[0].eventId).toBe("hydrated");
  });

  it("ignores stored entries that are not domain events", () => {
    localStorage.setItem(
      WORKFLOW_EVENT_STORAGE_KEY,
      JSON.stringify([
        event("hydrated"),
        { eventId: "not-a-domain-event", eventType: "flight_state_event" },
        { eventId: "missing-type" },
      ]),
    );

    expect(readWorkflowEvents().map((workflowEvent) => workflowEvent.eventId)).toEqual([
      "hydrated",
    ]);
  });

  it("ignores malformed localStorage JSON", () => {
    localStorage.setItem(WORKFLOW_EVENT_STORAGE_KEY, "{not-json");

    expect(readWorkflowEvents()).toEqual([]);
  });

  it("uses an in-memory fallback when localStorage is unavailable", () => {
    clearWorkflowEvents();
    vi.stubGlobal("localStorage", undefined);

    appendWorkflowEvent(event("memory-only"));

    expect(readWorkflowEvents().map((workflowEvent) => workflowEvent.eventId)).toEqual([
      "memory-only",
    ]);
  });
});
