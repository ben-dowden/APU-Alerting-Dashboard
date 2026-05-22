import type { EventEnvelope } from "./envelope";

export type SourceEventType =
  | "flight_state_event"
  | "stand_assignment_event"
  | "apu_state_event"
  | "weather_observation_event"
  | "tail_equipment_reference_event"
  | "stand_coordinate_reference_event";

export type FlightStateEventPayload = {
  tail: string;
  port: string;
  flightNumber: string;
  aircraftType?: string;
  arrivalFlightNumber?: string;
  departureFlightNumber?: string;
  origin?: string;
  destination?: string;
  gateState: "inbound" | "arrived" | "on_ground" | "turnaround" | "departed";
  onGroundAt?: string;
  offGroundAt?: string;
};

export type StandAssignmentEventPayload = {
  tail: string;
  port: string;
  bay: string;
  stand: string;
  terminal?: string;
  assignmentState: "planned" | "current" | "stale" | "released";
  validFrom: string;
  validUntil?: string;
  sourceUpdatedAt: string;
};

export type ApuStateEventPayload = {
  tail: string;
  port: string;
  state: "on" | "off";
  transitionedAt: string;
  acmsMessageType: "apu_on" | "apu_off";
};

export type WeatherObservationEventPayload = {
  port: string;
  observedAt: string;
  temperatureC: number;
  temperatureBandC: string;
  station: string;
};

export type TailEquipmentReferenceEventPayload = {
  tail: string;
  equipmentType: string;
  manufacturer?: string;
  effectiveFrom: string;
  effectiveTo?: string;
  referenceVersion: string;
};

export type StandCoordinateReferenceEventPayload = {
  port: string;
  stand: string;
  bay: string;
  latitude: number;
  longitude: number;
  referenceVersion: string;
  effectiveFrom: string;
};

export type FlightStateEvent = EventEnvelope<FlightStateEventPayload> & {
  eventType: "flight_state_event";
};

export type StandAssignmentEvent = EventEnvelope<StandAssignmentEventPayload> & {
  eventType: "stand_assignment_event";
};

export type ApuStateEvent = EventEnvelope<ApuStateEventPayload> & {
  eventType: "apu_state_event";
};

export type WeatherObservationEvent = EventEnvelope<WeatherObservationEventPayload> & {
  eventType: "weather_observation_event";
};

export type TailEquipmentReferenceEvent = EventEnvelope<TailEquipmentReferenceEventPayload> & {
  eventType: "tail_equipment_reference_event";
};

export type StandCoordinateReferenceEvent = EventEnvelope<StandCoordinateReferenceEventPayload> & {
  eventType: "stand_coordinate_reference_event";
};

export type SourceEvent =
  | FlightStateEvent
  | StandAssignmentEvent
  | ApuStateEvent
  | WeatherObservationEvent
  | TailEquipmentReferenceEvent
  | StandCoordinateReferenceEvent;
