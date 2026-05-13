import type { HistoricalApuRecord } from "../types";
import { estimateCostAud, minutesBetween } from "./apuCalculations";

export type BurnBenchmarkHorizon = "1wk" | "1m" | "12m";

export const burnBenchmarkLabels: Record<BurnBenchmarkHorizon, string> = {
  "1wk": "Week",
  "1m": "Month",
  "12m": "Year",
};

const horizonDays: Record<BurnBenchmarkHorizon, number> = {
  "1wk": 7,
  "1m": 30,
  "12m": 365,
};

function latestRecordDate(records: HistoricalApuRecord[]) {
  const latestMs = records.reduce((latest, record) => Math.max(latest, Date.parse(record.apuStartedAt)), 0);
  return latestMs ? new Date(latestMs) : new Date();
}

function periodStart(anchor: Date, horizon: BurnBenchmarkHorizon) {
  const start = new Date(anchor);
  start.setUTCDate(start.getUTCDate() - horizonDays[horizon]);
  start.setUTCHours(0, 0, 0, 0);
  return start;
}

function roundPercent(value: number) {
  return Math.round(Math.abs(value));
}

export function createBurnRateBenchmark(
  records: HistoricalApuRecord[],
  port: string,
  horizon: BurnBenchmarkHorizon,
  liveBurnRateAudPerHour: number,
) {
  const anchor = latestRecordDate(records);
  const start = periodStart(anchor, horizon);
  const filtered = records.filter((record) => {
    const startedAt = new Date(record.apuStartedAt);
    const portMatches = port === "All" || record.port === port;
    return portMatches && startedAt >= start && startedAt <= anchor;
  });
  const totalCost = filtered.reduce(
    (sum, record) => sum + estimateCostAud(minutesBetween(record.apuStartedAt, record.apuStoppedAt)),
    0,
  );
  const nightCount = new Set(filtered.map((record) => record.apuStartedAt.slice(0, 10))).size;
  const baselineRateAudPerHour = nightCount ? Math.round(totalCost / (nightCount * 8)) : 0;
  const deltaAudPerHour = liveBurnRateAudPerHour - baselineRateAudPerHour;
  const deltaPercent = baselineRateAudPerHour
    ? roundPercent((deltaAudPerHour / baselineRateAudPerHour) * 100)
    : liveBurnRateAudPerHour > 0
      ? 100
      : 0;

  return {
    horizon,
    baselineRateAudPerHour,
    deltaAudPerHour,
    deltaPercent,
    status: deltaAudPerHour > 0 ? "above" : deltaAudPerHour < 0 ? "below" : "on-target",
    recordCount: filtered.length,
    nightCount,
  } as const;
}
