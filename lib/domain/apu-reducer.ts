import { inferDepartedApuClosures } from "./apu-flight-closure";
import { replayApuStateEvents } from "./apu-source-replay";
import type { DerivedApuEvent, DeriveApuEventsOptions } from "./apu-event-types";
import { compareIsoStrings } from "./time";

export type {
  ApuEventClosureType,
  ApuEventState,
  DerivedApuEvent,
  DeriveApuEventsOptions,
} from "./apu-event-types";

export const deriveApuEvents = (
  events: readonly unknown[],
  options: DeriveApuEventsOptions = {},
): DerivedApuEvent[] => {
  const inferClosureFromFlightState = options.inferClosureFromFlightState ?? true;
  const sourceApuEvents = replayApuStateEvents(events);
  const apuEvents = inferClosureFromFlightState
    ? inferDepartedApuClosures(sourceApuEvents, events)
    : sourceApuEvents;

  return apuEvents.sort((left, right) => compareIsoStrings(left.startedAt, right.startedAt));
};
