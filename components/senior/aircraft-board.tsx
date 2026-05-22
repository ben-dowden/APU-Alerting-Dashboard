import type { AircraftCardReadModel } from "@/lib/read-models";
import { Card } from "@/components/ui/card";

import { AircraftCardContent } from "./aircraft-card-content";

type AircraftBoardProps = {
  aircraft: AircraftCardReadModel[];
};

export function AircraftBoard({ aircraft }: AircraftBoardProps) {
  return (
    <section aria-label="Aircraft work queue" className="grid gap-4 xl:grid-cols-2">
      {aircraft.map((aircraftCard) => (
        <Card
          aria-label={`${aircraftCard.tail} aircraft card`}
          className="min-h-[260px]"
          key={aircraftCard.tail}
          role="article"
        >
          <AircraftCardContent aircraft={aircraftCard} />
        </Card>
      ))}
    </section>
  );
}
