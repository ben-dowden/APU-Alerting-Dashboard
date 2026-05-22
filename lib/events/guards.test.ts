import { describe, expect, it } from "vitest";
import { domainEventTypes } from "./domain-events";
import type { EventEnvelope } from "./envelope";
import { isApuStateEvent, isDomainEvent, isSourceEvent } from "./guards";
import { sourceEventTypes } from "./source-events";

const envelope = <TPayload>(
  eventType: string,
  payload: TPayload,
): EventEnvelope<TPayload> => ({
  eventId: `${eventType}:BNE:VH-8IA:2026-05-22T00:00:00.000Z`,
  eventType,
  eventVersion: 1,
  sourceSystem: eventType === "reason_selected" ? "APU_APP" : "ACMS",
  sourceEventId: "MSG-1",
  occurredAt: "2026-05-22T00:00:00.000Z",
  receivedAt: "2026-05-22T00:00:30.000Z",
  correlation: {
    port: "BNE",
    tail: "VH-8IA",
    idempotencyKey: "ACMS:MSG-1",
  },
  quality: {
    confidence: "high",
    idempotencyKey: "ACMS:MSG-1",
  },
  payload,
});

describe("event guards", () => {
  it.each(sourceEventTypes)("identifies registered source event type %s", (eventType) => {
    expect(isSourceEvent(envelope(eventType, {}))).toBe(true);
  });

  it.each(domainEventTypes)("identifies registered domain event type %s", (eventType) => {
    expect(isDomainEvent(envelope(eventType, {}))).toBe(true);
  });

  it("identifies source events by event family", () => {
    expect(isSourceEvent(envelope("apu_state_event", { state: "on" }))).toBe(true);
    expect(isSourceEvent(envelope("reason_selected", { detailId: "cleaning" }))).toBe(false);
    expect(isSourceEvent(envelope("unknown_event", {}))).toBe(false);
  });

  it("identifies domain events by event family", () => {
    expect(isDomainEvent(envelope("reason_selected", { detailId: "cleaning" }))).toBe(true);
    expect(isDomainEvent(envelope("apu_state_event", { state: "on" }))).toBe(false);
    expect(isDomainEvent(envelope("unknown_event", {}))).toBe(false);
  });

  it("identifies only valid APU state transition events", () => {
    expect(isApuStateEvent(envelope("apu_state_event", { state: "on" }))).toBe(true);
    expect(isApuStateEvent(envelope("apu_state_event", { state: "off" }))).toBe(true);
    expect(isApuStateEvent(envelope("apu_state_event", { state: "unknown" }))).toBe(false);
    expect(isApuStateEvent(envelope("reason_selected", { state: "on" }))).toBe(false);
  });
});
