import { ApuStatusLed, type ApuStatusLedState } from "@/components/senior/apu-status-led";
import type { AircraftCardReadModel } from "@/lib/read-models";

type WallboardSideIndexProps = {
  aircraft: AircraftCardReadModel[];
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

export function WallboardSideIndex({ aircraft }: WallboardSideIndexProps) {
  return (
    <section
      aria-label="Wallboard side index"
      className="flex min-h-0 flex-col border border-neutral-200 bg-white"
    >
      <div className="border-b border-neutral-200 px-4 py-3">
        <p className="text-lg font-semibold tracking-normal">Ground aircraft</p>
        <p className="text-sm font-medium text-neutral-500">Current BNE APU and reason signal</p>
      </div>
      <div className="min-h-0 flex-1 overflow-auto">
        <table
          aria-label="Wallboard ground aircraft ops table"
          className="w-full table-fixed text-left text-sm"
        >
          <thead className="sticky top-0 z-10 bg-white">
            <tr className="border-b border-neutral-200 text-xs font-semibold uppercase tracking-normal text-neutral-500">
              <th className="w-[86px] px-3 py-2">Tail</th>
              <th className="w-[74px] px-3 py-2">Bay</th>
              <th className="w-[44px] px-3 py-2 text-center">APU</th>
              <th className="w-[74px] px-3 py-2 text-right">Elapsed</th>
              <th className="w-[74px] px-3 py-2 text-right">Ground</th>
              <th className="px-3 py-2">Reason</th>
            </tr>
          </thead>
          <tbody>
            {aircraft.map((item) => (
              <tr
                className="h-10 border-b border-neutral-100 last:border-b-0"
                data-tail={item.tail}
                data-urgency-rank={item.urgencyRank}
                key={item.tail}
              >
                <th
                  className="truncate px-3 py-2 text-sm font-semibold text-neutral-950"
                  scope="row"
                >
                  {item.tail}
                </th>
                <td className="truncate px-3 py-2 text-neutral-700">{item.bay ?? "Unassigned"}</td>
                <td className="px-3 py-2 text-center">
                  <ApuStatusLed size="wallboard" status={apuLedStatus(item)} />
                </td>
                <td className="px-3 py-2 text-right font-semibold tabular-nums text-neutral-900">
                  {item.apuRuntimeMinutes} min
                </td>
                <td className="px-3 py-2 text-right font-semibold tabular-nums text-neutral-900">
                  {item.groundMinutes} min
                </td>
                <td className="truncate px-3 py-2 font-medium text-neutral-700">
                  {apuSignal(item)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
