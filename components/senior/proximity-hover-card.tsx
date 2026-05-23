import type { AircraftProximityContext } from "@/lib/domain/proximity";

type ProximityHoverCardProps = {
  tail: string;
  proximity: AircraftProximityContext;
};

const formatDistance = (distanceMeters: number) => `${distanceMeters}m`;

export function ProximityHoverCard({ tail, proximity }: ProximityHoverCardProps) {
  const closest = proximity.closestAircraft;

  if (!closest) {
    return (
      <p className="mt-1 text-sm font-semibold text-neutral-600">No stand context</p>
    );
  }

  return (
    <div className="group relative mt-1">
      <button
        aria-describedby={`proximity-details-${tail}`}
        aria-label={`Nearby aircraft for ${tail}`}
        className="text-left text-sm font-semibold text-neutral-950 outline-none focus-visible:ring-2 focus-visible:ring-virgin-purple"
        type="button"
      >
        Closest tail: {closest.tail} · {formatDistance(closest.distanceMeters)}
      </button>
      <div
        className="pointer-events-none absolute left-0 top-full z-20 mt-2 min-w-[220px] rounded-product border border-neutral-200 bg-white p-3 text-xs text-neutral-700 opacity-0 shadow-lg transition-opacity group-focus-within:opacity-100 group-hover:opacity-100"
        id={`proximity-details-${tail}`}
        role="tooltip"
      >
        <p className="font-semibold text-neutral-950">Nearby APU on</p>
        {proximity.nearbyApuAircraft.length > 0 ? (
          <ul className="mt-2 grid gap-1">
            {proximity.nearbyApuAircraft.map((aircraft) => (
              <li className="flex items-center justify-between gap-3" key={aircraft.tail}>
                <span>{aircraft.tail}</span>
                <span className="text-neutral-500">
                  {aircraft.bay ?? aircraft.stand} · {formatDistance(aircraft.distanceMeters)}
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-2 text-neutral-500">No APU-running aircraft within 100m</p>
        )}
      </div>
    </div>
  );
}
