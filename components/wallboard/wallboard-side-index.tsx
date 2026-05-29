"use client";

import { useEffect, useLayoutEffect, useRef, useState, type CSSProperties } from "react";

import { ApuStatusLed, type ApuStatusLedState } from "@/components/senior/apu-status-led";
import { ReasonCharm } from "@/components/senior/reason-charm";
import { Badge } from "@/components/ui/badge";
import type { AircraftCardReadModel } from "@/lib/read-models";

type WallboardSideIndexProps = {
  aircraft: AircraftCardReadModel[];
};

const minRowsPerPage = 12;
const maxRowsPerPage = 15;
const minRowHeightPx = 25;
const targetRowHeightPx = 34;
const railChromeHeightPx = 56;
const rotationIntervalMs = 5000;

type WallboardOpsRailDensity = {
  rowHeightPx: number;
  rowsPerPage: number;
};

export const estimateWallboardOpsRailDensity = (railHeightPx: number): WallboardOpsRailDensity => {
  const availableBodyHeightPx = Math.max(0, railHeightPx - railChromeHeightPx);
  const rowCapacityAtTargetHeight = Math.floor(availableBodyHeightPx / targetRowHeightPx);
  const rowsPerPage = Math.min(
    maxRowsPerPage,
    Math.max(minRowsPerPage, rowCapacityAtTargetHeight),
  );
  const rowHeightPx = Math.min(
    targetRowHeightPx,
    Math.max(minRowHeightPx, Math.floor(availableBodyHeightPx / rowsPerPage)),
  );

  return { rowHeightPx, rowsPerPage };
};

const defaultRailDensity = estimateWallboardOpsRailDensity(0);

const chunkAircraft = (aircraft: AircraftCardReadModel[], pageSize: number) => {
  const pages: AircraftCardReadModel[][] = [];

  for (let index = 0; index < aircraft.length; index += pageSize) {
    pages.push(aircraft.slice(index, index + pageSize));
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
  const railRef = useRef<HTMLElement>(null);
  const [railDensity, setRailDensity] = useState(defaultRailDensity);
  const [pageIndex, setPageIndex] = useState(0);
  const [visibleTailIds, setVisibleTailIds] = useState(() =>
    tailIdsForPage(chunkAircraft(aircraft, defaultRailDensity.rowsPerPage), 0),
  );
  const pages = chunkAircraft(aircraft, railDensity.rowsPerPage);
  const pageCount = pages.length;
  const safePageIndex = pageCount > 0 ? Math.min(pageIndex, pageCount - 1) : 0;
  const visibleAircraft = visibleAircraftFor(aircraft, visibleTailIds);
  const railStyle = {
    "--ops-row-height": `${railDensity.rowHeightPx}px`,
  } as CSSProperties;

  useLayoutEffect(() => {
    const updateRailDensity = () => {
      setRailDensity(estimateWallboardOpsRailDensity(railRef.current?.clientHeight ?? 0));
    };

    updateRailDensity();
    window.addEventListener("resize", updateRailDensity);

    return () => window.removeEventListener("resize", updateRailDensity);
  }, []);

  useEffect(() => {
    const latestPages = chunkAircraft(aircraft, railDensity.rowsPerPage);

    latestAircraftRef.current = aircraft;
    setPageIndex(0);
    setVisibleTailIds(tailIdsForPage(latestPages, 0));
  }, [aircraft, railDensity.rowsPerPage]);

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setPageIndex((currentIndex) => {
        const latestPages = chunkAircraft(latestAircraftRef.current, railDensity.rowsPerPage);
        const latestPageCount = latestPages.length;
        const nextIndex = latestPageCount > 0 ? (currentIndex + 1) % latestPageCount : 0;

        setVisibleTailIds(tailIdsForPage(latestPages, nextIndex));

        return nextIndex;
      });
    }, rotationIntervalMs);

    return () => window.clearInterval(intervalId);
  }, [railDensity.rowsPerPage]);

  return (
    <section
      aria-label="Wallboard side index"
      className="flex min-h-0 flex-col border border-neutral-200 bg-white"
      data-rotation-interval-ms={rotationIntervalMs}
      data-rows-per-page={railDensity.rowsPerPage}
      ref={railRef}
      style={railStyle}
    >
      <div className="flex h-8 shrink-0 items-center justify-between gap-3 border-b border-neutral-200 px-3">
        <h2 className="text-sm font-semibold uppercase leading-none tracking-normal text-neutral-700">
          Aircraft on-ground
        </h2>
        {pageCount > 1 ? (
          <p
            aria-live="polite"
            className="text-sm font-semibold leading-none tabular-nums text-neutral-500"
          >
            Page {safePageIndex + 1} of {pageCount}
          </p>
        ) : null}
      </div>

      <div className="min-h-0 flex-1 overflow-hidden">
        <table
          aria-label="Wallboard ground aircraft ops table"
          className="grid w-full grid-rows-[24px_auto] border-collapse text-left"
        >
          <thead className="sticky top-0 z-10 bg-white">
            <tr className="grid h-6 grid-cols-[104px_68px_56px_minmax(0,1fr)_52px] border-b border-neutral-200 text-[11px] font-semibold uppercase leading-none tracking-normal text-neutral-500">
              <th className="flex items-center px-3 py-0">Tail</th>
              <th className="flex items-center justify-center px-3 py-0">Bay</th>
              <th className="flex items-center justify-center px-3 py-0">APU</th>
              <th className="flex items-center whitespace-nowrap px-2 py-0 text-left">
                Burn Elpsd / Grnd
              </th>
              <th className="flex items-center justify-center px-3 py-0">Rsn</th>
            </tr>
          </thead>
          <tbody className="block">
            {visibleAircraft.map((item) => {
              const bay = bayDisplay(item);

              return (
                <tr
                  className="grid h-[var(--ops-row-height)] grid-cols-[104px_68px_56px_minmax(0,1fr)_52px] border-b border-neutral-100 text-base leading-6 last:border-b-0"
                  data-tail={item.tail}
                  data-urgency-rank={item.urgencyRank}
                  key={item.tail}
                >
                  <th
                    className="flex min-w-0 items-center truncate px-3 py-0 font-semibold text-neutral-950"
                    scope="row"
                  >
                    {item.tail}
                  </th>
                  <td className="flex items-center justify-center px-3 py-0 text-center">
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
                  <td className="flex items-center justify-center px-3 py-0 text-center">
                    <ApuStatusLed size="wallboard" status={apuLedStatus(item)} />
                  </td>
                  <td className="flex items-center px-2 py-0 text-left font-semibold tabular-nums text-neutral-900">
                    {compactMinutes(item.apuRuntimeMinutes)} / {compactMinutes(item.groundMinutes)}
                  </td>
                  <td className="flex items-center justify-center px-3 py-0 text-center">
                    <ReasonCharm label={apuSignal(item)} size="wallboard" />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}
