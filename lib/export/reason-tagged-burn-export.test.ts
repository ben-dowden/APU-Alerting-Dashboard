import { describe, expect, it } from "vitest";
import * as XLSX from "xlsx";

import { fuelBurnAssumptionSettings, fuelPriceSettings } from "@/lib/fixtures/reference/fuel-assumptions";
import { reasonTaxonomySettings } from "@/lib/fixtures/reference/reason-taxonomy";
import { standCoordinateReferenceEvents } from "@/lib/fixtures/reference/stand-coordinates";
import {
  bneManualOffConfirmedScenario,
  bneManualOffContradictedScenario,
  bneMissingBurnAssumptionScenario,
} from "@/lib/fixtures/scenarios";
import { deriveHqReport, type HqReportSettings } from "@/lib/read-models";

import { createReasonTaggedBurnWorkbook } from "./reason-tagged-burn-export";

const settings: HqReportSettings = {
  reasonTaxonomy: reasonTaxonomySettings,
  fuelBurnAssumptions: fuelBurnAssumptionSettings,
  fuelPrice: fuelPriceSettings,
  standCoordinates: standCoordinateReferenceEvents,
};

const report = deriveHqReport(
  [
    ...bneManualOffConfirmedScenario.events,
    ...bneManualOffContradictedScenario.events,
    ...bneMissingBurnAssumptionScenario.events,
  ],
  settings,
  {
    startIso: "2026-05-22T00:00:00.000Z",
    endIso: "2026-05-22T12:55:00.000Z",
    ports: ["BNE"],
  },
);

const sheetRows = <TRow>(workbook: XLSX.WorkBook, sheetName: string) =>
  XLSX.utils.sheet_to_json<TRow>(workbook.Sheets[sheetName]);

describe("createReasonTaggedBurnWorkbook", () => {
  it("creates the required workbook sheets", () => {
    const workbook = createReasonTaggedBurnWorkbook(report);

    expect(workbook.SheetNames).toEqual([
      "Summary",
      "Reason Tagged Burn",
      "Assumptions",
      "Data Quality",
    ]);
  });

  it("reconciles summary and export totals with the HQ report", () => {
    const workbook = createReasonTaggedBurnWorkbook(report);
    const summaryRows = sheetRows<{ Metric: string; Value: number | string }>(workbook, "Summary");
    const burnRows = sheetRows<{
      "Runtime minutes": number;
      "Fuel kg": number;
      "Dollar impact": number;
    }>(workbook, "Reason Tagged Burn");

    expect(summaryRows).toEqual(expect.arrayContaining([
      { Metric: "Total runtime minutes", Value: report.totalRuntimeMinutes },
      { Metric: "Total fuel kg", Value: report.totalFuelKg },
      { Metric: "Total dollar impact", Value: report.totalDollarImpact },
      { Metric: "Attributed runtime percent", Value: report.attributedRuntimePercent },
    ]));
    expect(burnRows.reduce((total, row) => total + row["Runtime minutes"], 0)).toBe(report.totalRuntimeMinutes);
    expect(Math.round(burnRows.reduce((total, row) => total + row["Fuel kg"], 0) * 10) / 10).toBe(report.totalFuelKg);
    expect(Math.round(burnRows.reduce((total, row) => total + row["Dollar impact"], 0) * 100) / 100).toBe(report.totalDollarImpact);
  });

  it("includes lineage, settings versions, manual-off status, and fallback-rate flags", () => {
    const workbook = createReasonTaggedBurnWorkbook(report);
    const burnRows = sheetRows<Record<string, string | number>>(workbook, "Reason Tagged Burn");

    expect(burnRows).toEqual(expect.arrayContaining([
      expect.objectContaining({
        "Tail": "VH-8NJ",
        "Manual off status": "confirmed_by_source",
        "Closure type": "source_off",
        "Fuel price version": "fuel-price-v1",
        "Burn assumption version": "fuel-burn-assumptions-v1",
        "Reason taxonomy version": "reason-taxonomy-v1",
        "Settings version": "reason-taxonomy-v1/fuel-burn-assumptions-v1/fuel-price-v1",
      }),
      expect.objectContaining({
        "Tail": "VH-8XA",
        "Manual off status": "contradicted_by_source",
        "Closure type": "open",
      }),
      expect.objectContaining({
        "Tail": "VH-ZHA",
        "Fallback fuel assumption": "yes",
        "Fallback reason": "Configured fallback when equipment type is missing or unmatched.",
      }),
    ]));
    expect(String(burnRows[0]["Source event ids"])).toContain("ACMS-");
    expect(String(burnRows[0]["Aircraft ground event id"])).toContain("AIMS-");
    expect(String(burnRows[0]["APU event id"])).toContain(":apu:");
  });

  it("writes assumption and data-quality sheets for reconciliation review", () => {
    const workbook = createReasonTaggedBurnWorkbook(report);
    const assumptionRows = sheetRows<Record<string, string | number>>(workbook, "Assumptions");
    const dataQualityRows = sheetRows<Record<string, string | number>>(workbook, "Data Quality");

    expect(assumptionRows).toEqual(expect.arrayContaining([
      expect.objectContaining({
        "Assumption": "Fuel price",
        "Version": "fuel-price-v1",
        "Value": "AUD 1.18/kg",
      }),
      expect.objectContaining({
        "Assumption": "Fuel burn",
        "Version": "fuel-burn-assumptions-v1",
      }),
    ]));
    expect(dataQualityRows).toEqual(expect.arrayContaining([
      expect.objectContaining({
        "Tail": "VH-ZHA",
        "Fallback fuel assumption": "yes",
      }),
      expect.objectContaining({
        "Tail": "VH-8XA",
        "Manual off status": "contradicted_by_source",
      }),
    ]));
  });
});
