import { ApuStatusLed, type ApuStatusLedState } from "@/components/senior/apu-status-led";
import { ReasonCharm } from "@/components/senior/reason-charm";
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
      <div className="min-h-0 flex-1 overflow-auto">
        <table
          aria-label="Wallboard ground aircraft ops table"
          className="w-full table-fixed border-collapse text-left text-sm"
        >
          <thead className="sticky top-0 z-10 bg-white">
            <tr className="border-b border-neutral-200 text-xs font-semibold uppercase tracking-normal text-neutral-500">
              <th className="w-[76px] px-3 py-2">Tail</th>
              <th className="w-[60px] px-3 py-2">Bay</th>
              <th className="w-[38px] px-3 py-2 text-center">APU</th>
              <th className="w-[64px] px-3 py-2 text-right">Elapsed</th>
              <th className="w-[82px] px-3 py-2 text-right">Ground</th>
              <th className="w-[40px] px-3 py-2 text-center">Rsn</th>
            </tr>
          </thead>
          <tbody>
            {aircraft.map((item) => (
              <tr
                className="h-[35px] border-b border-neutral-100 text-[13px] leading-4 last:border-b-0"
                data-tail={item.tail}
                data-urgency-rank={item.urgencyRank}
                key={item.tail}
              >
                <th
                  className="h-[35px] truncate px-3 py-0 font-semibold text-neutral-950"
                  scope="row"
                >
                  {item.tail}
                </th>
                <td className="h-[35px] truncate px-3 py-0 text-neutral-700">{item.bay ?? "Unassigned"}</td>
                <td className="h-[35px] px-3 py-0 text-center">
                  <ApuStatusLed size="wallboard" status={apuLedStatus(item)} />
                </td>
                <td className="h-[35px] px-3 py-0 text-right font-semibold tabular-nums text-neutral-900">
                  {item.apuRuntimeMinutes} min
                </td>
                <td className="h-[35px] px-3 py-0 text-right font-semibold tabular-nums text-neutral-900">
                  {item.groundMinutes} min
                </td>
                <td className="h-[35px] px-3 py-0 text-center">
                  <ReasonCharm label={apuSignal(item)} size="wallboard" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
