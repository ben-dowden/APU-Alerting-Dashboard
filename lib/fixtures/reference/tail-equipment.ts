import { buildEventId, buildIdempotencyKey } from "@/lib/events";
import type { TailEquipmentReferenceEvent } from "@/lib/events";

const occurredAt = "2026-05-22T00:00:00.000Z";

const tailEquipment = [
  { tail: "VH-8IA", equipmentType: "B738" },
  { tail: "VH-8NB", equipmentType: "B38M" },
  { tail: "VH-8NJ", equipmentType: "B38M" },
  { tail: "VH-8XA", equipmentType: "B39M" },
  { tail: "VH-YFX", equipmentType: "B738" },
];

export const tailEquipmentReferenceEvents: TailEquipmentReferenceEvent[] = tailEquipment.map(
  ({ tail, equipmentType }) => {
    const sourceEventId = `tail-equipment:${tail}:v1`;
    const idempotencyKey = buildIdempotencyKey("REFERENCE_DATA", sourceEventId);

    return {
      eventId: buildEventId("tail_equipment_reference_event", "BNE", tail, occurredAt),
      eventType: "tail_equipment_reference_event",
      eventVersion: 1,
      sourceSystem: "REFERENCE_DATA",
      sourceEventId,
      occurredAt,
      receivedAt: occurredAt,
      correlation: {
        port: "BNE",
        tail,
        idempotencyKey,
      },
      quality: {
        confidence: "high",
        idempotencyKey,
      },
      payload: {
        tail,
        equipmentType,
        manufacturer: "Boeing",
        effectiveFrom: occurredAt,
        referenceVersion: "tail-equipment-v1",
      },
    };
  },
);
