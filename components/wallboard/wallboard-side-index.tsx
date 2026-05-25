import type { AircraftCardReadModel } from "@/lib/read-models";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils/cn";

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

const hasUrgencyCue = (aircraft: AircraftCardReadModel) => aircraft.urgencyBucket !== "apu_off";

export function WallboardSideIndex({ aircraft }: WallboardSideIndexProps) {
  return (
    <section
      aria-label="Wallboard side index"
      className="flex min-h-0 flex-col rounded-product border border-neutral-200 bg-white"
    >
      <div className="border-b border-neutral-200 px-4 py-3">
        <p className="text-xl font-semibold tracking-normal">Ground aircraft</p>
        <p className="text-sm font-medium text-neutral-500">Current BNE APU signal</p>
      </div>
      <ol className="min-h-0 flex-1 divide-y divide-neutral-100 overflow-y-auto">
        {aircraft.map((item) => {
          const changed = hasUrgencyCue(item);

          return (
            <li
              className={cn(
                "flex min-h-20 items-center justify-between gap-3 border-l-4 px-4 py-3",
                changed ? "border-l-virgin-red bg-red-50/40" : "border-l-transparent",
              )}
              data-tail={item.tail}
              data-urgency-cue={changed ? "changed" : "steady"}
              data-urgency-rank={item.urgencyRank}
              key={item.tail}
            >
              <div className="min-w-0">
                <p className="truncate text-2xl font-semibold tracking-normal text-neutral-950">
                  {item.tail}
                </p>
                <p className="mt-1 truncate text-base font-semibold text-neutral-600">
                  {apuSignal(item)}
                </p>
                <p className="mt-1 text-sm font-medium text-neutral-500">
                  {item.bay ?? "Unassigned"}
                </p>
              </div>
              <Badge
                variant={item.apuState === "on" ? "red" : "outline"}
                className={cn(
                  "shrink-0 px-3 py-1 text-sm",
                  item.apuState === "off" ? "border-green-200 bg-green-50 text-green-700" : undefined,
                )}
              >
                {item.apuState === "on" ? "On" : "Off"}
              </Badge>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
