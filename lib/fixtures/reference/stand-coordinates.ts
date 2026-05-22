import { buildEventId, buildIdempotencyKey } from "@/lib/events";
import type { StandCoordinateReferenceEvent } from "@/lib/events";

const occurredAt = "2026-05-22T00:00:00.000Z";

const stands = [
  { stand: "17", bay: "Bay 17", latitude: -27.38601, longitude: 153.11661 },
  { stand: "18", bay: "Bay 18", latitude: -27.3858, longitude: 153.11683 },
  { stand: "19", bay: "Bay 19", latitude: -27.38557, longitude: 153.11705 },
  { stand: "20", bay: "Bay 20", latitude: -27.38535, longitude: 153.11728 },
  { stand: "21", bay: "Bay 21", latitude: -27.38512, longitude: 153.1175 },
  { stand: "22", bay: "Bay 22", latitude: -27.3849, longitude: 153.11773 },
  { stand: "23", bay: "Bay 23", latitude: -27.38468, longitude: 153.11795 },
  { stand: "24", bay: "Bay 24", latitude: -27.38445, longitude: 153.11818 },
];

export const standCoordinateReferenceEvents: StandCoordinateReferenceEvent[] = stands.map(
  ({ stand, bay, latitude, longitude }) => {
    const sourceEventId = `stand-coordinate:BNE:${stand}:v1`;
    const idempotencyKey = buildIdempotencyKey("REFERENCE_DATA", sourceEventId);

    return {
      eventId: buildEventId("stand_coordinate_reference_event", "BNE", stand, occurredAt),
      eventType: "stand_coordinate_reference_event",
      eventVersion: 1,
      sourceSystem: "REFERENCE_DATA",
      sourceEventId,
      occurredAt,
      receivedAt: occurredAt,
      correlation: {
        port: "BNE",
        bay,
        stand,
        idempotencyKey,
      },
      quality: {
        confidence: "high",
        idempotencyKey,
      },
      payload: {
        port: "BNE",
        stand,
        bay,
        latitude,
        longitude,
        referenceVersion: "stand-coordinates-v1",
        effectiveFrom: occurredAt,
      },
    };
  },
);
