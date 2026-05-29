"use client";

import { useEffect, useRef, useState } from "react";

import { ApuStatusLed, type ApuStatusLedState } from "@/components/senior/apu-status-led";
import { ReasonCharm } from "@/components/senior/reason-charm";
import { Badge } from "@/components/ui/badge";
import type { AircraftCardReadModel } from "@/lib/read-models";

type WallboardSideIndexProps = {
  aircraft: AircraftCardReadModel[];
};

const rowsPerPage = 12;
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

const bayDisplay = (aircraft: AircraftCardReadModel) => {
  const bay = aircraft.bay ?? aircraft.stand;

  if (!bay || bay.toLowerCase() === "unassigned") {
    return { code: "U/A", isUnassigned: true };
  }

  return { code: bay.replace(/^Bay\s+/i, ""), isUnassigned: false };
};

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
          className="h-[calc(100%-2rem)] w-full table-fixed border-collapse text-left"
        >
          <thead className="sticky top-0 z-10 bg-white">
            <tr className="h-6 border-b border-neutral-200 text-[11px] font-semibold uppercase leading-none tracking-normal text-neutral-500">
              <th className="w-[104px] px-3 py-0">Tail</th>
              <th className="w-[72px] px-3 py-0 text-center">Bay</th>
              <th className="w-[58px] px-3 py-0 text-center">APU</th>
              <th className="w-[154px] whitespace-nowrap px-2 py-0 text-left">Burn Elpsd / Grnd</th>
              <th className="w-[52px] px-3 py-0 text-center">Rsn</th>
            </tr>
          </thead>
          <tbody>
            {visibleAircraft.map((item) => {
              const bay = bayDisplay(item);

              return (
                <tr
                  className="border-b border-neutral-100 text-base leading-6 last:border-b-0"
                  data-tail={item.tail}
                  data-urgency-rank={item.urgencyRank}
                  key={item.tail}
                >
                  <th
                    className="truncate px-3 py-0 font-semibold text-neutral-950"
                    scope="row"
                  >
                    {item.tail}
                  </th>
                  <td className="px-3 py-0 text-center">
                    <Badge
                      aria-label={bay.isUnassigned ? "Unassigned bay" : `Bay ${bay.code}`}
                      className={
                        bay.isUnassigned
                          ? "min-w-10 justify-center gap-1 border-virgin-red/40 bg-virgin-red/5 px-1.5 py-0 text-[15px] text-virgin-red"
                          : "min-w-9 justify-center px-1.5 py-0 text-[15px]"
                      }
                      variant={bay.isUnassigned ? "outline" : "neutral"}
                    >
                      <span>{bay.code}</span>
                      {bay.isUnassigned ? (
                        <span aria-hidden="true" className="size-1.5 rounded-full bg-virgin-red" />
                      ) : null}
                    </Badge>
                  </td>
                  <td className="px-3 py-0 text-center">
                    <ApuStatusLed size="wallboard" status={apuLedStatus(item)} />
                  </td>
                  <td className="px-2 py-0 text-left font-semibold tabular-nums text-neutral-900">
                    {compactMinutes(item.apuRuntimeMinutes)} / {compactMinutes(item.groundMinutes)}
                  </td>
                  <td className="px-3 py-0 text-center">
                    <ReasonCharm label={apuSignal(item)} size="wallboard" />
                  </td>
                </tr>
              );
            })}
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
