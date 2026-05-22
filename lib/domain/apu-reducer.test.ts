import { describe, expect, it } from "vitest";
import { apuStateEvent, flightStateEvent } from "@/lib/fixtures/scenarios/builders";
import { deriveApuEvents } from "./apu-reducer";

describe("deriveApuEvents", () => {
  it("opens an APU event on an on transition", () => {
    const events = [
      apuStateEvent({
        tail: "VH-8IA",
        state: "on",
        occurredAt: "2026-05-22T08:37:00.000Z",
        receivedAt: "2026-05-22T08:37:30.000Z",
        sourceEventId: "ACMS-VH8IA-ON-0837",
      }),
    ];

    expect(deriveApuEvents(events)).toEqual([
      expect.objectContaining({
        apuEventId: "BNE:VH-8IA:apu:2026-05-22T08:37:00.000Z",
        tail: "VH-8IA",
        port: "BNE",
        startedAt: "2026-05-22T08:37:00.000Z",
        endedAt: undefined,
        state: "open",
        closureType: "open",
        closureConfidence: undefined,
        sourceEventIds: ["apu_state_event:BNE:VH-8IA:2026-05-22T08:37:00.000Z"],
      }),
    ]);
  });

  it("closes an APU event on an off transition using occurredAt", () => {
    const events = [
      apuStateEvent({
        tail: "VH-8IA",
        state: "on",
        occurredAt: "2026-05-22T08:37:00.000Z",
        receivedAt: "2026-05-22T08:37:30.000Z",
        sourceEventId: "ACMS-VH8IA-ON-0837",
      }),
      apuStateEvent({
        tail: "VH-8IA",
        state: "off",
        occurredAt: "2026-05-22T09:02:00.000Z",
        receivedAt: "2026-05-22T09:03:00.000Z",
        sourceEventId: "ACMS-VH8IA-OFF-0902",
      }),
    ];

    expect(deriveApuEvents(events)[0]).toEqual(
      expect.objectContaining({
        endedAt: "2026-05-22T09:02:00.000Z",
        state: "closed",
        closureType: "source_off",
        closureConfidence: "high",
        closureReason: "Trusted ACMS APU-off transition",
        closureSourceEventIds: ["apu_state_event:BNE:VH-8IA:2026-05-22T09:02:00.000Z"],
      }),
    );
  });

  it("ignores duplicate same-state messages", () => {
    const events = [
      apuStateEvent({
        tail: "VH-8IA",
        state: "on",
        occurredAt: "2026-05-22T08:37:00.000Z",
        receivedAt: "2026-05-22T08:37:30.000Z",
        sourceEventId: "ACMS-VH8IA-ON-0837",
      }),
      apuStateEvent({
        tail: "VH-8IA",
        state: "on",
        occurredAt: "2026-05-22T08:42:00.000Z",
        receivedAt: "2026-05-22T08:42:20.000Z",
        sourceEventId: "ACMS-VH8IA-ON-0842",
      }),
    ];

    const apuEvents = deriveApuEvents(events);

    expect(apuEvents).toHaveLength(1);
    expect(apuEvents[0]).toEqual(
      expect.objectContaining({
        startedAt: "2026-05-22T08:37:00.000Z",
        endedAt: undefined,
        state: "open",
      }),
    );
  });

  it("replays late off messages by source timestamp", () => {
    const events = [
      apuStateEvent({
        tail: "VH-8IA",
        state: "off",
        occurredAt: "2026-05-22T09:02:00.000Z",
        receivedAt: "2026-05-22T09:30:00.000Z",
        sourceEventId: "ACMS-VH8IA-OFF-LATE",
        sourceLatencyMinutes: 28,
      }),
      apuStateEvent({
        tail: "VH-8IA",
        state: "on",
        occurredAt: "2026-05-22T08:37:00.000Z",
        receivedAt: "2026-05-22T08:37:30.000Z",
        sourceEventId: "ACMS-VH8IA-ON-0837",
      }),
    ];

    expect(deriveApuEvents(events)[0]?.endedAt).toBe("2026-05-22T09:02:00.000Z");
  });

  it("derives low-confidence inferred closure from departed flight state when explicit off is absent", () => {
    const events = [
      apuStateEvent({
        tail: "VH-8IA",
        state: "on",
        occurredAt: "2026-05-22T08:37:00.000Z",
        receivedAt: "2026-05-22T08:37:30.000Z",
        sourceEventId: "ACMS-VH8IA-ON-0837",
      }),
      flightStateEvent({
        tail: "VH-8IA",
        aircraftType: "B738",
        flightNumber: "VA327",
        gateState: "departed",
        onGroundAt: "2026-05-22T08:14:00.000Z",
        offGroundAt: "2026-05-22T09:18:00.000Z",
        occurredAt: "2026-05-22T09:18:00.000Z",
        receivedAt: "2026-05-22T09:18:15.000Z",
        sourceEventId: "AIMS-VH8IA-DEPARTED-0918",
      }),
    ];

    expect(deriveApuEvents(events)[0]).toEqual(
      expect.objectContaining({
        endedAt: "2026-05-22T09:18:00.000Z",
        state: "closed",
        closureType: "inferred_departed",
        closureConfidence: "low",
        closureReason: "Inferred from departed flight state without trusted APU-off transition",
        closureSourceEventIds: ["flight_state_event:BNE:VH-8IA:2026-05-22T09:18:00.000Z"],
      }),
    );
  });
});
