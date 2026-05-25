import { deriveHqReport, type HqReportSettings } from "@/lib/read-models";

import { fuelBurnAssumptionSettings, fuelPriceSettings } from "./reference/fuel-assumptions";
import { reasonTaxonomySettings } from "./reference/reason-taxonomy";
import { standCoordinateReferenceEvents } from "./reference/stand-coordinates";
import { bneScenarios } from "./scenarios";

export const bneHqReportSettings: HqReportSettings = {
  reasonTaxonomy: reasonTaxonomySettings,
  fuelBurnAssumptions: fuelBurnAssumptionSettings,
  fuelPrice: fuelPriceSettings,
  standCoordinates: standCoordinateReferenceEvents,
};

export const bneHqReport = deriveHqReport(
  bneScenarios.flatMap((scenario) => scenario.events),
  bneHqReportSettings,
  {
    startIso: "2026-05-22T00:00:00.000Z",
    endIso: "2026-05-22T12:55:00.000Z",
    ports: ["BNE"],
  },
);
