import { describe, expect, it } from "vitest";
import { addMinutesIso, compareEventTime, compareIsoStrings, minutesBetweenIso } from "./time";

describe("time helpers", () => {
  it("calculates whole elapsed minutes between ISO timestamps", () => {
    expect(minutesBetweenIso("2026-05-22T08:00:00.000Z", "2026-05-22T08:46:30.000Z")).toBe(46);
  });

  it("does not return negative elapsed minutes", () => {
    expect(minutesBetweenIso("2026-05-22T08:46:00.000Z", "2026-05-22T08:00:00.000Z")).toBe(0);
  });

  it("adds minutes to an ISO timestamp", () => {
    expect(addMinutesIso("2026-05-22T08:45:00.000Z", 30)).toBe("2026-05-22T09:15:00.000Z");
  });

  it("sorts event-like records by occurredAt, receivedAt, then eventId", () => {
    const events = [
      { occurredAt: "2026-05-22T08:00:00.000Z", receivedAt: "2026-05-22T08:02:00.000Z", eventId: "b" },
      { occurredAt: "2026-05-22T08:00:00.000Z", receivedAt: "2026-05-22T08:01:00.000Z", eventId: "c" },
      { occurredAt: "2026-05-22T08:00:00.000Z", receivedAt: "2026-05-22T08:01:00.000Z", eventId: "a" },
    ];

    expect([...events].sort(compareEventTime).map((event) => event.eventId)).toEqual(["a", "c", "b"]);
  });

  it("compares ISO strings directly for deterministic sorting", () => {
    expect(["2026-05-22T08:10:00.000Z", "2026-05-22T08:00:00.000Z"].sort(compareIsoStrings)).toEqual([
      "2026-05-22T08:00:00.000Z",
      "2026-05-22T08:10:00.000Z",
    ]);
  });
});
