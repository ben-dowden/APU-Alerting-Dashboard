import type { AircraftCardReadModel } from "@/lib/read-models";
import { Badge } from "@/components/ui/badge";
import { ProximityHoverCard } from "./proximity-hover-card";
import { SourceQualityCharm } from "./source-quality-charm";

type AircraftCardContentProps = {
  aircraft: AircraftCardReadModel;
};

const formatDuration = (minutes: number) => {
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  return `${String(hours).padStart(2, "0")}:${String(remainingMinutes).padStart(2, "0")}`;
};

const apuStateLabel = (state: AircraftCardReadModel["apuState"]) =>
  state === "on" ? "APU On" : "APU Off";

const reviewLabel = (aircraft: AircraftCardReadModel) => {
  if (aircraft.reviewState.isReviewDue) {
    return "Review due";
  }

  return aircraft.reviewState.reviewDueAt ? "Review set" : "No review due";
};

export function AircraftCardContent({ aircraft }: AircraftCardContentProps) {
  return (
    <div className="flex h-full flex-col gap-4 p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-2xl font-semibold tracking-normal text-neutral-950">{aircraft.tail}</p>
          <div className="mt-1 flex flex-wrap items-center gap-2 text-xs font-semibold text-neutral-500">
            {aircraft.aircraftType ? <span>{aircraft.aircraftType}</span> : null}
            {aircraft.bay ? <span>{aircraft.bay}</span> : null}
          </div>
          <SourceQualityCharm sourceCharms={aircraft.sourceCharms} />
        </div>
        <Badge
          variant={aircraft.apuState === "on" ? "red" : "outline"}
          className={aircraft.apuState === "off" ? "border-green-200 bg-green-50 text-green-700" : undefined}
        >
          {apuStateLabel(aircraft.apuState)}
        </Badge>
      </div>

      <dl className="grid grid-cols-3 gap-2">
        <div className="rounded-product bg-neutral-50 p-3">
          <dt className="text-xs font-medium text-neutral-500">APU runtime</dt>
          <dd className="mt-1 text-lg font-semibold text-neutral-950">
            {formatDuration(aircraft.apuRuntimeMinutes)}
          </dd>
        </div>
        <div className="rounded-product bg-neutral-50 p-3">
          <dt className="text-xs font-medium text-neutral-500">Ground time</dt>
          <dd className="mt-1 text-lg font-semibold text-neutral-950">
            {formatDuration(aircraft.groundMinutes)}
          </dd>
        </div>
        <div className="rounded-product bg-neutral-50 p-3">
          <dt className="text-xs font-medium text-neutral-500">Fuel</dt>
          <dd className="mt-1 text-lg font-semibold text-neutral-950">{aircraft.estimatedFuelKg} kg</dd>
        </div>
      </dl>

      <div className="grid gap-3 border-t border-neutral-200 pt-3 sm:grid-cols-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-normal text-neutral-500">Current reason</p>
          {aircraft.currentReason ? (
            <div className="mt-1">
              <p className="text-sm font-semibold text-neutral-950">
                {aircraft.currentReason.categoryLabel}
              </p>
              <p className="text-xs font-medium text-neutral-500">
                {aircraft.currentReason.detailLabel}
              </p>
              <p className="mt-1 text-xs font-semibold text-virgin-purple">
                {formatDuration(aircraft.currentReason.elapsedMinutes)}
              </p>
            </div>
          ) : (
            <p className="mt-1 text-sm font-semibold text-neutral-600">Reason pending</p>
          )}
        </div>

        <div>
          <p className="text-xs font-semibold uppercase tracking-normal text-neutral-500">Review</p>
          <p className="mt-1 text-sm font-semibold text-neutral-950">{reviewLabel(aircraft)}</p>
        </div>

        <div>
          <p className="text-xs font-semibold uppercase tracking-normal text-neutral-500">Nearby</p>
          <ProximityHoverCard proximity={aircraft.proximity} tail={aircraft.tail} />
        </div>
      </div>
    </div>
  );
}
