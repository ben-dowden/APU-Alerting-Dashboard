import type { AircraftCardReadModel } from "@/lib/read-models";
import { Badge } from "@/components/ui/badge";

type WallboardAircraftCardProps = {
  aircraft: AircraftCardReadModel;
};

const formatDuration = (minutes: number) => {
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  return `${String(hours).padStart(2, "0")}:${String(remainingMinutes).padStart(2, "0")}`;
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

const sourceSystemsFor = (aircraft: AircraftCardReadModel) => [
  ...new Set(aircraft.sourceCharms.map((source) => source.sourceSystem)),
];

export function WallboardAircraftCard({ aircraft }: WallboardAircraftCardProps) {
  const closestAircraft = aircraft.proximity.closestAircraft;
  const sourceSystems = sourceSystemsFor(aircraft);

  return (
    <article
      aria-label={`${aircraft.tail} wallboard aircraft card`}
      className="flex min-h-0 flex-col rounded-product border border-neutral-200 bg-white p-5"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-4xl font-semibold tracking-normal text-neutral-950">{aircraft.tail}</p>
          <div className="mt-2 flex flex-wrap items-center gap-2 text-lg font-semibold text-neutral-500">
            {aircraft.aircraftType ? <span>{aircraft.aircraftType}</span> : null}
            {aircraft.bay ? <span>{aircraft.bay}</span> : null}
          </div>
        </div>
        <Badge
          variant={aircraft.apuState === "on" ? "red" : "outline"}
          className={
            aircraft.apuState === "off" ? "border-green-200 bg-green-50 text-green-700" : undefined
          }
        >
          {aircraft.apuState === "on" ? "APU On" : "APU Off"}
        </Badge>
      </div>

      <dl className="mt-5 grid grid-cols-3 gap-3">
        <WallboardMetric label="APU runtime" value={formatDuration(aircraft.apuRuntimeMinutes)} />
        <WallboardMetric label="Ground time" value={formatDuration(aircraft.groundMinutes)} />
        <WallboardMetric label="Fuel" value={`${aircraft.estimatedFuelKg} kg`} />
      </dl>

      <div className="mt-5 grid flex-1 gap-4 border-t border-neutral-200 pt-4 lg:grid-cols-2">
        <section aria-label={`Ground support for ${aircraft.tail}`}>
          <p className="text-sm font-semibold uppercase tracking-normal text-neutral-500">
            Ground support
          </p>
          {aircraft.currentReason ? (
            <div className="mt-2">
              <p className="text-2xl font-semibold tracking-normal text-neutral-950">
                {aircraft.currentReason.categoryLabel}
              </p>
              <p className="mt-1 text-lg font-semibold text-neutral-600">
                {aircraft.currentReason.detailLabel}
              </p>
              <p className="mt-2 text-xl font-semibold text-virgin-purple">
                {formatDuration(aircraft.currentReason.elapsedMinutes)}
              </p>
            </div>
          ) : (
            <p className="mt-2 text-2xl font-semibold tracking-normal text-neutral-700">
              Reason pending
            </p>
          )}
        </section>

        <section aria-label={`Operational status for ${aircraft.tail}`} className="grid gap-3">
          <div>
            <p className="text-sm font-semibold uppercase tracking-normal text-neutral-500">
              Review
            </p>
            <p className="mt-1 text-xl font-semibold text-neutral-950">{reviewLabel(aircraft)}</p>
          </div>
          <div>
            <p className="text-sm font-semibold uppercase tracking-normal text-neutral-500">
              Nearby
            </p>
            <p className="mt-1 text-lg font-semibold text-neutral-950">
              {closestAircraft
                ? `Closest tail: ${closestAircraft.tail}`
                : "Closest tail: unavailable"}
            </p>
          </div>
          <div aria-label={`Source charms for ${aircraft.tail}`} className="flex flex-wrap gap-2" role="group">
            {sourceSystems.length > 0 ? (
              sourceSystems.map((sourceSystem) => (
                <Badge key={sourceSystem} variant="outline" className="text-sm">
                  {sourceSystem}
                </Badge>
              ))
            ) : (
              <Badge variant="outline" className="text-sm">
                Sources pending
              </Badge>
            )}
          </div>
        </section>
      </div>
    </article>
  );
}

function WallboardMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-product bg-neutral-50 p-3">
      <dt className="text-sm font-semibold text-neutral-500">{label}</dt>
      <dd className="mt-2 text-2xl font-semibold text-neutral-950">{value}</dd>
    </div>
  );
}
