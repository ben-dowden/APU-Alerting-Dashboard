"use client";

import type { AircraftCardReadModel } from "@/lib/read-models";
import { useKeyedListMotion } from "@/lib/ui/use-keyed-list-motion";
import { WallboardAircraftCard } from "./wallboard-aircraft-card";
import { WallboardTimerWheel } from "./wallboard-timer-wheel";

type WallboardAircraftCarouselProps = {
  aircraft: AircraftCardReadModel[];
  intervalMs: number;
  pageCount: number;
  pageIndex: number;
  recentlyActionedTail?: string;
  remainingMs: number;
};

export function WallboardAircraftCarousel({
  aircraft,
  intervalMs,
  pageCount,
  pageIndex,
  recentlyActionedTail,
  remainingMs,
}: WallboardAircraftCarouselProps) {
  const motion = useKeyedListMotion<HTMLElement>({
    durationMs: 667,
    enterDurationMs: 400,
    enterOffsetPx: 10,
    itemKeys: aircraft.map((aircraftCard) => aircraftCard.tail),
  });

  return (
    <section
      aria-label="Wallboard carousel stage"
      className="flex min-h-0 flex-col"
      data-rotation-interval-ms={intervalMs}
    >
      <div className="mb-2 flex h-8 shrink-0 items-center justify-between gap-3 border border-neutral-200 bg-white px-3">
        <h2 className="text-sm font-semibold uppercase leading-none tracking-normal text-neutral-700">
          Aircraft in focus
        </h2>
        <div className="flex items-center gap-3">
          <p
            aria-live="polite"
            className="text-sm font-semibold leading-none tabular-nums text-neutral-500"
          >
            Page {pageIndex + 1} of {pageCount}
          </p>
          <WallboardTimerWheel
            intervalMs={intervalMs}
            label="Aircraft cards rotate"
            remainingMs={remainingMs}
          />
        </div>
      </div>

      <div className="grid min-h-0 flex-1 grid-cols-2 grid-rows-2 gap-4">
        {aircraft.map((aircraftCard) => (
          <WallboardAircraftCard
            aircraft={aircraftCard}
            isRecentlyActioned={recentlyActionedTail === aircraftCard.tail}
            key={aircraftCard.tail}
            motionRef={(node) => motion.registerItem(aircraftCard.tail, node)}
          />
        ))}
      </div>
    </section>
  );
}
