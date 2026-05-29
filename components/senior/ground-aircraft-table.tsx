import type { KeyboardEvent } from "react";

import type { GroundAircraftState } from "@/lib/read-models";

import { ApuStatusLed, type ApuStatusLedState } from "./apu-status-led";

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
            className="w-full min-w-[360px] table-fixed text-left text-[12px]"
          >
            <thead className="sticky top-0 z-10 bg-white">
              <tr className="border-b border-neutral-200 text-[11px] font-semibold uppercase tracking-normal text-neutral-500">
                <th className="w-[72px] px-2 py-1.5">Tail</th>
                <th className="w-[64px] px-2 py-1.5">Bay</th>
                <th className="w-[34px] px-2 py-1.5 text-center">APU</th>
                <th className="w-[58px] px-2 py-1.5 text-right">Elapsed</th>
                <th className="w-[70px] px-2 py-1.5 text-right">Ground</th>
                <th className="px-2 py-1.5">Reason</th>
              </tr>
            </thead>
            <tbody>
              {aircraft.map((item) => (
                <tr
                  aria-label={`Show ${item.tail} aircraft card`}
                  className="h-[34px] cursor-pointer border-b border-neutral-100 text-neutral-800 outline-none transition-colors last:border-b-0 hover:bg-neutral-50 focus-visible:bg-neutral-50 focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-virgin-purple"
                  data-focus-tail={item.tail}
                  key={item.tail}
                  onClick={() => onFocusTail?.(item.tail)}
                  onKeyDown={(event) => handleRowKeyDown(event, item.tail, onFocusTail)}
                  tabIndex={0}
                >
                  <th
                    className="truncate px-2 py-1 text-[12px] font-semibold text-neutral-950"
                    scope="row"
                  >
                    {item.tail}
                  </th>
                  <td className="truncate px-2 py-1 text-neutral-700">{item.bay ?? "Unassigned"}</td>
                  <td className="px-2 py-1 text-center">
                    <ApuStatusLed status={apuLedStatus(item)} />
                  </td>
                  <td className="px-2 py-1 text-right font-medium tabular-nums text-neutral-800">
                    {item.apuRuntimeMinutes} min
                  </td>
                  <td className="px-2 py-1 text-right font-medium tabular-nums text-neutral-800">
                    {item.groundMinutes} min
                  </td>
                  <td className="truncate px-2 py-1 text-neutral-700">{apuSignal(item)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
