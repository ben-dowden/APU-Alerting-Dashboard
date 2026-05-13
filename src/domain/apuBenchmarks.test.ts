import { describe, expect, it } from "vitest";
import type { HistoricalApuRecord } from "../types";
import { createBurnRateBenchmark } from "./apuBenchmarks";

const records: HistoricalApuRecord[] = [
  {
    id: "a",
    registration: "VH-A",
    aircraftType: "737-800",
    port: "BNE",
    bay: "Bay 1",
    apuStartedAt: "2026-05-26T10:00:00.000Z",
    apuStoppedAt: "2026-05-26T11:00:00.000Z",
    pcaAvailability: "available",
    gpuAvailability: "available",
    reasonCode: "turnaround-pressure",
  },
  {
    id: "b",
    registration: "VH-B",
    aircraftType: "737-MAX",
    port: "BNE",
    bay: "Bay 2",
    apuStartedAt: "2026-05-25T10:00:00.000Z",
    apuStoppedAt: "2026-05-25T11:00:00.000Z",
    pcaAvailability: "available",
    gpuAvailability: "available",
    reasonCode: "maintenance",
  },
  {
    id: "c",
    registration: "VH-C",
    aircraftType: "737-MAX",
    port: "MEL",
    bay: "Bay 3",
    apuStartedAt: "2026-05-24T10:00:00.000Z",
    apuStoppedAt: "2026-05-24T11:00:00.000Z",
    pcaAvailability: "available",
    gpuAvailability: "available",
    reasonCode: "crew-request",
  },
];

describe("createBurnRateBenchmark", () => {
  it("compares the live rate against the selected port baseline", () => {
    const benchmark = createBurnRateBenchmark(records, "BNE", "1wk", 80);

    expect(benchmark.baselineRateAudPerHour).toBe(20);
    expect(benchmark.deltaAudPerHour).toBe(60);
    expect(benchmark.deltaPercent).toBe(300);
    expect(benchmark.status).toBe("above");
  });

  it("returns a positive status when the live rate is below average", () => {
    const benchmark = createBurnRateBenchmark(records, "All", "1m", 10);

    expect(benchmark.status).toBe("below");
  });
});
