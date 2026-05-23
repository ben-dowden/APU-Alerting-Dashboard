import { HQReportsOverview } from "@/components/hq/hq-reports-overview";
import { fuelBurnAssumptionSettings, fuelPriceSettings } from "@/lib/fixtures/reference/fuel-assumptions";
import { reasonTaxonomySettings } from "@/lib/fixtures/reference/reason-taxonomy";
import { standCoordinateReferenceEvents } from "@/lib/fixtures/reference/stand-coordinates";
import { bneScenarios } from "@/lib/fixtures/scenarios";
import { deriveHqReport, type HqReportSettings } from "@/lib/read-models";

const reportSettings: HqReportSettings = {
  reasonTaxonomy: reasonTaxonomySettings,
  fuelBurnAssumptions: fuelBurnAssumptionSettings,
  fuelPrice: fuelPriceSettings,
  standCoordinates: standCoordinateReferenceEvents,
};

const hqReport = deriveHqReport(
  bneScenarios.flatMap((scenario) => scenario.events),
  reportSettings,
  {
    startIso: "2026-05-22T00:00:00.000Z",
    endIso: "2026-05-22T12:55:00.000Z",
    ports: ["BNE"],
  },
);

export default function HqReportsPage() {
  return (
    <HQReportsOverview
      description="Export-first HQ view for reconciled reason-tagged burn rows, downstream lineage, and assumption metadata."
      eyebrow="HQ"
      report={hqReport}
      title="HQ Reports"
      variant="export"
    />
  );
}
