"use client";

import type { CSSProperties } from "react";

import { ApuStatusLed, type ApuStatusLedState } from "@/components/senior/apu-status-led";
import { ReasonCharm } from "@/components/senior/reason-charm";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils/cn";
import type { AircraftCardReadModel } from "@/lib/read-models";
import { useKeyedListMotion } from "@/lib/ui/use-keyed-list-motion";
import { WallboardTimerWheel } from "./wallboard-timer-wheel";

type WallboardSideIndexProps = {
  aircraft: AircraftCardReadModel[];
  highlightedTailIds?: string[];
  intervalMs: number;
  pageCount: number;
  pageIndex: number;
  recentlyActionedTail?: string;
  remainingMs: number;
};

const minRowsPerPage = 12;
const maxRowsPerPage = 16;
const minRowHeightPx = 25;
const targetRowHeightPx = 34;
const railChromeHeightPx = 56;
const defaultRowHeightPx = 32;

type WallboardOpsRailDensity = {
  rowHeightPx: number;
  rowsPerPage: number;
};

export const estimateWallboardOpsRailDensity = (railHeightPx: number): WallboardOpsRailDensity => {
  const availableBodyHeightPx = Math.max(0, railHeightPx - railChromeHeightPx);
  const rowCapacityAtMinimumHeight = Math.floor(availableBodyHeightPx / minRowHeightPx);
  const rowsPerPage = Math.min(
    maxRowsPerPage,
    Math.max(minRowsPerPage, rowCapacityAtMinimumHeight),
  );
  const rowHeightPx = Math.min(
    targetRowHeightPx,
    Math.max(minRowHeightPx, Math.floor(availableBodyHeightPx / rowsPerPage)),
  );

  return { rowHeightPx, rowsPerPage };
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

export function WallboardSideIndex({
  aircraft,
  highlightedTailIds = [],
  intervalMs,
  pageCount,
  pageIndex,
  recentlyActionedTail,
  remainingMs,
}: WallboardSideIndexProps) {
  const highlightedTails = new Set(highlightedTailIds);
  const motion = useKeyedListMotion<HTMLTableRowElement>({
    durationMs: 489,
    enterDurationMs: 311,
    itemKeys: aircraft.map((item) => item.tail),
  });
  const railStyle = {
    "--ops-row-height": `${defaultRowHeightPx}px`,
  } as CSSProperties;

  return (
    <section
      aria-label="Wallboard side index"
      className="flex min-h-0 flex-col border border-neutral-200 bg-white"
      data-rotation-interval-ms={intervalMs}
      data-rows-per-page={maxRowsPerPage}
      style={railStyle}
    >
      <div className="flex h-8 shrink-0 items-center justify-between gap-3 border-b border-neutral-200 px-3">
        <h2 className="text-sm font-semibold uppercase leading-none tracking-normal text-neutral-700">
          Aircraft on-ground
        </h2>
        <div className="flex items-center gap-3">
          <p
            aria-live="polite"
            className="text-sm font-semibold leading-none tabular-nums text-neutral-500"
          >
            Page {pageIndex + 1} of {pageCount}
          </p>
          <WallboardTimerWheel
            intervalMs={intervalMs}
            label="Sidebar page rotates"
            remainingMs={remainingMs}
          />
        </div>
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
            {aircraft.map((item) => {
              const bay = bayDisplay(item);
              const isHighlighted = highlightedTails.has(item.tail);

              return (
                <tr
                  className={cn(
                    "grid h-[var(--ops-row-height)] grid-cols-[104px_68px_56px_minmax(0,1fr)_52px] border-b border-neutral-100 text-base leading-6 last:border-b-0",
                    isHighlighted && "bg-neutral-100",
                    recentlyActionedTail === item.tail && "shadow-[inset_4px_0_0_var(--virgin-red)]",
                  )}
                  data-highlighted={isHighlighted ? "true" : "false"}
                  data-layout-key={`wallboard-side:${item.tail}`}
                  data-recently-actioned={recentlyActionedTail === item.tail ? "true" : "false"}
                  data-tail={item.tail}
                  data-urgency-rank={item.urgencyRank}
                  key={item.tail}
                  ref={(node) => motion.registerItem(item.tail, node)}
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
