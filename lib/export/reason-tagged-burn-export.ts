import * as XLSX from "xlsx";

import type { HqReport, HqReportExportRow } from "@/lib/read-models";

type WorksheetRow = Record<string, string | number | undefined>;

const yesNo = (value: boolean) => (value ? "yes" : "no");

const joinValues = (values: readonly string[]) => values.join(" | ");

const appendSheet = (
  workbook: XLSX.WorkBook,
  sheetName: string,
  rows: readonly WorksheetRow[],
) => {
  const worksheet = XLSX.utils.json_to_sheet(rows);

  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
};

const summaryRowsFor = (report: HqReport): WorksheetRow[] => [
  { Metric: "Generated at", Value: report.generatedAt },
  { Metric: "Filter start", Value: report.filters.startIso },
  { Metric: "Filter end", Value: report.filters.endIso },
  { Metric: "Ports", Value: report.filters.ports?.join(", ") ?? "All" },
  { Metric: "Total runtime minutes", Value: report.totalRuntimeMinutes },
  { Metric: "Total fuel kg", Value: report.totalFuelKg },
  { Metric: "Total dollar impact", Value: report.totalDollarImpact },
  { Metric: "Attributed runtime percent", Value: report.attributedRuntimePercent },
];

const burnRowFor = (row: HqReportExportRow): WorksheetRow => ({
  "Row id": row.rowId,
  "Port": row.port,
  "Tail": row.tail,
  "Aircraft type": row.aircraftType,
  "Aircraft ground event id": row.aircraftGroundEventId,
  "APU event id": row.apuEventId,
  "Closure type": row.closureType,
  "Closure confidence": row.closureConfidence,
  "Manual off status": row.manualOffStatus,
  "Reason segment id": row.reasonSegmentId,
  "Reason category id": row.reasonCategoryId,
  "Reason category": row.reasonCategoryLabel,
  "Reason detail id": row.reasonDetailId,
  "Reason detail": row.reasonDetailLabel,
  "Started at": row.startedAt,
  "Ended at": row.endedAt,
  "Runtime minutes": row.runtimeMinutes,
  "Fuel kg": row.fuelKg,
  "Dollar impact": row.dollarImpact,
  "Currency": row.currency,
  "Fuel price per kg": row.fuelPricePerKg,
  "Fuel price version": row.fuelPriceVersion,
  "Fuel price source event id": row.fuelPriceSourceEventId,
  "Burn assumption version": row.fuelBurnAssumptionVersion,
  "Burn assumption source event id": row.fuelBurnAssumptionSourceEventId,
  "Reason taxonomy version": row.reasonTaxonomyVersion,
  "Reason taxonomy source event id": row.reasonTaxonomySourceEventId,
  "Settings version": row.settingsVersion,
  "Fallback fuel assumption": yesNo(row.isFallbackFuelAssumption),
  "Fallback reason": row.fallbackReason,
  "Event ids": joinValues(row.eventIds),
  "Source event ids": joinValues(row.sourceEventIds),
});

const assumptionRowsFor = (report: HqReport): WorksheetRow[] => {
  const metadata = report.assumptionMetadata;

  return [
    {
      "Assumption": "Fuel price",
      "Version": metadata.fuelPriceVersion,
      "Value": `${metadata.fuelPriceCurrency} ${metadata.fuelPricePerKg}/kg`,
      "Source event id": metadata.fuelPriceSourceEventId,
    },
    {
      "Assumption": "Fuel burn",
      "Version": metadata.fuelBurnAssumptionVersion,
      "Value": "Active fuel-burn table",
      "Source event id": metadata.fuelBurnAssumptionSourceEventId,
    },
    {
      "Assumption": "Reason taxonomy",
      "Version": metadata.reasonTaxonomyVersion,
      "Value": "Active reason taxonomy",
      "Source event id": metadata.reasonTaxonomySourceEventId,
    },
    {
      "Assumption": "Settings",
      "Version": metadata.settingsVersion,
      "Value": metadata.settingsVersion,
      "Source event id": undefined,
    },
  ];
};

const dataQualityRowsFor = (report: HqReport): WorksheetRow[] =>
  report.exportRows
    .filter((row) =>
      row.isFallbackFuelAssumption ||
      row.manualOffStatus !== "not_observed" ||
      row.closureType === "inferred_departed",
    )
    .map((row) => ({
      "Port": row.port,
      "Tail": row.tail,
      "APU event id": row.apuEventId,
      "Manual off status": row.manualOffStatus,
      "Closure type": row.closureType,
      "Closure confidence": row.closureConfidence,
      "Fallback fuel assumption": yesNo(row.isFallbackFuelAssumption),
      "Fallback reason": row.fallbackReason,
      "Source event ids": joinValues(row.sourceEventIds),
    }));

export const createReasonTaggedBurnWorkbook = (report: HqReport): XLSX.WorkBook => {
  const workbook = XLSX.utils.book_new();

  appendSheet(workbook, "Summary", summaryRowsFor(report));
  appendSheet(workbook, "Reason Tagged Burn", report.exportRows.map(burnRowFor));
  appendSheet(workbook, "Assumptions", assumptionRowsFor(report));
  appendSheet(workbook, "Data Quality", dataQualityRowsFor(report));

  return workbook;
};

export const downloadReasonTaggedBurnWorkbook = (
  report: HqReport,
  filename = `reason-tagged-burn-${report.generatedAt.slice(0, 10)}.xlsx`,
) => {
  XLSX.writeFile(createReasonTaggedBurnWorkbook(report), filename);
};
