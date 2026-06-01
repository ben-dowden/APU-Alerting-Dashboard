"use client";

import { useMemo } from "react";

import type { AircraftCardReadModel } from "@/lib/read-models";
import { WallboardAircraftCarousel } from "./wallboard-aircraft-carousel";
import { WallboardSideIndex } from "./wallboard-side-index";
import {
  remainingFor,
  wallboardCardPageSize,
  wallboardCardRotationIntervalMs,
  wallboardSidebarPageSize,
  wallboardSidebarRotationIntervalMs,
} from "./wallboard-rotation";

type WallboardAircraftStageProps = {
  aircraft: AircraftCardReadModel[];
  elapsedMs: number;
  recentlyActionedTail?: string;
};

const chunkAircraft = (aircraft: AircraftCardReadModel[], pageSize: number) => {
  const pages: AircraftCardReadModel[][] = [];

  for (let index = 0; index < aircraft.length; index += pageSize) {
    pages.push(aircraft.slice(index, index + pageSize));
  }

  return pages;
};

export function WallboardAircraftStage({
  aircraft,
  elapsedMs,
  recentlyActionedTail,
}: WallboardAircraftStageProps) {
  const sidebarPages = useMemo(
    () => chunkAircraft(aircraft, wallboardSidebarPageSize),
    [aircraft],
  );
  const sidebarPageCount = Math.max(1, sidebarPages.length);
  const sidebarPageIndex =
    sidebarPages.length > 0
      ? Math.floor(elapsedMs / wallboardSidebarRotationIntervalMs) % sidebarPages.length
      : 0;
  const visibleSidebarAircraft = sidebarPages[sidebarPageIndex] ?? [];
  const cardPagesInSidebar = useMemo(
    () => chunkAircraft(visibleSidebarAircraft, wallboardCardPageSize),
    [visibleSidebarAircraft],
  );
  const cardSlotIndex = Math.floor(
    (elapsedMs % wallboardSidebarRotationIntervalMs) / wallboardCardRotationIntervalMs,
  );
  const cardPageIndexWithinSidebar =
    cardPagesInSidebar.length > 0 ? Math.min(cardSlotIndex, cardPagesInSidebar.length - 1) : 0;
  const visibleCardAircraft = cardPagesInSidebar[cardPageIndexWithinSidebar] ?? [];
  const globalCardPageCount = Math.max(1, Math.ceil(aircraft.length / wallboardCardPageSize));
  const globalCardPageIndex = Math.min(
    sidebarPageIndex * (wallboardSidebarPageSize / wallboardCardPageSize) +
      cardPageIndexWithinSidebar,
    globalCardPageCount - 1,
  );
  const highlightedTailIds = visibleCardAircraft.map((aircraftCard) => aircraftCard.tail);

  return (
    <div className="grid min-h-0 flex-1 grid-cols-[minmax(0,1fr)_420px] gap-4 px-6 pb-6">
      <WallboardAircraftCarousel
        aircraft={visibleCardAircraft}
        intervalMs={wallboardCardRotationIntervalMs}
        pageCount={globalCardPageCount}
        pageIndex={globalCardPageIndex}
        recentlyActionedTail={recentlyActionedTail}
        remainingMs={remainingFor(elapsedMs, wallboardCardRotationIntervalMs)}
      />

      <WallboardSideIndex
        aircraft={visibleSidebarAircraft}
        highlightedTailIds={highlightedTailIds}
        intervalMs={wallboardSidebarRotationIntervalMs}
        pageCount={sidebarPageCount}
        pageIndex={sidebarPageIndex}
        recentlyActionedTail={recentlyActionedTail}
        remainingMs={remainingFor(elapsedMs, wallboardSidebarRotationIntervalMs)}
      />
    </div>
  );
}
