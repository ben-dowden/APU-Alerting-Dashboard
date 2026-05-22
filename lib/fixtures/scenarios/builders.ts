import { buildEventId, buildIdempotencyKey } from "@/lib/events";
import type {
  ApuStateEvent,
  DataQualityFlagCreatedEvent,
  DataQualityFlagCreatedPayload,
  DomainEvent,
  EventCorrelation,
  EventEnvelope,
  EventQuality,
  EventSourceSystem,
  FlightStateEvent,
  FlightStateEventPayload,
  ManualApuOffObservedEvent,
  ReasonSelectedEvent,
  SourceEvent,
  StandAssignmentEvent,
  WeatherObservationEvent,
} from "@/lib/events";

export type ScenarioEvent = SourceEvent | DomainEvent;

export type ScenarioFixture = {
  id: string;
  name: string;
  description: string;
  events: ScenarioEvent[];
};

type EnvelopeInput<TEventType extends ScenarioEvent["eventType"], TPayload> = {
  eventType: TEventType;
  sourceSystem: EventSourceSystem;
  sourceEventId: string;
  occurredAt: string;
  receivedAt: string;
  correlation: EventCorrelation;
  quality?: Partial<EventQuality>;
  payload: TPayload;
  entityId?: string;
};

const envelope = <TEventType extends ScenarioEvent["eventType"], TPayload>({
  eventType,
  sourceSystem,
  sourceEventId,
  occurredAt,
  receivedAt,
  correlation,
  quality,
  payload,
  entityId,
}: EnvelopeInput<TEventType, TPayload>): EventEnvelope<TPayload> & { eventType: TEventType } => {
  const idempotencyKey = buildIdempotencyKey(sourceSystem, sourceEventId);
  const eventEntityId = entityId ?? correlation.tail ?? correlation.stand ?? sourceEventId;

  return {
    eventId: buildEventId(eventType, correlation.port, eventEntityId, occurredAt),
    eventType,
    eventVersion: 1,
    sourceSystem,
    sourceEventId,
    occurredAt,
    receivedAt,
    correlation: {
      ...correlation,
      idempotencyKey,
    },
    quality: {
      confidence: "high",
      idempotencyKey,
      ...quality,
    },
    payload,
  };
};

export const flightStateEvent = (
  input: Omit<FlightStateEventPayload, "port"> & {
    occurredAt: string;
    receivedAt: string;
    sourceEventId: string;
  },
): FlightStateEvent =>
  envelope({
    eventType: "flight_state_event",
    sourceSystem: "AIMS",
    sourceEventId: input.sourceEventId,
    occurredAt: input.occurredAt,
    receivedAt: input.receivedAt,
    correlation: {
      port: "BNE",
      tail: input.tail,
      flightNumber: input.flightNumber,
      arrivalFlightNumber: input.arrivalFlightNumber,
      departureFlightNumber: input.departureFlightNumber,
    },
    payload: {
      tail: input.tail,
      port: "BNE",
      flightNumber: input.flightNumber,
      aircraftType: input.aircraftType,
      arrivalFlightNumber: input.arrivalFlightNumber,
      departureFlightNumber: input.departureFlightNumber,
      origin: input.origin,
      destination: input.destination,
      gateState: input.gateState,
      onGroundAt: input.onGroundAt,
      offGroundAt: input.offGroundAt,
    },
  });

export const standAssignmentEvent = (input: {
  tail: string;
  bay: string;
  stand: string;
  assignmentState: "planned" | "current" | "stale" | "released";
  validFrom: string;
  validUntil?: string;
  sourceUpdatedAt?: string;
  occurredAt: string;
  receivedAt: string;
  sourceEventId: string;
  quality?: Partial<EventQuality>;
}): StandAssignmentEvent =>
  envelope({
    eventType: "stand_assignment_event",
    sourceSystem: "BNE_STAND_PLAN",
    sourceEventId: input.sourceEventId,
    occurredAt: input.occurredAt,
    receivedAt: input.receivedAt,
    correlation: {
      port: "BNE",
      tail: input.tail,
      bay: input.bay,
      stand: input.stand,
    },
    quality: input.quality,
    payload: {
      tail: input.tail,
      port: "BNE",
      bay: input.bay,
      stand: input.stand,
      terminal: "Domestic",
      assignmentState: input.assignmentState,
      validFrom: input.validFrom,
      validUntil: input.validUntil,
      sourceUpdatedAt: input.sourceUpdatedAt ?? input.occurredAt,
    },
  });

export const apuStateEvent = (input: {
  tail: string;
  state: "on" | "off";
  occurredAt: string;
  receivedAt: string;
  sourceEventId: string;
  sourceLatencyMinutes?: number;
}): ApuStateEvent =>
  envelope({
    eventType: "apu_state_event",
    sourceSystem: "ACMS",
    sourceEventId: input.sourceEventId,
    occurredAt: input.occurredAt,
    receivedAt: input.receivedAt,
    correlation: {
      port: "BNE",
      tail: input.tail,
    },
    quality: {
      sourceLatencyMinutes: input.sourceLatencyMinutes,
    },
    payload: {
      tail: input.tail,
      port: "BNE",
      state: input.state,
      transitionedAt: input.occurredAt,
      acmsMessageType: input.state === "on" ? "apu_on" : "apu_off",
    },
  });

export const weatherObservationEvent = (input: {
  temperatureC: number;
  temperatureBandC: string;
  occurredAt: string;
  receivedAt: string;
  sourceEventId: string;
}): WeatherObservationEvent =>
  envelope({
    eventType: "weather_observation_event",
    sourceSystem: "BOM",
    sourceEventId: input.sourceEventId,
    occurredAt: input.occurredAt,
    receivedAt: input.receivedAt,
    correlation: {
      port: "BNE",
    },
    payload: {
      port: "BNE",
      observedAt: input.occurredAt,
      temperatureC: input.temperatureC,
      temperatureBandC: input.temperatureBandC,
      station: "BNE",
    },
    entityId: "BNE",
  });

export const reasonSelectedEvent = (input: {
  tail: string;
  apuEventId: string;
  reasonSegmentId: string;
  categoryId: string;
  categoryLabel: string;
  detailId: string;
  detailLabel: string;
  selectedBy: string;
  occurredAt: string;
  receivedAt: string;
  sourceEventId: string;
}): ReasonSelectedEvent =>
  envelope({
    eventType: "reason_selected",
    sourceSystem: "APU_APP",
    sourceEventId: input.sourceEventId,
    occurredAt: input.occurredAt,
    receivedAt: input.receivedAt,
    correlation: {
      port: "BNE",
      tail: input.tail,
      apuEventId: input.apuEventId,
      reasonSegmentId: input.reasonSegmentId,
    },
    payload: {
      apuEventId: input.apuEventId,
      reasonSegmentId: input.reasonSegmentId,
      categoryId: input.categoryId,
      categoryLabel: input.categoryLabel,
      detailId: input.detailId,
      detailLabel: input.detailLabel,
      selectedBy: input.selectedBy,
      selectedAt: input.occurredAt,
      sourceAction: "select_reason",
    },
  });

export const manualApuOffObservedEvent = (input: {
  tail: string;
  apuEventId: string;
  observedBy: string;
  occurredAt: string;
  receivedAt: string;
  sourceEventId: string;
  observationNote?: string;
}): ManualApuOffObservedEvent =>
  envelope({
    eventType: "manual_apu_off_observed",
    sourceSystem: "APU_APP",
    sourceEventId: input.sourceEventId,
    occurredAt: input.occurredAt,
    receivedAt: input.receivedAt,
    correlation: {
      port: "BNE",
      tail: input.tail,
      apuEventId: input.apuEventId,
    },
    payload: {
      apuEventId: input.apuEventId,
      tail: input.tail,
      observedBy: input.observedBy,
      observedAt: input.occurredAt,
      pendingSourceConfirmation: true,
      observationNote: input.observationNote,
    },
  });

export const dataQualityFlagCreatedEvent = (
  input: Omit<DataQualityFlagCreatedPayload, "createdAt"> & {
    tail: string;
    occurredAt: string;
    receivedAt: string;
    sourceEventId: string;
  },
): DataQualityFlagCreatedEvent =>
  envelope({
    eventType: "data_quality_flag_created",
    sourceSystem: "APU_APP",
    sourceEventId: input.sourceEventId,
    occurredAt: input.occurredAt,
    receivedAt: input.receivedAt,
    correlation: {
      port: "BNE",
      tail: input.tail,
      apuEventId: input.apuEventId,
      aircraftGroundEventId: input.aircraftGroundEventId,
      relatedSourceEventIds: input.relatedEventIds,
    },
    quality: {
      confidence: input.severity === "critical" ? "high" : "medium",
    },
    payload: {
      flagId: input.flagId,
      tail: input.tail,
      apuEventId: input.apuEventId,
      aircraftGroundEventId: input.aircraftGroundEventId,
      category: input.category,
      severity: input.severity,
      summary: input.summary,
      createdBy: input.createdBy,
      createdAt: input.occurredAt,
      relatedEventIds: input.relatedEventIds,
    },
  });
