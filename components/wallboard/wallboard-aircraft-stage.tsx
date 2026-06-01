"use client";

import { useEffect, useMemo, useState } from "react";

import type { AircraftCardReadModel } from "@/lib/read-models";
import { WallboardAircraftCarousel } from "./wallboard-aircraft-carousel";
import { WallboardSideIndex } from "./wallboard-side-index";

type WallboardAircraftStageProps = {
  aircraft: AircraftCardReadModel[];
};

export const wallboardCardPageSize = 4;
export const wallboardSidebarPageSize = 16;
export const wallboardCardRotationIntervalMs = 5000;
export const wallboardSidebarRotationIntervalMs = 20000;

const tickMs = 1000;

const chunkAircraft = (aircraft: AircraftCardReadModel[], pageSize: number) => {
  const pages: AircraftCardReadModel[][] = [];

  for (let index = 0; index < aircraft.length; index += pageSize) {
    pages.push(aircraft.slice(index, index + pageSize));
  }

  return pages;
};

const remainingFor = (elapsedMs: number, intervalMs: number) =>
  intervalMs - (elapsedMs % intervalMs);

export function WallboardAircraftStage({ aircraft }: WallboardAircraftStageProps) {
  const [elapsedMs, setElapsedMs] = useState(0);
  const aircraftSignature = useMemo(
    () => aircraft.map((aircraftCard) => aircraftCard.tail).join("|"),
    [aircraft],
  );

  useEffect(() => {
    setElapsedMs(0);
  }, [aircraftSignature]);

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setElapsedMs((currentElapsedMs) => currentElapsedMs + tickMs);
    }, tickMs);

    return () => window.clearInterval(intervalId);
  }, [aircraftSignature]);

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
        remainingMs={remainingFor(elapsedMs, wallboardCardRotationIntervalMs)}
      />

      <WallboardSideIndex
        aircraft={visibleSidebarAircraft}
        highlightedTailIds={highlightedTailIds}
        intervalMs={wallboardSidebarRotationIntervalMs}
        pageCount={sidebarPageCount}
        pageIndex={sidebarPageIndex}
        remainingMs={remainingFor(elapsedMs, wallboardSidebarRotationIntervalMs)}
      />
    </div>
  );
}
