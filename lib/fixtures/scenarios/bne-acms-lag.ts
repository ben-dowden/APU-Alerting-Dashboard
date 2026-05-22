import type { ScenarioFixture } from "./builders";
import { apuStateEvent, flightStateEvent, reasonSelectedEvent, standAssignmentEvent } from "./builders";

export const bneAcmsLagScenario: ScenarioFixture = {
  id: "bne-acms-lag",
  name: "BNE ACMS lag",
  description: "ACMS confirms an APU-on transition around 25 minutes after the flight and stand sources are already current.",
  events: [
    flightStateEvent({
      tail: "VH-8NB",
      aircraftType: "B38M",
      flightNumber: "VA742",
      gateState: "on_ground",
      onGroundAt: "2026-05-22T09:00:00.000Z",
      occurredAt: "2026-05-22T09:00:00.000Z",
      receivedAt: "2026-05-22T09:00:10.000Z",
      sourceEventId: "AIMS-VH8NB-0900",
    }),
    standAssignmentEvent({
      tail: "VH-8NB",
      bay: "Bay 19",
      stand: "19",
      assignmentState: "current",
      validFrom: "2026-05-22T09:00:00.000Z",
      occurredAt: "2026-05-22T09:01:00.000Z",
      receivedAt: "2026-05-22T09:01:10.000Z",
      sourceEventId: "BNE-STAND-VH8NB-0901",
    }),
    apuStateEvent({
      tail: "VH-8NB",
      state: "on",
      occurredAt: "2026-05-22T09:02:00.000Z",
      receivedAt: "2026-05-22T09:27:00.000Z",
      sourceEventId: "ACMS-VH8NB-APUON-0902",
      sourceLatencyMinutes: 25,
    }),
    reasonSelectedEvent({
      tail: "VH-8NB",
      apuEventId: "apu:VH-8NB:2026-05-22T09:02:00.000Z",
      reasonSegmentId: "reason:VH-8NB:001",
      categoryId: "infrastructure-unavailable",
      categoryLabel: "Infrastructure unavailable",
      detailId: "gpu-unavailable",
      detailLabel: "GPU unavailable",
      selectedBy: "senior-engineer-bne",
      occurredAt: "2026-05-22T09:32:00.000Z",
      receivedAt: "2026-05-22T09:32:03.000Z",
      sourceEventId: "APP-VH8NB-REASON-0932",
    }),
  ],
};
