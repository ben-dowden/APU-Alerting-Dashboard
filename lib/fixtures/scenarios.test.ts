import { describe, expect, it } from "vitest";
import { bneScenarios } from "./scenarios";

const isSortedBy = (events: { [key: string]: string }[], field: "receivedAt" | "occurredAt") =>
  events.every((event, index) => index === 0 || event[field] >= events[index - 1][field]);

describe("BNE scenario fixtures", () => {
  it("includes the expected scenario pack", () => {
    expect(bneScenarios.map((scenario) => scenario.id)).toEqual([
      "bne-baseline",
      "bne-acms-lag",
      "bne-manual-off-confirmed",
      "bne-manual-off-contradicted",
      "bne-equipment-mismatch",
      "bne-missing-burn-assumption",
      "bne-stale-stand-assignment",
    ]);
  });

  it.each(bneScenarios)("$id has core replay source events", (scenario) => {
    const eventTypes = scenario.events.map((event) => event.eventType);

    expect(eventTypes).toContain("flight_state_event");
    expect(eventTypes).toContain("stand_assignment_event");
    expect(eventTypes).toContain("apu_state_event");
  });

  it.each(bneScenarios)("$id has deterministic replay ordering", (scenario) => {
    expect(isSortedBy(scenario.events, "receivedAt") || isSortedBy(scenario.events, "occurredAt")).toBe(
      true,
    );
  });

  it.each(bneScenarios)("$id has unique event ids", (scenario) => {
    const eventIds = scenario.events.map((event) => event.eventId);

    expect(new Set(eventIds).size).toBe(eventIds.length);
  });

  it.each(bneScenarios)("$id has port correlation and idempotency metadata", (scenario) => {
    expect(
      scenario.events.every(
        (event) =>
          event.correlation.port === "BNE" &&
          Boolean(event.quality.idempotencyKey || event.correlation.idempotencyKey),
      ),
    ).toBe(true);
  });
});
