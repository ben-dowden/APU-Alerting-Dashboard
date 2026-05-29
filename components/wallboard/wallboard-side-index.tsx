"use client";

import { useEffect, useRef, useState } from "react";

import { ApuStatusLed, type ApuStatusLedState } from "@/components/senior/apu-status-led";
import { ReasonCharm } from "@/components/senior/reason-charm";
import { Badge } from "@/components/ui/badge";
import type { AircraftCardReadModel } from "@/lib/read-models";

type WallboardSideIndexProps = {
  aircraft: AircraftCardReadModel[];
};

const rowsPerPage = 10;
const rotationIntervalMs = 5000;

const chunkAircraft = (aircraft: AircraftCardReadModel[]) => {
  const pages: AircraftCardReadModel[][] = [];

  for (let index = 0; index < aircraft.length; index += rowsPerPage) {
    pages.push(aircraft.slice(index, index + rowsPerPage));
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

const apuSignal = (aircraft: AircraftCardReadModel) => {
  if (aircraft.manualOffPending) {
    return "Pending off";
  }

  if (aircraft.apuState === "off") {
    return "APU off";
  }

  return aircraft.currentReason?.categoryLabel ?? aircraft.statusLabel;
};

const apuLedStatus = (aircraft: AircraftCardReadModel): ApuStatusLedState => {
  if (aircraft.manualOffPending) {
    return "pending";
  }

  return aircraft.apuState;
};

const bayCode = (aircraft: AircraftCardReadModel) =>
  (aircraft.bay ?? aircraft.stand ?? "Unassigned").replace(/^Bay\s+/i, "");

const compactMinutes = (minutes: number) => `${minutes}m`;

export function WallboardSideIndex({ aircraft }: WallboardSideIndexProps) {
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
      aria-label="Wallboard side index"
      className="relative flex min-h-0 flex-col border border-neutral-200 bg-white"
      data-rotation-interval-ms={rotationIntervalMs}
    >
      <div className="min-h-0 flex-1 overflow-hidden">
        <table
          aria-label="Wallboard ground aircraft ops table"
          className="w-full table-fixed border-collapse text-left"
        >
          <thead className="sticky top-0 z-10 bg-white">
            <tr className="border-b border-neutral-200 text-xs font-semibold uppercase tracking-normal text-neutral-500">
              <th className="w-[76px] px-3 py-2">Tail</th>
              <th className="w-[48px] px-2 py-2 text-center">Bay</th>
              <th className="w-[38px] px-3 py-2 text-center">APU</th>
              <th className="w-[92px] px-3 py-2 text-right">Elapsed / Ground</th>
              <th className="w-[40px] px-3 py-2 text-center">Rsn</th>
            </tr>
          </thead>
          <tbody>
            {visibleAircraft.map((item) => (
              <tr
                className="h-[30px] border-b border-neutral-100 text-[12px] leading-4 last:border-b-0"
                data-tail={item.tail}
                data-urgency-rank={item.urgencyRank}
                key={item.tail}
              >
                <th
                  className="h-[30px] truncate px-3 py-0 font-semibold text-neutral-950"
                  scope="row"
                >
                  {item.tail}
                </th>
                <td className="h-[30px] px-2 py-0 text-center">
                  <Badge className="min-w-7 justify-center px-1.5 py-0 text-[11px]" variant="neutral">
                    {bayCode(item)}
                  </Badge>
                </td>
                <td className="h-[30px] px-3 py-0 text-center">
                  <ApuStatusLed size="wallboard" status={apuLedStatus(item)} />
                </td>
                <td className="h-[30px] px-3 py-0 text-right font-semibold tabular-nums text-neutral-900">
                  {compactMinutes(item.apuRuntimeMinutes)} / {compactMinutes(item.groundMinutes)}
                </td>
                <td className="h-[30px] px-3 py-0 text-center">
                  <ReasonCharm label={apuSignal(item)} size="wallboard" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {pageCount > 1 ? (
        <div className="absolute bottom-2 right-2 rounded-product bg-neutral-950 px-2.5 py-0.5 text-xs font-semibold text-white">
          [{safePageIndex + 1} of {pageCount}]
        </div>
      ) : null}
    </section>
  );
}
