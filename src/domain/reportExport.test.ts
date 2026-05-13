import { describe, expect, it } from "vitest";
import type { ReportResult } from "../types";
import { createReportWorkbook } from "./reportExport";

const report: ReportResult = {
  filters: { port: "BNE", period: "1m", metric: "cost" },
  generatedAt: "2026-05-07T00:00:00.000Z",
  records: [
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
  ],
  reasonRows: [
    {
      reasonCode: "turnaround-pressure",
      reasonLabel: "Turnaround pressure",
      burnMinutes: 60,
      burnHours: 1,
      estimatedCostAud: 160,
      fuelKg: 105,
      eventCount: 1,
      avoidableMinutes: 60,
      avoidableCostAud: 160,
      shareOfBurn: 100,
      topPort: "BNE",
    },
  ],
  portRows: [{ port: "BNE", estimatedCostAud: 160, avoidableCostAud: 160, burnHours: 1, eventCount: 1 }],
  trend: [
    {
      label: "2026-05-06",
      startIso: "2026-05-06T00:00:00.000Z",
      estimatedCostAud: 160,
      avoidableCostAud: 160,
      burnHours: 1,
      eventCount: 1,
    },
  ],
  totalBurnHours: 1,
  totalCostAud: 160,
  totalFuelKg: 105,
  totalEvents: 1,
  avoidableCostAud: 160,
  avoidableBurnHours: 1,
  costPerBurnHour: 160,
  topReasonCode: "turnaround-pressure",
  topReasonLabel: "Turnaround pressure",
  savingsScenarios: [
    {
      label: "Reduce Turnaround pressure by 25%",
      reductionPercent: 25,
      reasonCode: "turnaround-pressure",
      reasonLabel: "Turnaround pressure",
      estimatedSavingsAud: 40,
    },
  ],
};

describe("createReportWorkbook", () => {
  it("creates the expected workbook sheets", async () => {
    const workbook = await createReportWorkbook(report, "savings");

    expect(workbook.SheetNames).toEqual(["Summary", "Reason Breakdown", "Event Detail"]);
    expect(workbook.Sheets.Summary.A1.v).toBe("APU Reporting Export");
    expect(workbook.Sheets["Reason Breakdown"].A1.v).toBe("Reason");
    expect(workbook.Sheets["Event Detail"].A1.v).toBe("Aircraft");
  });
});
