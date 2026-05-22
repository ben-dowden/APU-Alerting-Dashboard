import type { DataQualityFlagCreatedEvent, DomainEvent } from "@/lib/events";
import { isDomainEvent } from "@/lib/events";

export type DataQualityTelemetry = {
  flagId: string;
  tail?: string;
  apuEventId?: string;
  aircraftGroundEventId?: string;
  category: DataQualityFlagCreatedEvent["payload"]["category"];
  severity: DataQualityFlagCreatedEvent["payload"]["severity"];
  summary: string;
  createdAt: string;
  createdBy: string;
  relatedEventIds: string[];
  sourceEventId: string;
};

const isDataQualityFlagCreatedEvent = (
  event: DomainEvent,
): event is DataQualityFlagCreatedEvent => event.eventType === "data_quality_flag_created";

export const deriveDataQualityTelemetry = (events: readonly unknown[]): DataQualityTelemetry[] =>
  events
    .filter(isDomainEvent)
    .filter(isDataQualityFlagCreatedEvent)
    .sort((left, right) => left.occurredAt.localeCompare(right.occurredAt))
    .map((event) => ({
      flagId: event.payload.flagId,
      tail: event.payload.tail,
      apuEventId: event.payload.apuEventId,
      aircraftGroundEventId: event.payload.aircraftGroundEventId,
      category: event.payload.category,
      severity: event.payload.severity,
      summary: event.payload.summary,
      createdAt: event.payload.createdAt,
      createdBy: event.payload.createdBy,
      relatedEventIds: event.payload.relatedEventIds,
      sourceEventId: event.eventId,
    }));
