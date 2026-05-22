export type EventSourceSystem =
  | "ACMS"
  | "AIMS"
  | "BOM"
  | "BNE_STAND_PLAN"
  | "APU_APP"
  | "REFERENCE_DATA"
  | "ADMIN";

export type EventConfidence = "high" | "medium" | "low";

export type EventCorrelation = {
  port: string;
  tail?: string;
  flightNumber?: string;
  arrivalFlightNumber?: string;
  departureFlightNumber?: string;
  bay?: string;
  stand?: string;
  aircraftGroundEventId?: string;
  apuEventId?: string;
  reasonSegmentId?: string;
  relatedSourceEventIds?: string[];
  idempotencyKey?: string;
};

export type EventQuality = {
  confidence: EventConfidence;
  idempotencyKey: string;
  sourceLatencyMinutes?: number;
  isStale?: boolean;
  isPlanned?: boolean;
  isFallback?: boolean;
  notes?: string[];
};

export type EventEnvelope<TPayload> = {
  eventId: string;
  eventType: string;
  eventVersion: number;
  sourceSystem: EventSourceSystem;
  sourceEventId: string;
  occurredAt: string;
  receivedAt: string;
  correlation: EventCorrelation;
  quality: EventQuality;
  payload: TPayload;
};

export const buildEventId = (
  eventType: string,
  port: string,
  entityId: string,
  occurredAt: string,
) => `${eventType}:${port}:${entityId}:${occurredAt}`;

export const buildIdempotencyKey = (sourceSystem: EventSourceSystem, sourceEventId: string) =>
  `${sourceSystem}:${sourceEventId}`;
