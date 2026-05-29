import { Clock3, Radio, Thermometer } from "lucide-react";

import { Badge } from "@/components/ui/badge";

type WallboardCommandBarProps = {
  temperatureLabel: string;
  sourceFreshnessLabel: string;
  localTimeLabel: string;
};

export function WallboardCommandBar({
  temperatureLabel,
  sourceFreshnessLabel,
  localTimeLabel,
}: WallboardCommandBarProps) {
  return (
    <header className="flex items-center justify-between gap-4 border-b border-neutral-200 bg-white px-6 py-3">
      <h1 className="min-w-0 truncate text-xl font-semibold tracking-normal text-neutral-950">
        Daily APU Fuel Burn
      </h1>

      <div className="flex shrink-0 flex-wrap items-center justify-end gap-2">
        <Badge variant="secondary" className="gap-2 px-3 py-1.5 text-sm">
          <Thermometer aria-hidden="true" className="size-4" data-icon />
          {temperatureLabel}
        </Badge>
        <Badge variant="outline" className="gap-2 px-3 py-1.5 text-sm">
          <Radio aria-hidden="true" className="size-4" data-icon />
          {sourceFreshnessLabel}
        </Badge>
        <Badge variant="neutral" className="gap-2 px-3 py-1.5 text-sm">
          <Clock3 aria-hidden="true" className="size-4" data-icon />
          {localTimeLabel}
        </Badge>
      </div>
    </header>
  );
}
