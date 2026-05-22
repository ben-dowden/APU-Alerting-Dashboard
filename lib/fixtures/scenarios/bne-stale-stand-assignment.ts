import type { ScenarioFixture } from "./builders";
import { apuStateEvent, flightStateEvent, reasonSelectedEvent, standAssignmentEvent } from "./builders";

export const bneStaleStandAssignmentScenario: ScenarioFixture = {
  id: "bne-stale-stand-assignment",
  name: "BNE stale stand assignment",
  description: "Stand/bay context is deliberately marked stale and planned so later UI can avoid implying live aircraft tracking.",
  events: [
    flightStateEvent({
      tail: "VH-YFX",
      aircraftType: "B738",
      flightNumber: "VA322",
      gateState: "on_ground",
      onGroundAt: "2026-05-22T13:50:00.000Z",
      occurredAt: "2026-05-22T13:50:00.000Z",
      receivedAt: "2026-05-22T13:50:05.000Z",
      sourceEventId: "AIMS-VHYFX-1350",
    }),
    standAssignmentEvent({
      tail: "VH-YFX",
      bay: "Bay 17",
      stand: "17",
      assignmentState: "stale",
      validFrom: "2026-05-22T13:20:00.000Z",
      sourceUpdatedAt: "2026-05-22T13:20:00.000Z",
      occurredAt: "2026-05-22T13:55:00.000Z",
      receivedAt: "2026-05-22T13:56:00.000Z",
      sourceEventId: "BNE-STAND-VHYFX-1355-STALE",
      quality: {
        confidence: "low",
        isPlanned: true,
        isStale: true,
        notes: ["Planned stand context only; do not present as live aircraft tracking."],
      },
    }),
    apuStateEvent({
      tail: "VH-YFX",
      state: "on",
      occurredAt: "2026-05-22T13:57:00.000Z",
      receivedAt: "2026-05-22T13:58:00.000Z",
      sourceEventId: "ACMS-VHYFX-APUON-1357",
      sourceLatencyMinutes: 1,
    }),
    reasonSelectedEvent({
      tail: "VH-YFX",
      apuEventId: "apu:VH-YFX:2026-05-22T13:57:00.000Z",
      reasonSegmentId: "reason:VH-YFX:001",
      categoryId: "infrastructure-unavailable",
      categoryLabel: "Infrastructure unavailable",
      detailId: "remote-stand-no-support",
      detailLabel: "Remote stand / no support",
      selectedBy: "senior-engineer-bne",
      occurredAt: "2026-05-22T14:02:00.000Z",
      receivedAt: "2026-05-22T14:02:04.000Z",
      sourceEventId: "APP-VHYFX-REASON-1402",
    }),
  ],
};
