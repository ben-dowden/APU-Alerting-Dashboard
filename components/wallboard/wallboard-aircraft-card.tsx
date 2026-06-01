import { ApuStatusBadge, type ApuStatusBadgeState } from "@/components/senior/apu-status-badge";
import { SourceQualityCharm } from "@/components/senior/source-quality-charm";
import { Badge } from "@/components/ui/badge";
import type { AircraftCardReadModel } from "@/lib/read-models";

type WallboardAircraftCardProps = {
  aircraft: AircraftCardReadModel;
};

const formatDuration = (minutes: number) => {
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  return `${String(hours).padStart(2, "0")}:${String(remainingMinutes).padStart(2, "0")}`;
};

const formatDistance = (distanceMeters: number) => `${distanceMeters}m`;

const apuBadgeState = (aircraft: AircraftCardReadModel): ApuStatusBadgeState => {
  if (aircraft.manualOffPending) {
    return "pending";
  }

  return aircraft.apuState === "off" ? "off" : "on";
};

const reviewLabel = (aircraft: AircraftCardReadModel) => {
  if (aircraft.manualOffPending) {
    return "Paused pending off";
  }

  if (aircraft.reviewState.isReviewDue) {
    return "Review due";
  }

  return aircraft.reviewState.reviewDueAt ? "Review set" : "No review due";
};

export function WallboardAircraftCard({ aircraft }: WallboardAircraftCardProps) {
  return (
    <article
      aria-label={`${aircraft.tail} wallboard aircraft card`}
      className="flex min-h-0 flex-col rounded-product border border-neutral-200 bg-white p-4"
    >
      <AircraftHeader aircraft={aircraft} />
      <AircraftMetricGrid aircraft={aircraft} />

      <div
        aria-label={`${aircraft.tail} wallboard context`}
        className="mt-4 grid min-h-0 flex-1 grid-cols-[minmax(0,1fr)_minmax(13rem,0.68fr)] gap-4 border-t border-neutral-200 pt-4"
        role="group"
      >
        <ReasonSummary aircraft={aircraft} />
        <OperationalStatusStack aircraft={aircraft} />
      </div>
    </article>
  );
}

function AircraftHeader({ aircraft }: { aircraft: AircraftCardReadModel }) {
  return (
    <div className="flex items-start justify-between gap-3">
      <div className="min-w-0">
        <div className="flex min-w-0 items-center gap-2">
          <p className="truncate text-3xl font-semibold leading-9 tracking-normal text-neutral-950">
            {aircraft.tail}
          </p>
          <SourceQualityCharm size="wallboard" sourceCharms={aircraft.sourceCharms} />
        </div>
        <div className="mt-1 flex flex-wrap items-center gap-2 text-base font-semibold text-neutral-500">
          {aircraft.aircraftType ? <span>{aircraft.aircraftType}</span> : null}
          {aircraft.bay ? <span>{aircraft.bay}</span> : null}
        </div>
      </div>
      <ApuStatusBadge size="wallboard" state={apuBadgeState(aircraft)} />
    </div>
  );
}

function AircraftMetricGrid({ aircraft }: { aircraft: AircraftCardReadModel }) {
  return (
    <dl className="mt-4 grid grid-cols-3 gap-2">
      <WallboardMetric label="APU Runtime" value={formatDuration(aircraft.apuRuntimeMinutes)} />
      <WallboardMetric label="Ground Time" value={formatDuration(aircraft.groundMinutes)} />
      <WallboardMetric label="Est. Fuel Burn" value={`${aircraft.estimatedFuelKg} kg`} />
    </dl>
  );
}

function WallboardMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-product bg-neutral-50 p-3">
      <dt className="text-sm font-semibold text-neutral-500">{label}</dt>
      <dd className="mt-1 text-2xl font-semibold tabular-nums text-neutral-950">{value}</dd>
    </div>
  );
}

function ReasonSummary({ aircraft }: { aircraft: AircraftCardReadModel }) {
  return (
    <section aria-label={`Reason for ${aircraft.tail}`} className="min-w-0">
      <p className="text-sm font-semibold uppercase tracking-normal text-neutral-500">Reason</p>
      {aircraft.currentReason ? (
        <CurrentReasonSummary currentReason={aircraft.currentReason} />
      ) : (
        <p className="mt-2 text-2xl font-semibold tracking-normal text-neutral-700">
          Reason pending
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
        <p className="min-w-0 truncate text-2xl font-semibold tracking-normal text-neutral-950">
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

function OperationalStatusStack({ aircraft }: { aircraft: AircraftCardReadModel }) {
  return (
    <section
      aria-label={`Operational status for ${aircraft.tail}`}
      className="grid content-start gap-4"
    >
      <NearbyTailSummary aircraft={aircraft} />
      <ReviewStatusSummary aircraft={aircraft} />
    </section>
  );
}

function NearbyTailSummary({ aircraft }: { aircraft: AircraftCardReadModel }) {
  const closestAircraft = aircraft.proximity.closestAircraft;

  return (
    <div>
      <p className="text-sm font-semibold uppercase tracking-normal text-neutral-500">
        Nearby Tail
      </p>
      {closestAircraft ? (
        <div className="mt-1 flex items-center gap-2">
          <p className="text-xl font-semibold text-neutral-950">{closestAircraft.tail}</p>
          <Badge className="px-2 py-0.5 text-sm leading-5 tabular-nums" variant="secondary">
            {formatDistance(closestAircraft.distanceMeters)}
          </Badge>
        </div>
      ) : (
        <p className="mt-1 text-xl font-semibold text-neutral-700">Unavailable</p>
      )}
    </div>
  );
}

function ReviewStatusSummary({ aircraft }: { aircraft: AircraftCardReadModel }) {
  return (
    <div>
      <p className="text-sm font-semibold uppercase tracking-normal text-neutral-500">
        Review Status
      </p>
      <p className="mt-1 text-xl font-semibold text-neutral-950">{reviewLabel(aircraft)}</p>
    </div>
  );
}
