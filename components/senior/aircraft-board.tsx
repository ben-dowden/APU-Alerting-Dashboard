"use client";

import type { ReasonTaxonomySnapshot } from "@/lib/events";
import type { AircraftCardReadModel, GroundAircraftState } from "@/lib/read-models";
import { useKeyedListMotion } from "@/lib/ui/use-keyed-list-motion";

import type { ReasonDrawerPlacement } from "./card-reason-drawer";
import { DesktopAircraftCard, type ReasonWorkflowHandlers } from "./desktop-aircraft-card";

type AircraftBoardProps = {
  aircraft: AircraftCardReadModel[];
  focusedTail?: string;
  groundAircraft: GroundAircraftState[];
  recentlyActionedTail?: string;
  taxonomy: ReasonTaxonomySnapshot;
} & ReasonWorkflowHandlers;

const drawerPlacementForIndex = (index: number): ReasonDrawerPlacement => {
  const columnIndex = index % 3;

  if (columnIndex === 1) {
    return "center";
  }

  if (columnIndex === 2) {
    return "right";
  }

  return "left";
};

export function AircraftBoard({
  aircraft,
  focusedTail,
  groundAircraft,
  recentlyActionedTail,
  taxonomy,
  onSelectReason,
  onChangeReason,
  onKeepCurrentReason,
  onAddReasonNote,
  onCorrectReason,
  onCreateDataQualityFlag,
  onMarkManualApuOff,
}: AircraftBoardProps) {
  const groundAircraftByTail = new Map(
    groundAircraft.map((aircraftState) => [aircraftState.tail, aircraftState]),
  );
  const motion = useKeyedListMotion<HTMLDivElement>({
    durationMs: 533,
    itemKeys: aircraft.map((aircraftCard) => aircraftCard.tail),
  });

  return (
    <section aria-label="Aircraft work queue" className="grid gap-3 xl:grid-cols-3">
      {aircraft.map((aircraftCard, index) => {
        const aircraftState = groundAircraftByTail.get(aircraftCard.tail);

        return aircraftState ? (
          <DesktopAircraftCard
            aircraft={aircraftCard}
            isRecentlyActioned={recentlyActionedTail === aircraftCard.tail}
            drawerPlacement={drawerPlacementForIndex(index)}
            groundAircraft={aircraftState}
            isFocusHighlighted={focusedTail === aircraftCard.tail}
            key={aircraftCard.tail}
            motionRef={(node) => motion.registerItem(aircraftCard.tail, node)}
            onAddReasonNote={onAddReasonNote}
            onChangeReason={onChangeReason}
            onCorrectReason={onCorrectReason}
            onCreateDataQualityFlag={onCreateDataQualityFlag}
            onKeepCurrentReason={onKeepCurrentReason}
            onMarkManualApuOff={onMarkManualApuOff}
            onSelectReason={onSelectReason}
            taxonomy={taxonomy}
          />
        ) : null;
      })}
    </section>
  );
}
