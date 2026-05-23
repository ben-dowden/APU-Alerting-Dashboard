import { beforeEach, describe, expect, it } from "vitest";

import { clearWorkflowEvents, readWorkflowEvents } from "./workflow-event-store";
import {
  addReasonNote,
  changeReason,
  createDataQualityFlag,
  correctPreviousReason,
  keepCurrentReason,
  selectReason,
} from "./workflow-actions";

const reason = {
  categoryId: "cleaning-in-progress",
  categoryLabel: "Cleaning in progress",
  detailId: "cleaner-onboard",
  detailLabel: "Cleaner onboard",
};

const nextReason = {
  categoryId: "engineering-requirement",
  categoryLabel: "Engineering requirement",
  detailId: "maintenance-task-in-progress",
  detailLabel: "Maintenance task in progress",
};

const baseInput = {
  port: "BNE",
  tail: "VH-8IA",
  apuEventId: "BNE:VH-8IA:apu:2026-05-22T08:37:00.000Z",
} as const;

describe("workflow actions", () => {
  beforeEach(() => {
    clearWorkflowEvents();
    localStorage.clear();
  });

  it("selectReason emits and appends a reason_selected event", () => {
    const event = selectReason({
      ...baseInput,
      ...reason,
      reasonSegmentId: "reason:VH-8IA:001",
      selectedBy: "senior-engineer-bne",
      selectedAt: "2026-05-22T08:45:00.000Z",
    });

    expect(event).toEqual(
      expect.objectContaining({
        eventId: "reason_selected:BNE:reason:VH-8IA:001:2026-05-22T08:45:00.000Z",
        eventType: "reason_selected",
        eventVersion: 1,
        sourceSystem: "APU_APP",
        occurredAt: "2026-05-22T08:45:00.000Z",
        receivedAt: "2026-05-22T08:45:00.000Z",
      }),
    );
    expect(event.correlation).toEqual(
      expect.objectContaining({
        port: "BNE",
        tail: "VH-8IA",
        apuEventId: baseInput.apuEventId,
        reasonSegmentId: "reason:VH-8IA:001",
      }),
    );
    expect(event.payload).toEqual({
      ...reason,
      apuEventId: baseInput.apuEventId,
      reasonSegmentId: "reason:VH-8IA:001",
      selectedBy: "senior-engineer-bne",
      selectedAt: "2026-05-22T08:45:00.000Z",
      sourceAction: "select_reason",
    });
    expect(readWorkflowEvents()).toEqual([event]);
  });

  it("changeReason emits the previous and next reason fields", () => {
    const event = changeReason({
      ...baseInput,
      ...nextReason,
      previousReasonSegmentId: "reason:VH-8IA:001",
      previousCategoryId: reason.categoryId,
      previousDetailId: reason.detailId,
      reasonSegmentId: "reason:VH-8IA:002",
      selectedBy: "senior-engineer-bne",
      selectedAt: "2026-05-22T09:05:00.000Z",
    });

    expect(event.eventType).toBe("reason_changed");
    expect(event.payload).toEqual({
      ...nextReason,
      apuEventId: baseInput.apuEventId,
      previousReasonSegmentId: "reason:VH-8IA:001",
      previousCategoryId: "cleaning-in-progress",
      previousDetailId: "cleaner-onboard",
      reasonSegmentId: "reason:VH-8IA:002",
      selectedBy: "senior-engineer-bne",
      selectedAt: "2026-05-22T09:05:00.000Z",
      sourceAction: "change_reason",
    });
    expect(readWorkflowEvents()).toEqual([event]);
  });

  it("keepCurrentReason emits a reason_kept event with review timing", () => {
    const event = keepCurrentReason({
      ...baseInput,
      reasonSegmentId: "reason:VH-8IA:001",
      categoryId: reason.categoryId,
      detailId: reason.detailId,
      keptBy: "senior-engineer-bne",
      keptAt: "2026-05-22T09:15:00.000Z",
      reviewDueAt: "2026-05-22T09:15:00.000Z",
    });

    expect(event.eventType).toBe("reason_kept");
    expect(event.payload).toEqual({
      apuEventId: baseInput.apuEventId,
      reasonSegmentId: "reason:VH-8IA:001",
      categoryId: "cleaning-in-progress",
      detailId: "cleaner-onboard",
      keptBy: "senior-engineer-bne",
      keptAt: "2026-05-22T09:15:00.000Z",
      reviewDueAt: "2026-05-22T09:15:00.000Z",
    });
    expect(readWorkflowEvents()).toEqual([event]);
  });

  it("addReasonNote emits a reason_note_added event", () => {
    const event = addReasonNote({
      ...baseInput,
      reasonSegmentId: "reason:VH-8IA:001",
      noteId: "note:VH-8IA:001",
      note: "Cleaner confirmed GPU request is next.",
      addedBy: "senior-engineer-bne",
      addedAt: "2026-05-22T09:18:00.000Z",
    });

    expect(event.eventType).toBe("reason_note_added");
    expect(event.payload).toEqual({
      apuEventId: baseInput.apuEventId,
      reasonSegmentId: "reason:VH-8IA:001",
      noteId: "note:VH-8IA:001",
      note: "Cleaner confirmed GPU request is next.",
      addedBy: "senior-engineer-bne",
      addedAt: "2026-05-22T09:18:00.000Z",
    });
    expect(readWorkflowEvents()).toEqual([event]);
  });

  it("correctPreviousReason emits a correction-shaped reason_changed event", () => {
    const event = correctPreviousReason({
      ...baseInput,
      ...nextReason,
      previousReasonSegmentId: "reason:VH-8IA:001",
      previousCategoryId: reason.categoryId,
      previousDetailId: reason.detailId,
      reasonSegmentId: "reason:VH-8IA:001-correction",
      selectedBy: "senior-engineer-bne",
      selectedAt: "2026-05-22T09:20:00.000Z",
    });

    expect(event.eventType).toBe("reason_changed");
    expect(event.payload).toEqual(
      expect.objectContaining({
        apuEventId: baseInput.apuEventId,
        previousReasonSegmentId: "reason:VH-8IA:001",
        selectedBy: "senior-engineer-bne",
        selectedAt: "2026-05-22T09:20:00.000Z",
        sourceAction: "correct_reason",
      }),
    );
    expect(readWorkflowEvents()).toEqual([event]);
  });

  it("createDataQualityFlag emits operational context for data-quality triage", () => {
    const event = createDataQualityFlag({
      ...baseInput,
      aircraftGroundEventId: "flight-state:VH-8IA",
      bay: "Bay 20",
      createdAt: "2026-05-22T09:05:00.000Z",
      createdBy: "senior-engineer-bne",
      derivedState: {
        apuState: "on",
        manualOffPending: false,
        statusLabel: "Review due",
        urgencyBucket: "review_overdue",
      },
      issueType: "source_stale",
      note: "AODB source looks stale against bay display.",
      persona: "senior-engineer-bne",
      relatedEventIds: ["flight-state:VH-8IA", "stand:VH-8IA"],
      sourceFreshness: {
        latestReceivedAt: "2026-05-22T08:41:00.000Z",
        latencyMinutes: 24,
        sourceSystems: ["AODB", "ACMS"],
      },
      summary: "AODB source looks stale against bay display.",
    });

    expect(event.eventType).toBe("data_quality_flag_created");
    expect(event.payload).toEqual(
      expect.objectContaining({
        tail: "VH-8IA",
        port: "BNE",
        bay: "Bay 20",
        apuEventId: baseInput.apuEventId,
        aircraftGroundEventId: "flight-state:VH-8IA",
        category: "source_stale",
        issueType: "source_stale",
        severity: "warning",
        note: "AODB source looks stale against bay display.",
        createdBy: "senior-engineer-bne",
        persona: "senior-engineer-bne",
        createdAt: "2026-05-22T09:05:00.000Z",
        derivedState: {
          apuState: "on",
          manualOffPending: false,
          statusLabel: "Review due",
          urgencyBucket: "review_overdue",
        },
        sourceFreshness: {
          latestReceivedAt: "2026-05-22T08:41:00.000Z",
          latencyMinutes: 24,
          sourceSystems: ["AODB", "ACMS"],
        },
      }),
    );
    expect(readWorkflowEvents()).toEqual([event]);
  });
});
