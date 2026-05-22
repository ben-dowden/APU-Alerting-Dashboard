import type { EventEnvelope } from "./envelope";

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

export type SourceEventPayloadByType = {
  flight_state_event: FlightStateEventPayload;
  stand_assignment_event: StandAssignmentEventPayload;
  apu_state_event: ApuStateEventPayload;
  weather_observation_event: WeatherObservationEventPayload;
  tail_equipment_reference_event: TailEquipmentReferenceEventPayload;
  stand_coordinate_reference_event: StandCoordinateReferenceEventPayload;
};

export type SourceEventType = keyof SourceEventPayloadByType;

export const sourceEventTypeRegistry = {
  flight_state_event: true,
  stand_assignment_event: true,
  apu_state_event: true,
  weather_observation_event: true,
  tail_equipment_reference_event: true,
  stand_coordinate_reference_event: true,
} as const satisfies Record<SourceEventType, true>;

export const sourceEventTypes = Object.keys(sourceEventTypeRegistry) as SourceEventType[];

export type SourceEventOfType<TEventType extends SourceEventType> =
  EventEnvelope<SourceEventPayloadByType[TEventType]> & {
    eventType: TEventType;
  };

export type FlightStateEvent = SourceEventOfType<"flight_state_event">;

export type StandAssignmentEvent = SourceEventOfType<"stand_assignment_event">;

export type ApuStateEvent = SourceEventOfType<"apu_state_event">;

export type WeatherObservationEvent = SourceEventOfType<"weather_observation_event">;

export type TailEquipmentReferenceEvent = SourceEventOfType<"tail_equipment_reference_event">;

export type StandCoordinateReferenceEvent = SourceEventOfType<"stand_coordinate_reference_event">;

export type SourceEvent = {
  [TEventType in SourceEventType]: SourceEventOfType<TEventType>;
}[SourceEventType];
