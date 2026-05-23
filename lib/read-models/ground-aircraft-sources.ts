import type {
  ApuStateEvent,
  FlightStateEvent,
  SourceEvent,
  StandAssignmentEvent,
} from "@/lib/events";

import type { SourceCharm, SourceQualityFlag } from "./current-board-types";
import type { DerivedApuEvent } from "@/lib/domain/apu-reducer";

const compactFlags = (values: Array<SourceQualityFlag | undefined>) =>
  values.filter((value): value is SourceQualityFlag => Boolean(value));

const sourceQualityFlags = (event: SourceEvent): SourceQualityFlag[] =>
  compactFlags([
    event.quality.isStale ? "stale" : undefined,
    event.quality.confidence === "low" ? "low_confidence" : undefined,
    event.sourceSystem === "UNKNOWN" ? "unknown" : undefined,
  ]);

const sourceCharm = (event: SourceEvent): SourceCharm => ({
  sourceSystem: event.sourceSystem,
  sourceEventId: event.sourceEventId,
  confidence: event.quality.confidence,
  receivedAt: event.receivedAt,
  isStale: event.quality.isStale,
  isPlanned: event.quality.isPlanned,
  sourceLatencyMinutes: event.quality.sourceLatencyMinutes,
  qualityFlags: sourceQualityFlags(event),
});

const compactStrings = (values: Array<string | undefined>) =>
  values.filter((value): value is string => Boolean(value));

export const sourceCharmsForAircraft = (
  flight: FlightStateEvent,
  stand: StandAssignmentEvent | undefined,
  apuState: ApuStateEvent | undefined,
) =>
  [flight, stand, apuState]
    .filter((event): event is FlightStateEvent | StandAssignmentEvent | ApuStateEvent =>
      Boolean(event),
    )
    .map(sourceCharm);

export const sourceEventIdsForAircraft = (
  flight: FlightStateEvent,
  stand: StandAssignmentEvent | undefined,
  apuEvent: DerivedApuEvent | undefined,
) => compactStrings([flight.eventId, stand?.eventId, ...(apuEvent?.sourceEventIds ?? [])]);
