import type { ReasonSegment } from "@/lib/domain/reason-chain-reducer";
import type { ReasonTaxonomySnapshot } from "@/lib/events";
import type { AircraftCardReadModel, GroundAircraftState } from "@/lib/read-models";

import { DesktopAircraftCard } from "./desktop-aircraft-card";
import type { ReasonPickerSelection } from "./reason-picker";

type AircraftBoardProps = {
  aircraft: AircraftCardReadModel[];
  groundAircraft: GroundAircraftState[];
  taxonomy: ReasonTaxonomySnapshot;
  onSelectReason: (aircraft: GroundAircraftState, selection: ReasonPickerSelection) => void;
  onChangeReason: (
    aircraft: GroundAircraftState,
    currentReason: ReasonSegment,
    selection: ReasonPickerSelection,
  ) => void;
  onKeepCurrentReason: (aircraft: GroundAircraftState, currentReason: ReasonSegment) => void;
  onAddReasonNote: (aircraft: GroundAircraftState, currentReason: ReasonSegment, note: string) => void;
  onCorrectReason: (
    aircraft: GroundAircraftState,
    previousReason: ReasonSegment,
    selection: ReasonPickerSelection,
  ) => void;
};

export function AircraftBoard({
  aircraft,
  groundAircraft,
  taxonomy,
  onSelectReason,
  onChangeReason,
  onKeepCurrentReason,
  onAddReasonNote,
  onCorrectReason,
}: AircraftBoardProps) {
  const groundAircraftByTail = new Map(
    groundAircraft.map((aircraftState) => [aircraftState.tail, aircraftState]),
  );

  return (
    <section aria-label="Aircraft work queue" className="grid gap-4 xl:grid-cols-2">
      {aircraft.map((aircraftCard) => {
        const aircraftState = groundAircraftByTail.get(aircraftCard.tail);

        return aircraftState ? (
          <DesktopAircraftCard
            aircraft={aircraftCard}
            groundAircraft={aircraftState}
            key={aircraftCard.tail}
            onAddReasonNote={onAddReasonNote}
            onChangeReason={onChangeReason}
            onCorrectReason={onCorrectReason}
            onKeepCurrentReason={onKeepCurrentReason}
            onSelectReason={onSelectReason}
            taxonomy={taxonomy}
          />
        ) : null;
      })}
    </section>
  );
}
