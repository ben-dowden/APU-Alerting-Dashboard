import { describe, expect, it } from "vitest";
import type { HistoricalApuRecord, ReportFilters } from "../types";
import { createReportResult, getPeriodStart } from "./reportingEngine";

const records: HistoricalApuRecord[] = [
  {
    id: "a",
    registration: "VH-A",
    aircraftType: "737-800",
    port: "BNE",
    bay: "Bay 1",
    apuStartedAt: "2026-05-06T10:00:00.000Z",
    apuStoppedAt: "2026-05-06T11:00:00.000Z",
    pcaAvailability: "available",
    gpuAvailability: "available",
    reasonCode: "turnaround-pressure",
  },
  {
    id: "b",
    registration: "VH-B",
    aircraftType: "737-MAX",
    port: "MEL",
    bay: "Bay 2",
    apuStartedAt: "2026-05-05T10:00:00.000Z",
    apuStoppedAt: "2026-05-05T10:30:00.000Z",
    pcaAvailability: "unavailable",
    gpuAvailability: "unavailable",
    reasonCode: "maintenance",
  },
  {
    id: "c",
    registration: "VH-C",
    aircraftType: "737-MAX",
    port: "BNE",
    bay: "Bay 3",
    apuStartedAt: "2026-01-05T10:00:00.000Z",
    apuStoppedAt: "2026-01-05T11:00:00.000Z",
    pcaAvailability: "available",
    gpuAvailability: "available",
    reasonCode: "crew-request",
  },
];

describe("getPeriodStart", () => {
  it("calculates period boundaries from the report anchor date", () => {
    const anchor = new Date("2026-05-07T00:00:00.000Z");

    expect(getPeriodStart("1d", anchor).toISOString()).toBe("2026-05-06T00:00:00.000Z");
    expect(getPeriodStart("1wk", anchor).toISOString()).toBe("2026-04-30T00:00:00.000Z");
    expect(getPeriodStart("1m", anchor).toISOString()).toBe("2026-04-07T00:00:00.000Z");
    expect(getPeriodStart("3m", anchor).toISOString()).toBe("2026-02-07T00:00:00.000Z");
    expect(getPeriodStart("12m", anchor).toISOString()).toBe("2025-05-07T00:00:00.000Z");
  });
});

describe("createReportResult", () => {
  const filters: ReportFilters = { port: "All", period: "12m", metric: "cost" };
  const anchor = new Date("2026-05-07T00:00:00.000Z");

  it("groups records by reason and calculates report totals", () => {
    const report = createReportResult(records, filters, anchor);

    expect(report.records).toHaveLength(3);
    expect(report.totalBurnHours).toBe(2.5);
    expect(report.totalCostAud).toBe(400);
    expect(report.totalFuelKg).toBe(263);
    expect(report.avoidableCostAud).toBe(340);
    expect(report.reasonRows.map((row) => row.reasonCode)).toEqual([
      "turnaround-pressure",
      "crew-request",
      "maintenance",
    ]);
    expect(report.reasonRows[0]).toMatchObject({
      burnHours: 1,
      estimatedCostAud: 160,
      fuelKg: 105,
      eventCount: 1,
      avoidableCostAud: 160,
      topPort: "BNE",
    });
  });

  it("filters by port and selected period", () => {
    const report = createReportResult(records, { port: "BNE", period: "1m", metric: "hours" }, anchor);

    expect(report.records.map((record) => record.id)).toEqual(["a"]);
    expect(report.reasonRows).toHaveLength(1);
    expect(report.reasonRows[0].reasonCode).toBe("turnaround-pressure");
  });

  it("creates savings scenarios for the top reason", () => {
    const report = createReportResult(records, filters, anchor);

    expect(report.savingsScenarios).toEqual([
      {
        label: "Reduce Turnaround pressure by 25%",
        reductionPercent: 25,
        reasonCode: "turnaround-pressure",
        reasonLabel: "Turnaround pressure",
        estimatedSavingsAud: 40,
      },
      {
        label: "Reduce Turnaround pressure by 50%",
        reductionPercent: 50,
        reasonCode: "turnaround-pressure",
        reasonLabel: "Turnaround pressure",
        estimatedSavingsAud: 80,
      },
    ]);
  });
});
