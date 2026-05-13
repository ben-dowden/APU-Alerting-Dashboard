import { describe, expect, it } from "vitest";
import { mockApuDataClient } from "./mockApuClient";

describe("mockApuDataClient", () => {
  it("lists the prototype scenarios", () => {
    expect(mockApuDataClient.listScenarios().map((scenario) => scenario.id)).toEqual([
      "baseline-night",
      "bne-high-burn",
      "ground-service-outage",
      "quiet-night",
      "reporting-heavy",
    ]);
  });

  it("returns scenario-specific live feeds", async () => {
    const now = new Date("2026-05-07T12:00:00+10:00");
    const baseline = await mockApuDataClient.getLiveFeed({ now, demoMinute: 20, scenarioId: "baseline-night" });
    const bne = await mockApuDataClient.getLiveFeed({ now, demoMinute: 20, scenarioId: "bne-high-burn" });
    const quiet = await mockApuDataClient.getLiveFeed({ now, demoMinute: 20, scenarioId: "quiet-night" });

    expect(baseline.records.some((record) => record.port !== "BNE")).toBe(true);
    expect(bne.records.filter((record) => record.port === "BNE").length).toBeGreaterThan(
      baseline.records.filter((record) => record.port === "BNE").length,
    );
    expect(quiet.records.length).toBeLessThan(baseline.records.length);
  });

  it("returns richer historical records for the reporting scenario", async () => {
    const baseline = await mockApuDataClient.getHistoricalRecords({ scenarioId: "baseline-night" });
    const reporting = await mockApuDataClient.getHistoricalRecords({ scenarioId: "reporting-heavy" });

    expect(reporting.length).toBeGreaterThan(baseline.length);
  });
});
