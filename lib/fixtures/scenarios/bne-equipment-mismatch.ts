import { tailEquipmentReferenceEvents } from "../reference/tail-equipment";
import type { ScenarioFixture } from "./builders";
import { apuStateEvent, dataQualityFlagCreatedEvent, flightStateEvent, standAssignmentEvent } from "./builders";

const vh8nbReference = tailEquipmentReferenceEvents.find((event) => event.payload.tail === "VH-8NB");

if (!vh8nbReference) {
  throw new Error("Missing VH-8NB tail equipment reference fixture");
}

export const bneEquipmentMismatchScenario: ScenarioFixture = {
  id: "bne-equipment-mismatch",
  name: "BNE equipment mismatch",
  description: "Flight-state equipment is preserved for operations while a mismatch with tail reference data is flagged for diagnostics.",
  events: [
    vh8nbReference,
    flightStateEvent({
      tail: "VH-8NB",
      aircraftType: "B738",
      flightNumber: "VA928",
      gateState: "on_ground",
      onGroundAt: "2026-05-22T12:00:00.000Z",
      occurredAt: "2026-05-22T12:00:00.000Z",
      receivedAt: "2026-05-22T12:00:08.000Z",
      sourceEventId: "AIMS-VH8NB-1200-MISMATCH",
    }),
    standAssignmentEvent({
      tail: "VH-8NB",
      bay: "Bay 23",
      stand: "23",
      assignmentState: "current",
      validFrom: "2026-05-22T12:00:00.000Z",
      occurredAt: "2026-05-22T12:01:00.000Z",
      receivedAt: "2026-05-22T12:01:05.000Z",
      sourceEventId: "BNE-STAND-VH8NB-1201",
    }),
    apuStateEvent({
      tail: "VH-8NB",
      state: "on",
      occurredAt: "2026-05-22T12:03:00.000Z",
      receivedAt: "2026-05-22T12:03:30.000Z",
      sourceEventId: "ACMS-VH8NB-APUON-1203",
    }),
    dataQualityFlagCreatedEvent({
      tail: "VH-8NB",
      flagId: "dq:VH-8NB:equipment-mismatch",
      category: "equipment_mismatch",
      severity: "warning",
      summary: "Flight-state equipment B738 conflicts with tail reference equipment B38M.",
      createdBy: "system",
      relatedEventIds: ["AIMS-VH8NB-1200-MISMATCH", "tail-equipment:VH-8NB:v1"],
      occurredAt: "2026-05-22T12:04:00.000Z",
      receivedAt: "2026-05-22T12:04:02.000Z",
      sourceEventId: "APP-DQ-VH8NB-1204",
    }),
  ],
};
