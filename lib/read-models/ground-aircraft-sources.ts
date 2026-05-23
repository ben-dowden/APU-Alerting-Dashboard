import type {
  ApuStateEvent,
  FlightStateEvent,
  SourceEvent,
  StandAssignmentEvent,
} from "@/lib/events";

import type { SourceCharm } from "./current-board-types";
import type { DerivedApuEvent } from "@/lib/domain/apu-reducer";

const sourceCharm = (event: SourceEvent): SourceCharm => ({
  sourceSystem: event.sourceSystem,
  sourceEventId: event.sourceEventId,
  confidence: event.quality.confidence,
  receivedAt: event.receivedAt,
  isStale: event.quality.isStale,
  isPlanned: event.quality.isPlanned,
  sourceLatencyMinutes: event.quality.sourceLatencyMinutes,
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
