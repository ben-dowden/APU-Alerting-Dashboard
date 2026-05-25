import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { fuelBurnAssumptionSettings } from "@/lib/fixtures/reference/fuel-assumptions";
import { reasonTaxonomySettings } from "@/lib/fixtures/reference/reason-taxonomy";
import { standCoordinateReferenceEvents } from "@/lib/fixtures/reference/stand-coordinates";
import { bneBaselineScenario } from "@/lib/fixtures/scenarios";
import { deriveAircraftCards, deriveCurrentBoard } from "@/lib/read-models";

const board = deriveCurrentBoard(
  bneBaselineScenario.events,
  {
    fuelBurnAssumptions: fuelBurnAssumptionSettings,
    reasonTaxonomy: reasonTaxonomySettings.payload.snapshot,
    standCoordinates: standCoordinateReferenceEvents,
  },
  "2026-05-22T08:55:00.000Z",
);

const cards = deriveAircraftCards(board);
const apuOnCount = cards.filter((card) => card.apuState === "on").length;
const missingReasonCount = cards.filter((card) => card.urgencyBucket === "missing_reason").length;

export function AdminPreviewPanel() {
  return (
    <section aria-label="BNE read model preview">
      <Card>
        <CardContent className="p-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-normal text-virgin-purple">
                BNE
              </p>
              <p className="mt-1 text-sm font-semibold text-neutral-950">Ground aircraft</p>
            </div>
            <Badge variant="neutral">{cards.length} tails</Badge>
          </div>
          <dl className="mt-4 grid grid-cols-3 gap-3">
            <div className="border-l-2 border-neutral-200 pl-3">
              <dt className="text-xs font-semibold uppercase tracking-normal text-neutral-500">
                APU on
              </dt>
              <dd className="mt-1 text-lg font-semibold text-neutral-950">{apuOnCount}</dd>
            </div>
            <div className="border-l-2 border-neutral-200 pl-3">
              <dt className="text-xs font-semibold uppercase tracking-normal text-neutral-500">
                Missing
              </dt>
              <dd className="mt-1 text-lg font-semibold text-neutral-950">
                {missingReasonCount}
              </dd>
            </div>
            <div className="border-l-2 border-neutral-200 pl-3">
              <dt className="text-xs font-semibold uppercase tracking-normal text-neutral-500">
                Port
              </dt>
              <dd className="mt-1 text-lg font-semibold text-neutral-950">{board.port} port</dd>
            </div>
          </dl>
        </CardContent>
      </Card>
    </section>
  );
}
