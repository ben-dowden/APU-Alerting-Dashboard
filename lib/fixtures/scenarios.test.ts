import { describe, expect, it } from "vitest";
import { bneScenarios, type ScenarioEvent } from "./scenarios";
import { bneScenarioContext, reasonSelectedEvent, standAssignmentEvent } from "./scenarios/builders";

const isSortedBy = (
  events: Array<Pick<ScenarioEvent, "receivedAt" | "occurredAt">>,
  field: "receivedAt" | "occurredAt",
) =>
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

  it("applies shared BNE defaults in scenario builders", () => {
    const standEvent = standAssignmentEvent({
      tail: "VH-8IA",
      bay: "Bay 17",
      stand: "17",
      assignmentState: "current",
      validFrom: "2026-05-22T08:00:00.000Z",
      occurredAt: "2026-05-22T08:00:00.000Z",
      receivedAt: "2026-05-22T08:01:00.000Z",
      sourceEventId: "BNE-STAND-DEFAULTS",
    });
    const reasonEvent = reasonSelectedEvent({
      tail: "VH-8IA",
      apuEventId: "BNE:VH-8IA:apu:2026-05-22T08:37:00.000Z",
      reasonSegmentId: "segment-1",
      categoryId: "cleaning",
      categoryLabel: "Cleaning in progress",
      detailId: "cleaner-onboard",
      detailLabel: "Cleaner onboard",
      selectedBy: "se-user",
      occurredAt: "2026-05-22T08:45:00.000Z",
      receivedAt: "2026-05-22T08:45:05.000Z",
      sourceEventId: "REASON-DEFAULTS",
    });

    expect(standEvent).toEqual(
      expect.objectContaining({
        sourceSystem: bneScenarioContext.sourceSystems.standPlan,
        correlation: expect.objectContaining({ port: bneScenarioContext.port }),
        payload: expect.objectContaining({
          port: bneScenarioContext.port,
          terminal: bneScenarioContext.terminal,
        }),
      }),
    );
    expect(reasonEvent).toEqual(
      expect.objectContaining({
        sourceSystem: bneScenarioContext.sourceSystems.app,
        payload: expect.objectContaining({
          sourceAction: bneScenarioContext.sourceActions.selectReason,
        }),
      }),
    );
  });
});
