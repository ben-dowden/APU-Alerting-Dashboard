"use client";

import { useEffect, useRef, useState } from "react";

import type { AircraftCardReadModel } from "@/lib/read-models";
import { WallboardAircraftCard } from "./wallboard-aircraft-card";

type WallboardAircraftCarouselProps = {
  aircraft: AircraftCardReadModel[];
};

const cardsPerPage = 2;
const rotationIntervalMs = 10000;

const chunkAircraft = (aircraft: AircraftCardReadModel[]) => {
  const pages: AircraftCardReadModel[][] = [];

  for (let index = 0; index < aircraft.length; index += cardsPerPage) {
    pages.push(aircraft.slice(index, index + cardsPerPage));
  }

  return pages;
};

const tailIdsForPage = (pages: AircraftCardReadModel[][], pageIndex: number) =>
  pages[pageIndex]?.map((aircraft) => aircraft.tail) ?? [];

const visibleAircraftFor = (aircraft: AircraftCardReadModel[], tailIds: string[]) => {
  const aircraftByTail = new Map(aircraft.map((item) => [item.tail, item]));

  return tailIds
    .map((tail) => aircraftByTail.get(tail))
    .filter((item): item is AircraftCardReadModel => Boolean(item));
};

export function WallboardAircraftCarousel({ aircraft }: WallboardAircraftCarouselProps) {
  const latestAircraftRef = useRef(aircraft);
  const [pageIndex, setPageIndex] = useState(0);
  const [visibleTailIds, setVisibleTailIds] = useState(() =>
    tailIdsForPage(chunkAircraft(aircraft), 0),
  );
  const pages = chunkAircraft(aircraft);
  const pageCount = pages.length;
  const safePageIndex = pageCount > 0 ? Math.min(pageIndex, pageCount - 1) : 0;
  const visibleAircraft = visibleAircraftFor(aircraft, visibleTailIds);

  useEffect(() => {
    latestAircraftRef.current = aircraft;
    setVisibleTailIds((currentTailIds) => {
      const latestTailIds = new Set(aircraft.map((item) => item.tail));
      const currentPageStillExists = currentTailIds.every((tail) => latestTailIds.has(tail));

      return currentPageStillExists ? currentTailIds : tailIdsForPage(chunkAircraft(aircraft), 0);
    });
  }, [aircraft]);

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setPageIndex((currentIndex) => {
        const latestPages = chunkAircraft(latestAircraftRef.current);
        const latestPageCount = latestPages.length;
        const nextIndex = latestPageCount > 0 ? (currentIndex + 1) % latestPageCount : 0;

        setVisibleTailIds(tailIdsForPage(latestPages, nextIndex));

        return nextIndex;
      });
    }, rotationIntervalMs);

    return () => window.clearInterval(intervalId);
  }, []);

  return (
    <section
      aria-label="Wallboard carousel stage"
      className="relative grid min-h-0 grid-cols-2 gap-4"
      data-rotation-interval-ms={rotationIntervalMs}
    >
      <div className="contents transition-opacity duration-200">
        {visibleAircraft.map((aircraftCard) => (
          <WallboardAircraftCard aircraft={aircraftCard} key={aircraftCard.tail} />
        ))}
      </div>

      {pageCount > 1 ? (
        <div className="absolute bottom-3 right-3 rounded-product bg-neutral-950 px-3 py-1 text-sm font-semibold text-white">
          [{safePageIndex + 1} of {pageCount}]
        </div>
      ) : null}
    </section>
  );
}
