import type { GroundAircraftState } from "@/lib/read-models";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

type GroundAircraftTableProps = {
  aircraft: GroundAircraftState[];
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

const apuBadgeLabel = (aircraft: GroundAircraftState) => {
  if (aircraft.manualOffPending) {
    return "Pending";
  }

  return aircraft.apuState === "on" ? "On" : "Off";
};

const apuBadgeClassName = (aircraft: GroundAircraftState) => {
  if (aircraft.manualOffPending) {
    return "border-amber-200 bg-amber-50 text-amber-800";
  }

  return aircraft.apuState === "off" ? "border-green-200 bg-green-50 text-green-700" : undefined;
};

export function GroundAircraftTable({ aircraft }: GroundAircraftTableProps) {
  return (
    <section aria-label="Ground aircraft summary">
      <Card>
        <CardContent className="p-0">
          <div className="border-b border-neutral-200 px-4 py-3">
            <p className="text-sm font-semibold text-neutral-950">Ground aircraft</p>
            <p className="text-xs font-medium text-neutral-500">Current BNE APU and reason signal</p>
          </div>
          <div className="max-h-[640px] overflow-auto lg:max-h-[calc(100vh-19rem)]">
            <table aria-label="Ground aircraft side table" className="w-full min-w-[380px] text-left text-sm">
              <thead className="sticky top-0 z-10 bg-white">
                <tr className="border-b border-neutral-200 text-xs font-semibold uppercase tracking-normal text-neutral-500">
                  <th className="px-4 py-2">Tail</th>
                  <th className="px-3 py-2">Bay</th>
                  <th className="px-3 py-2">APU</th>
                  <th className="px-3 py-2">Elapsed</th>
                  <th className="px-3 py-2">Ground</th>
                  <th className="px-3 py-2">Reason</th>
                  <th className="px-4 py-2 text-right">Focus</th>
                </tr>
              </thead>
              <tbody>
                {aircraft.map((item) => (
                  <tr className="border-b border-neutral-100 last:border-b-0" key={item.tail}>
                    <th className="px-4 py-3 text-sm font-semibold text-neutral-950" scope="row">
                      {item.tail}
                    </th>
                    <td className="px-3 py-3 text-neutral-700">{item.bay ?? "Unassigned"}</td>
                    <td className="px-3 py-3">
                      <Badge
                        variant={item.apuState === "on" ? "red" : "outline"}
                        className={apuBadgeClassName(item)}
                        title={item.manualOffPending ? "Source confirmation outstanding" : undefined}
                      >
                        {apuBadgeLabel(item)}
                      </Badge>
                    </td>
                    <td className="px-3 py-3 font-medium text-neutral-800">
                      {item.apuRuntimeMinutes} min
                    </td>
                    <td className="px-3 py-3 font-medium text-neutral-800">{item.groundMinutes} min</td>
                    <td className="px-3 py-3 text-neutral-700">{apuSignal(item)}</td>
                    <td className="px-4 py-3 text-right">
                      <Button data-focus-tail={item.tail} size="sm" type="button" variant="ghost">
                        Focus {item.tail}
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </section>
  );
}
