export type ApuEventClosureType = "open" | "source_off" | "inferred_departed";
export type ApuEventState = "open" | "closed";

export type DerivedApuEvent = {
  apuEventId: string;
  tail: string;
  port: string;
  startedAt: string;
  endedAt?: string;
  state: ApuEventState;
  closureType: ApuEventClosureType;
  closureConfidence?: "high" | "medium" | "low";
  closureReason?: string;
  closureSourceEventIds: string[];
  sourceEventIds: string[];
};

export type DeriveApuEventsOptions = {
  inferClosureFromFlightState?: boolean;
};
