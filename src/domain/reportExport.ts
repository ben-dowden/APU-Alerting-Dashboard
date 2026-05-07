import * as XLSX from "xlsx";
import type { ReportResult, ReportView } from "../types";
import { estimateCostAud, formatDuration, minutesBetween, reasonLabels } from "./apuCalculations";

export function createReportWorkbook(report: ReportResult, view: ReportView) {
  const summaryRows = [
    ["APU Reporting Export"],
    ["Generated at", report.generatedAt],
    ["View", view === "ops" ? "Ops View" : "Savings View"],
    ["Port", report.filters.port],
    ["Period", report.filters.period],
    ["Metric", report.filters.metric],
    ["Total burn hours", report.totalBurnHours],
    ["Estimated cost", report.totalCostAud],
    ["Avoidable cost", report.avoidableCostAud],
    ["Fuel kg", report.totalFuelKg],
    ["Event count", report.totalEvents],
    ["Top reason", report.topReasonLabel],
    [],
    ["Savings scenario", "Reduction %", "Estimated savings"],
    ...report.savingsScenarios.map((scenario) => [
      scenario.label,
      scenario.reductionPercent,
      scenario.estimatedSavingsAud,
    ]),
  ];

  const reasonRows = [
    ["Reason", "Burn hours", "Estimated cost", "Fuel kg", "Event count", "Avoidable cost", "Share of burn", "Top port"],
    ...report.reasonRows.map((row) => [
      row.reasonLabel,
      row.burnHours,
      row.estimatedCostAud,
      row.fuelKg,
      row.eventCount,
      row.avoidableCostAud,
      `${row.shareOfBurn}%`,
      row.topPort,
    ]),
  ];

  const detailRows = [
    [
      "Aircraft",
      "Aircraft type",
      "Port",
      "Bay",
      "APU start",
      "APU stop",
      "Duration",
      "Reason",
      "PCA availability",
      "GPU availability",
      "Estimated cost",
      "Avoidable cost",
    ],
    ...report.records.map((record) => {
      const minutes = minutesBetween(record.apuStartedAt, record.apuStoppedAt);
      const estimatedCost = estimateCostAud(minutes);
      const avoidableCost =
        record.pcaAvailability === "available" || record.gpuAvailability === "available"
          ? estimatedCost
          : Math.round(estimatedCost * 0.25);

      return [
        record.registration,
        record.aircraftType,
        record.port,
        record.bay,
        record.apuStartedAt,
        record.apuStoppedAt,
        formatDuration(minutes),
        reasonLabels[record.reasonCode],
        record.pcaAvailability,
        record.gpuAvailability,
        estimatedCost,
        avoidableCost,
      ];
    }),
  ];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, XLSX.utils.aoa_to_sheet(summaryRows), "Summary");
  XLSX.utils.book_append_sheet(workbook, XLSX.utils.aoa_to_sheet(reasonRows), "Reason Breakdown");
  XLSX.utils.book_append_sheet(workbook, XLSX.utils.aoa_to_sheet(detailRows), "Event Detail");
  return workbook;
}

export function downloadReportWorkbook(report: ReportResult, view: ReportView) {
  const workbook = createReportWorkbook(report, view);
  const date = report.generatedAt.slice(0, 10);
  XLSX.writeFile(workbook, `apu-report-${report.filters.port}-${report.filters.period}-${date}.xlsx`);
}
