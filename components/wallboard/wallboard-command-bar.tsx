import { Clock3, Radio, Thermometer, Tv } from "lucide-react";

import { Badge } from "@/components/ui/badge";

type WallboardCommandBarProps = {
  port: string;
  temperatureLabel: string;
  sourceFreshnessLabel: string;
  localTimeLabel: string;
};

export function WallboardCommandBar({
  port,
  temperatureLabel,
  sourceFreshnessLabel,
  localTimeLabel,
}: WallboardCommandBarProps) {
  return (
    <header className="flex items-center justify-between gap-5 border-b border-neutral-200 bg-white px-6 py-4">
      <div className="flex min-w-0 items-center gap-4">
        <Badge variant="red" className="px-3 py-1 text-sm">
          {port}
        </Badge>
        <div className="min-w-0">
          <p className="text-sm font-semibold uppercase tracking-normal text-neutral-500">
            Senior Engineer / Wallboard
          </p>
          <h1 className="text-3xl font-semibold tracking-normal text-neutral-950">
            BNE Wallboard
          </h1>
        </div>
      </div>

      <div className="flex shrink-0 flex-wrap items-center justify-end gap-2">
        <Badge variant="secondary" className="gap-1.5 px-3 py-1 text-sm">
          <Thermometer aria-hidden="true" className="size-4" data-icon />
          {temperatureLabel}
        </Badge>
        <Badge variant="outline" className="gap-1.5 px-3 py-1 text-sm">
          <Radio aria-hidden="true" className="size-4" data-icon />
          {sourceFreshnessLabel}
        </Badge>
        <Badge variant="neutral" className="gap-1.5 px-3 py-1 text-sm">
          <Clock3 aria-hidden="true" className="size-4" data-icon />
          {localTimeLabel}
        </Badge>
        <Badge variant="purple" className="gap-1.5 px-3 py-1 text-sm">
          <Tv aria-hidden="true" className="size-4" data-icon />
          Read-only TV mode
        </Badge>
      </div>
    </header>
  );
}
