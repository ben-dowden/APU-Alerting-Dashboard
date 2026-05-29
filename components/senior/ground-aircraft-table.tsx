import type { KeyboardEvent } from "react";

import { Badge } from "@/components/ui/badge";
import type { GroundAircraftState } from "@/lib/read-models";

import { ApuStatusLed, type ApuStatusLedState } from "./apu-status-led";
import { ReasonCharm } from "./reason-charm";

type GroundAircraftTableProps = {
  aircraft: GroundAircraftState[];
  onFocusTail?: (tail: string) => void;
};

const apuSignal = (aircraft: GroundAircraftState) => {
  if (aircraft.manualOffPending) {
    return "Pending off";
  }

  if (aircraft.apuState === "off") {
    return "APU off";
  }

  return aircraft.reasonChain.currentReason?.categoryLabel ?? "Reason pending";
};

const apuLedStatus = (aircraft: GroundAircraftState): ApuStatusLedState => {
  if (aircraft.manualOffPending) {
    return "pending";
  }

  return aircraft.apuState;
};

const bayDisplay = (aircraft: GroundAircraftState) => {
  const bay = aircraft.bay?.trim();

  if (!bay || bay.toLowerCase() === "unassigned") {
    return { code: "U/A", isUnassigned: true };
  }

  return { code: bay.replace(/^Bay\s+/i, ""), isUnassigned: false };
};

const handleRowKeyDown = (
  event: KeyboardEvent<HTMLTableRowElement>,
  tail: string,
  onFocusTail?: (tail: string) => void,
) => {
  if (event.key !== "Enter" && event.key !== " ") {
    return;
  }

  event.preventDefault();
  onFocusTail?.(tail);
};

export function GroundAircraftTable({ aircraft, onFocusTail }: GroundAircraftTableProps) {
  return (
    <section
      aria-label="Ground aircraft summary"
      className="xl:sticky xl:top-4 xl:self-start"
    >
      <div className="border border-neutral-200 bg-white">
        <div className="max-h-[640px] overflow-auto lg:max-h-[calc(100vh-18rem)]">
          <table
            aria-label="Ground aircraft ops table"
            className="w-full min-w-[336px] table-fixed border-collapse text-left text-[12px]"
          >
            <thead className="sticky top-0 z-10 bg-white">
              <tr className="border-b border-neutral-200 text-[11px] font-semibold uppercase tracking-normal text-neutral-500">
                <th className="w-[72px] px-2 py-1.5">Tail</th>
                <th className="w-[64px] px-2 py-1.5 text-center">Bay</th>
                <th className="w-[34px] px-2 py-1.5 text-center">APU</th>
                <th className="w-[58px] px-2 py-1.5 text-right">Burn Elsp</th>
                <th className="w-[78px] px-2 py-1.5 text-right">Ground Time</th>
                <th className="w-[38px] px-2 py-1.5 text-center">Rsn</th>
              </tr>
            </thead>
            <tbody>
              {aircraft.map((item) => {
                const bay = bayDisplay(item);

                return (
                  <tr
                    aria-label={`Show ${item.tail} aircraft card`}
                    className="h-[27px] cursor-pointer border-b border-neutral-100 text-neutral-800 outline-none transition-colors last:border-b-0 hover:bg-neutral-50 focus-visible:bg-neutral-50 focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-virgin-purple"
                    data-focus-tail={item.tail}
                    key={item.tail}
                    onClick={() => onFocusTail?.(item.tail)}
                    onKeyDown={(event) => handleRowKeyDown(event, item.tail, onFocusTail)}
                    tabIndex={0}
                  >
                    <th
                      className="truncate px-2 py-0.5 text-[12px] font-semibold text-neutral-950"
                      scope="row"
                    >
                      {item.tail}
                    </th>
                    <td className="px-2 py-0.5 text-center">
                      <Badge
                        aria-label={bay.isUnassigned ? "Unassigned bay" : `Bay ${bay.code}`}
                        className={
                          bay.isUnassigned
                            ? "min-w-8 justify-center gap-1 border-virgin-red/40 bg-virgin-red/5 px-1.5 py-0 text-[11px] leading-4 text-virgin-red"
                            : "min-w-7 justify-center px-1.5 py-0 text-[11px] leading-4"
                        }
                        variant={bay.isUnassigned ? "outline" : "neutral"}
                      >
                        <span>{bay.code}</span>
                        {bay.isUnassigned ? (
                          <span
                            aria-hidden="true"
                            className="size-1 rounded-full bg-virgin-red"
                          />
                        ) : null}
                      </Badge>
                    </td>
                    <td className="px-2 py-0.5 text-center">
                      <ApuStatusLed status={apuLedStatus(item)} />
                    </td>
                    <td className="px-2 py-0.5 text-right font-medium tabular-nums text-neutral-800">
                      {item.apuRuntimeMinutes} min
                    </td>
                    <td className="px-2 py-0.5 text-right font-medium tabular-nums text-neutral-800">
                      {item.groundMinutes} min
                    </td>
                    <td className="px-2 py-0.5 text-center">
                      <ReasonCharm label={apuSignal(item)} />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
