import type {
  ApuReasonCode,
  HistoricalApuRecord,
  PortCostRow,
  ReasonBreakdownRow,
  ReportFilters,
  ReportMetric,
  ReportPeriod,
  ReportResult,
  SavingsScenario,
  TrendBucket,
} from "../types";
import {
  estimateCostAud,
  estimateFuelKg,
  isGroundServiceAvailable,
  minutesBetween,
  reasonLabels,
} from "./apuCalculations";

export const metricLabels: Record<ReportMetric, string> = {
  cost: "$ cost",
  hours: "burn hours",
  fuel: "fuel kg",
  events: "event count",
};

export const reasonColours: Record<ApuReasonCode, string> = {
  none: "#9ca3af",
  "operational-requirement": "#4d2098",
  "pca-unavailable": "#e60012",
  "gpu-unavailable": "#d97706",
  maintenance: "#2563eb",
  "weather-cabin-comfort": "#05a660",
  "turnaround-pressure": "#7c3aed",
  "crew-request": "#0f766e",
  other: "#64748b",
};

export function getPeriodStart(period: ReportPeriod, anchor = new Date()) {
  const start = new Date(anchor);
  start.setUTCHours(0, 0, 0, 0);

  if (period === "1d") start.setUTCDate(start.getUTCDate() - 1);
  if (period === "1wk") start.setUTCDate(start.getUTCDate() - 7);
  if (period === "1m") start.setUTCMonth(start.getUTCMonth() - 1);
  if (period === "3m") start.setUTCMonth(start.getUTCMonth() - 3);
  if (period === "12m") start.setUTCMonth(start.getUTCMonth() - 12);

  return start;
}

function round(value: number, digits = 0) {
  const factor = 10 ** digits;
  return Math.round(value * factor) / factor;
}

function getAvoidableCost(record: HistoricalApuRecord, minutes: number) {
  const cost = estimateCostAud(minutes);
  return isGroundServiceAvailable(record.pcaAvailability, record.gpuAvailability) ? cost : Math.round(cost * 0.25);
}

function getTopPort(records: HistoricalApuRecord[]) {
  const counts = records.reduce<Record<string, number>>((acc, record) => {
    acc[record.port] = (acc[record.port] ?? 0) + 1;
    return acc;
  }, {});
  return Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0] ?? "None";
}

function getMetricValue(row: ReasonBreakdownRow, metric: ReportMetric) {
  if (metric === "hours") return row.burnHours;
  if (metric === "fuel") return row.fuelKg;
  if (metric === "events") return row.eventCount;
  return row.estimatedCostAud;
}

function buildReasonRows(records: HistoricalApuRecord[], metric: ReportMetric): ReasonBreakdownRow[] {
  const totalMinutes = records.reduce(
    (sum, record) => sum + minutesBetween(record.apuStartedAt, record.apuStoppedAt),
    0,
  );
  const grouped = records.reduce<Record<ApuReasonCode, HistoricalApuRecord[]>>((acc, record) => {
    acc[record.reasonCode] = [...(acc[record.reasonCode] ?? []), record];
    return acc;
  }, {} as Record<ApuReasonCode, HistoricalApuRecord[]>);

  return Object.entries(grouped)
    .map(([reasonCode, reasonRecords]) => {
      const burnMinutes = reasonRecords.reduce(
        (sum, record) => sum + minutesBetween(record.apuStartedAt, record.apuStoppedAt),
        0,
      );
      const avoidableCostAud = reasonRecords.reduce(
        (sum, record) => sum + getAvoidableCost(record, minutesBetween(record.apuStartedAt, record.apuStoppedAt)),
        0,
      );

      return {
        reasonCode: reasonCode as ApuReasonCode,
        reasonLabel: reasonLabels[reasonCode],
        burnMinutes,
        burnHours: round(burnMinutes / 60, 1),
        estimatedCostAud: estimateCostAud(burnMinutes),
        fuelKg: estimateFuelKg(burnMinutes),
        eventCount: reasonRecords.length,
        avoidableMinutes: reasonRecords
          .filter((record) => isGroundServiceAvailable(record.pcaAvailability, record.gpuAvailability))
          .reduce((sum, record) => sum + minutesBetween(record.apuStartedAt, record.apuStoppedAt), 0),
        avoidableCostAud,
        shareOfBurn: totalMinutes ? round((burnMinutes / totalMinutes) * 100, 1) : 0,
        topPort: getTopPort(reasonRecords),
      };
    })
    .sort((a, b) => getMetricValue(b, metric) - getMetricValue(a, metric));
}

function buildPortRows(records: HistoricalApuRecord[]): PortCostRow[] {
  const grouped = records.reduce<Record<string, HistoricalApuRecord[]>>((acc, record) => {
    acc[record.port] = [...(acc[record.port] ?? []), record];
    return acc;
  }, {});

  return Object.entries(grouped)
    .map(([port, portRecords]) => {
      const minutes = portRecords.reduce(
        (sum, record) => sum + minutesBetween(record.apuStartedAt, record.apuStoppedAt),
        0,
      );
      return {
        port,
        estimatedCostAud: estimateCostAud(minutes),
        avoidableCostAud: portRecords.reduce(
          (sum, record) => sum + getAvoidableCost(record, minutesBetween(record.apuStartedAt, record.apuStoppedAt)),
          0,
        ),
        burnHours: round(minutes / 60, 1),
        eventCount: portRecords.length,
      };
    })
    .sort((a, b) => b.estimatedCostAud - a.estimatedCostAud);
}

function buildTrend(records: HistoricalApuRecord[]): TrendBucket[] {
  const grouped = records.reduce<Record<string, HistoricalApuRecord[]>>((acc, record) => {
    const label = record.apuStartedAt.slice(0, 10);
    acc[label] = [...(acc[label] ?? []), record];
    return acc;
  }, {});

  return Object.entries(grouped)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([label, dayRecords]) => {
      const minutes = dayRecords.reduce(
        (sum, record) => sum + minutesBetween(record.apuStartedAt, record.apuStoppedAt),
        0,
      );
      return {
        label,
        startIso: `${label}T00:00:00.000Z`,
        estimatedCostAud: estimateCostAud(minutes),
        avoidableCostAud: dayRecords.reduce(
          (sum, record) => sum + getAvoidableCost(record, minutesBetween(record.apuStartedAt, record.apuStoppedAt)),
          0,
        ),
        burnHours: round(minutes / 60, 1),
        eventCount: dayRecords.length,
      };
    });
}

function buildSavingsScenarios(topReason: ReasonBreakdownRow | undefined): SavingsScenario[] {
  if (!topReason) return [];
  return [25, 50].map((reductionPercent) => ({
    label: `Reduce ${topReason.reasonLabel} by ${reductionPercent}%`,
    reductionPercent,
    reasonCode: topReason.reasonCode,
    reasonLabel: topReason.reasonLabel,
    estimatedSavingsAud: Math.round(topReason.avoidableCostAud * (reductionPercent / 100)),
  }));
}

export function createReportResult(
  records: HistoricalApuRecord[],
  filters: ReportFilters,
  anchor = new Date(),
): ReportResult {
  const start = getPeriodStart(filters.period, anchor);
  const filtered = records.filter((record) => {
    const startTime = new Date(record.apuStartedAt);
    const portMatches = filters.port === "All" || record.port === filters.port;
    return portMatches && startTime >= start && startTime <= anchor;
  });
  const reasonRows = buildReasonRows(filtered, filters.metric);
  const portRows = buildPortRows(filtered);
  const totalMinutes = filtered.reduce(
    (sum, record) => sum + minutesBetween(record.apuStartedAt, record.apuStoppedAt),
    0,
  );
  const avoidableCostAud = filtered.reduce(
    (sum, record) => sum + getAvoidableCost(record, minutesBetween(record.apuStartedAt, record.apuStoppedAt)),
    0,
  );
  const topReason = reasonRows[0];

  return {
    filters,
    generatedAt: anchor.toISOString(),
    records: filtered,
    reasonRows,
    portRows,
    trend: buildTrend(filtered),
    totalBurnHours: round(totalMinutes / 60, 1),
    totalCostAud: estimateCostAud(totalMinutes),
    totalFuelKg: estimateFuelKg(totalMinutes),
    totalEvents: filtered.length,
    avoidableCostAud,
    avoidableBurnHours: round(
      filtered
        .filter((record) => isGroundServiceAvailable(record.pcaAvailability, record.gpuAvailability))
        .reduce((sum, record) => sum + minutesBetween(record.apuStartedAt, record.apuStoppedAt), 0) / 60,
      1,
    ),
    costPerBurnHour: totalMinutes ? Math.round(estimateCostAud(totalMinutes) / (totalMinutes / 60)) : 0,
    topReasonCode: topReason?.reasonCode ?? "none",
    topReasonLabel: topReason?.reasonLabel ?? "No reason captured",
    savingsScenarios: buildSavingsScenarios(topReason),
  };
}
