import { beforeEach, describe, expect, it } from "vitest";

import { readWorkflowEvents, clearWorkflowEvents } from "./workflow-event-store";
import { buildSelectReasonEvent } from "./workflow-event-builders";

const reason = {
  categoryId: "cleaning-in-progress",
  categoryLabel: "Cleaning in progress",
  detailId: "cleaner-onboard",
  detailLabel: "Cleaner onboard",
};

const baseInput = {
  port: "BNE",
  tail: "VH-8IA",
  apuEventId: "BNE:VH-8IA:apu:2026-05-22T08:37:00.000Z",
} as const;

describe("workflow event builders", () => {
  beforeEach(() => {
    clearWorkflowEvents();
    localStorage.clear();
  });

  it("builds a reason-selected event without appending it", () => {
    const event = buildSelectReasonEvent(
      {
        ...baseInput,
        ...reason,
        selectedBy: "senior-engineer-bne",
      },
      () => "2026-05-22T08:45:00.000Z",
    );

    expect(event).toEqual(
      expect.objectContaining({
        eventId: "reason_selected:BNE:reason:VH-8IA:2026-05-22T08:45:00.000Z:2026-05-22T08:45:00.000Z",
        eventType: "reason_selected",
        occurredAt: "2026-05-22T08:45:00.000Z",
      }),
    );
    expect(event.payload).toEqual({
      ...reason,
      apuEventId: baseInput.apuEventId,
      reasonSegmentId: "reason:VH-8IA:2026-05-22T08:45:00.000Z",
      selectedBy: "senior-engineer-bne",
      selectedAt: "2026-05-22T08:45:00.000Z",
      sourceAction: "select_reason",
    });
    expect(readWorkflowEvents()).toEqual([]);
  });
});
