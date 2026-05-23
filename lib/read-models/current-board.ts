import { compareIsoStrings } from "@/lib/domain/time";

import {
  createBoardEventContext,
  CURRENT_BOARD_PORT,
  isAircraftStillOnGround,
} from "./current-board-context";
import { createGroundAircraftState } from "./current-board-projection";
import type { CurrentBoardSettings, CurrentBoardState } from "./current-board-types";

export type {
  CurrentBoardSettings,
  CurrentBoardState,
  GroundAircraftState,
  SourceCharm,
  SourceQualityFlag,
} from "./current-board-types";

export const deriveCurrentBoard = (
  events: readonly unknown[],
  settings: CurrentBoardSettings,
  nowIso: string,
): CurrentBoardState => {
  const context = createBoardEventContext(events, nowIso);
  const groundAircraft = [...context.latestFlightStateByTail.values()]
    .filter((event) => event.payload.port === CURRENT_BOARD_PORT)
    .filter((event) => isAircraftStillOnGround(event, nowIso))
    .map((flight) => createGroundAircraftState(flight, context, settings, nowIso))
    .sort((left, right) => compareIsoStrings(left.tail, right.tail));

  return {
    port: CURRENT_BOARD_PORT,
    nowIso,
    standCoordinates: settings.standCoordinates,
    weather: context.weather,
    groundAircraft,
  };
};
