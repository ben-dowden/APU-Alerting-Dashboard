import { cleanup, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

import type { DomainEvent } from "@/lib/events";
import {
  clearWorkflowEvents,
  WORKFLOW_EVENT_STORAGE_KEY,
} from "./workflow-event-store";
import { useWorkflowEvents } from "./use-workflow-events";

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

function WorkflowEventsProbe({
  onRender,
}: {
  onRender: (eventIds: string[]) => void;
}) {
  const workflowEvents = useWorkflowEvents();
  const eventIds = workflowEvents.map((workflowEvent) => workflowEvent.eventId);

  onRender(eventIds);

  return <div>{eventIds.join(",") || "empty"}</div>;
}

describe("useWorkflowEvents", () => {
  beforeEach(() => {
    clearWorkflowEvents();
    localStorage.clear();
  });

  afterEach(() => {
    cleanup();
    clearWorkflowEvents();
    localStorage.clear();
  });

  it("defers stored workflow events until after the first render", async () => {
    localStorage.setItem(WORKFLOW_EVENT_STORAGE_KEY, JSON.stringify([event("hydrated")]));
    const renderSnapshots: string[][] = [];

    render(
      <WorkflowEventsProbe
        onRender={(eventIds) => {
          renderSnapshots.push(eventIds);
        }}
      />,
    );

    expect(renderSnapshots[0]).toEqual([]);
    await waitFor(() => expect(screen.getByText("hydrated")).toBeVisible());
    expect(renderSnapshots.at(-1)).toEqual(["hydrated"]);
  });
});
