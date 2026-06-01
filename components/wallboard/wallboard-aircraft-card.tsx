import { ApuStatusBadge, type ApuStatusBadgeState } from "@/components/senior/apu-status-badge";
import { SourceQualityCharm } from "@/components/senior/source-quality-charm";
import { Badge } from "@/components/ui/badge";
import type { AircraftCardReadModel } from "@/lib/read-models";
import { cn } from "@/lib/utils/cn";

type WallboardAircraftCardProps = {
  aircraft: AircraftCardReadModel;
  isRecentlyActioned?: boolean;
  motionRef?: (node: HTMLElement | null) => void;
};

const formatDuration = (minutes: number) => {
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  return `${String(hours).padStart(2, "0")}:${String(remainingMinutes).padStart(2, "0")}`;
};

const apuBadgeState = (aircraft: AircraftCardReadModel): ApuStatusBadgeState => {
  if (aircraft.manualOffPending) {
    return "pending";
  }

  return aircraft.apuState === "off" ? "off" : "on";
};

export function WallboardAircraftCard({
  aircraft,
  isRecentlyActioned = false,
  motionRef,
}: WallboardAircraftCardProps) {
  return (
    <article
      aria-label={`${aircraft.tail} wallboard aircraft card`}
      className={cn(
        "flex min-h-0 flex-col rounded-product border border-neutral-200 bg-white p-3 transition-shadow",
        isRecentlyActioned && "shadow-lg ring-2 ring-virgin-red/50 ring-offset-2",
      )}
      data-layout-key={`wallboard-card:${aircraft.tail}`}
      data-recently-actioned={isRecentlyActioned ? "true" : "false"}
      ref={motionRef}
    >
      <AircraftHeader aircraft={aircraft} />
      <AircraftMetricGrid aircraft={aircraft} />

      <div
        aria-label={`${aircraft.tail} wallboard context`}
        className="mt-3 min-h-0 flex-1 border-t border-neutral-200 pt-3"
        role="group"
      >
        <ReasonSummary aircraft={aircraft} />
      </div>
    </article>
  );
}

function AircraftHeader({ aircraft }: { aircraft: AircraftCardReadModel }) {
  return (
    <div className="flex items-start justify-between gap-3">
      <div
        aria-label={`${aircraft.tail} identity`}
        className="flex min-w-0 flex-wrap items-baseline gap-x-2 gap-y-1"
        role="group"
      >
        <p className="truncate text-3xl font-semibold leading-8 tracking-normal text-neutral-950">
          {aircraft.tail}
        </p>
        <div className="flex min-w-0 flex-wrap items-center gap-2 text-base font-semibold text-neutral-500">
          {aircraft.aircraftType ? <span>{aircraft.aircraftType}</span> : null}
          {aircraft.bay ? <span>{aircraft.bay}</span> : null}
        </div>
        <div className="self-center">
          <SourceQualityCharm size="wallboard" sourceCharms={aircraft.sourceCharms} />
        </div>
      </div>
      <ApuStatusBadge size="wallboard" state={apuBadgeState(aircraft)} />
    </div>
  );
}

function AircraftMetricGrid({ aircraft }: { aircraft: AircraftCardReadModel }) {
  return (
    <dl className="mt-3 grid grid-cols-3 gap-2">
      <WallboardMetric label="APU Runtime" value={formatDuration(aircraft.apuRuntimeMinutes)} />
      <WallboardMetric label="Ground Time" value={formatDuration(aircraft.groundMinutes)} />
      <WallboardMetric label="Est. Fuel Burn" value={`${aircraft.estimatedFuelKg} kg`} />
    </dl>
  );
}

function WallboardMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-product bg-neutral-50 p-2.5">
      <dt className="text-xs font-semibold text-neutral-500">{label}</dt>
      <dd className="mt-1 text-2xl font-semibold leading-7 tabular-nums text-neutral-950">
        {value}
      </dd>
    </div>
  );
}

function ReasonSummary({ aircraft }: { aircraft: AircraftCardReadModel }) {
  return (
    <section aria-label={`Reason for ${aircraft.tail}`} className="min-w-0">
      <p className="text-sm font-semibold uppercase leading-none tracking-normal text-neutral-500">
        Reason
      </p>
      {aircraft.currentReason ? (
        <CurrentReasonSummary currentReason={aircraft.currentReason} />
      ) : (
        <p className="mt-2 text-2xl font-semibold leading-7 tracking-normal text-neutral-700">
          {aircraft.apuState === "off" ? "APU off" : "Reason pending"}
        </p>
      )}
    </section>
  );
}

function CurrentReasonSummary({
  currentReason,
}: {
  currentReason: NonNullable<AircraftCardReadModel["currentReason"]>;
}) {
  return (
    <div className="mt-2 min-w-0">
      <div className="flex min-w-0 items-center gap-2">
        <p className="min-w-0 break-words text-2xl font-semibold leading-7 tracking-normal text-neutral-950">
          {currentReason.categoryLabel}
        </p>
        <Badge
          className="shrink-0 px-2 py-0.5 text-sm leading-5 tabular-nums text-virgin-purple"
          variant="secondary"
        >
          {formatDuration(currentReason.elapsedMinutes)}
        </Badge>
      </div>
      <p className="mt-1 truncate text-base font-semibold text-neutral-600">
        {currentReason.detailLabel}
      </p>
    </div>
  );
}
