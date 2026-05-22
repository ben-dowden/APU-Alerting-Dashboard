import type { FuelBurnSettingsInput, FuelEstimate } from "@/lib/domain/fuel";
import type { DerivedApuEvent } from "@/lib/domain/apu-reducer";
import type { ReasonChainState } from "@/lib/domain/reason-chain-reducer";
import type {
  FlightStateEvent,
  ReasonTaxonomySnapshot,
  StandAssignmentEvent,
  WeatherObservationEvent,
} from "@/lib/events";

export type SourceCharm = {
  sourceSystem: string;
  sourceEventId: string;
  confidence: "high" | "medium" | "low";
  receivedAt: string;
  isStale?: boolean;
  isPlanned?: boolean;
  sourceLatencyMinutes?: number;
};

export type CurrentBoardSettings = {
  reasonTaxonomy: ReasonTaxonomySnapshot;
  fuelBurnAssumptions: FuelBurnSettingsInput;
};

export type GroundAircraftState = {
  tail: string;
  port: string;
  aircraftType?: string;
  flightNumber: string;
  gateState: FlightStateEvent["payload"]["gateState"];
  onGroundAt: string;
  bay?: string;
  stand?: string;
  standAssignmentState?: StandAssignmentEvent["payload"]["assignmentState"];
  apuState: "on" | "off";
  apuEvent?: DerivedApuEvent;
  reasonChain: ReasonChainState;
  manualOffPending: boolean;
  groundMinutes: number;
  apuRuntimeMinutes: number;
  fuelEstimate?: FuelEstimate;
  sourceCharms: SourceCharm[];
  sourceEventIds: string[];
};

export type CurrentBoardState = {
  port: string;
  nowIso: string;
  weather?: WeatherObservationEvent["payload"];
  groundAircraft: GroundAircraftState[];
};
