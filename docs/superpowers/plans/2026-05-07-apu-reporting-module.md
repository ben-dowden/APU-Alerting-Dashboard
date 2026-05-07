# APU Reporting Module Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a Reports tab with Ops and Savings views that groups historical APU burn by reason, supports port/time/metric filters, renders charts on screen, and exports `.xlsx` workbooks.

**Architecture:** Keep reporting logic outside React in a pure `src/domain/reportingEngine.ts` module. Use the current mock data pattern, but move expanded historical records into `src/data/historicalApuRecords.ts` so Live Ops and Reports stay decoupled. UI components consume normalized report results and the export module converts those same results into an Excel workbook.

**Tech Stack:** React 19, TypeScript, Vite, lucide-react, Vitest for domain/export tests, `xlsx` for browser workbook generation, CSS/SVG/HTML charts without a charting dependency.

---

## File Structure

- Modify: `package.json` adds `test` script, `xlsx`, and `vitest`.
- Modify: `src/types.ts` adds report filter, report metric, reason-row, trend, and report-result types.
- Create: `src/data/historicalApuRecords.ts` owns the expanded 12-month historical dataset.
- Modify: `src/data/mockApuFeed.ts` removes the inline historical export and imports live-only types.
- Modify: `src/components/HistoryDashboard.tsx` imports records from `src/data/historicalApuRecords.ts`.
- Create: `src/domain/reportingEngine.ts` owns filtering, grouping, KPI, trend, and savings calculations.
- Create: `src/domain/reportingEngine.test.ts` verifies the reporting engine.
- Create: `src/domain/reportExport.ts` owns workbook creation and download.
- Create: `src/domain/reportExport.test.ts` verifies workbook sheets and rows.
- Create: `src/components/reports/ReportControls.tsx` renders report filters and metric toggle.
- Create: `src/components/reports/ReportKpiStrip.tsx` renders shared report KPIs.
- Create: `src/components/reports/ReasonBreakdownChart.tsx` renders the reason chart.
- Create: `src/components/reports/ReasonBreakdownTable.tsx` renders the reason table.
- Create: `src/components/reports/ReportDetailTable.tsx` renders filtered event detail.
- Create: `src/components/reports/OpsReportView.tsx` renders the operational reason view.
- Create: `src/components/reports/SavingsReportView.tsx` renders the management savings view.
- Create: `src/components/ReportsDashboard.tsx` coordinates report state, views, engine, and export.
- Modify: `src/App.tsx` adds the top-level `Reports` tab.
- Modify: `src/styles.css` adds reports layout, controls, chart, table, and export styles.

---

### Task 1: Add Reporting Dependencies And Test Script

**Files:**
- Modify: `package.json`
- Modify: `package-lock.json`

- [ ] **Step 1: Install dependencies**

Run:

```bash
npm install xlsx
npm install -D vitest
```

Expected: `xlsx` appears in `dependencies`, `vitest` appears in `devDependencies`, and `package-lock.json` updates.

- [ ] **Step 2: Update scripts**

Edit `package.json` so `scripts` is:

```json
{
  "dev": "vite --host 127.0.0.1",
  "build": "tsc && vite build",
  "preview": "vite preview --host 127.0.0.1",
  "test": "vitest run"
}
```

- [ ] **Step 3: Verify install and scripts**

Run:

```bash
npm run test
```

Expected: FAIL with “No test files found” or equivalent Vitest no-tests message. This confirms the test runner is installed before tests exist.

- [ ] **Step 4: Commit**

Run:

```bash
git add package.json package-lock.json
git commit -m chore-add-reporting-test-and-export-dependencies
```

---

### Task 2: Add Reporting Types And Expanded Historical Data

**Files:**
- Modify: `src/types.ts`
- Create: `src/data/historicalApuRecords.ts`
- Modify: `src/data/mockApuFeed.ts`
- Modify: `src/components/HistoryDashboard.tsx`

- [ ] **Step 1: Add report types**

Append these types to `src/types.ts`:

```ts
export type ReportView = "ops" | "savings";

export type ReportPeriod = "12m" | "3m" | "1m" | "1wk" | "1d";

export type ReportMetric = "cost" | "hours" | "fuel" | "events";

export interface ReportFilters {
  port: string;
  period: ReportPeriod;
  metric: ReportMetric;
}

export interface ReasonBreakdownRow {
  reasonCode: ApuReasonCode;
  reasonLabel: string;
  burnMinutes: number;
  burnHours: number;
  estimatedCostAud: number;
  fuelKg: number;
  eventCount: number;
  avoidableMinutes: number;
  avoidableCostAud: number;
  shareOfBurn: number;
  topPort: string;
}

export interface PortCostRow {
  port: string;
  estimatedCostAud: number;
  avoidableCostAud: number;
  burnHours: number;
  eventCount: number;
}

export interface TrendBucket {
  label: string;
  startIso: string;
  estimatedCostAud: number;
  avoidableCostAud: number;
  burnHours: number;
  eventCount: number;
}

export interface SavingsScenario {
  label: string;
  reductionPercent: number;
  reasonCode: ApuReasonCode;
  reasonLabel: string;
  estimatedSavingsAud: number;
}

export interface ReportResult {
  filters: ReportFilters;
  generatedAt: string;
  records: HistoricalApuRecord[];
  reasonRows: ReasonBreakdownRow[];
  portRows: PortCostRow[];
  trend: TrendBucket[];
  totalBurnHours: number;
  totalCostAud: number;
  totalFuelKg: number;
  totalEvents: number;
  avoidableCostAud: number;
  avoidableBurnHours: number;
  costPerBurnHour: number;
  topReasonCode: ApuReasonCode;
  topReasonLabel: string;
  savingsScenarios: SavingsScenario[];
}
```

- [ ] **Step 2: Create expanded historical dataset**

Create `src/data/historicalApuRecords.ts` with this file content. The generator creates 12 months of records from the seed rows, and the seed rows cover every reason value used by the dashboard:

```ts
import type { ApuReasonCode, AvailabilityState, HistoricalApuRecord } from "../types";

interface HistoricalSeed {
  registration: string;
  aircraftType: string;
  port: string;
  bay: string;
  startHour: number;
  durationMinutes: number;
  pcaAvailability: AvailabilityState;
  gpuAvailability: AvailabilityState;
  reasonCode: ApuReasonCode;
}

const monthlySeeds: HistoricalSeed[] = [
  {
    registration: "VH-8IA",
    aircraftType: "737-MAX",
    port: "BNE",
    bay: "Bay 43",
    startHour: 21,
    durationMinutes: 86,
    pcaAvailability: "available",
    gpuAvailability: "available",
    reasonCode: "turnaround-pressure",
  },
  {
    registration: "VH-YIO",
    aircraftType: "737-MAX",
    port: "MEL",
    bay: "Bay 02",
    startHour: 22,
    durationMinutes: 217,
    pcaAvailability: "unavailable",
    gpuAvailability: "available",
    reasonCode: "pca-unavailable",
  },
  {
    registration: "VH-YIB",
    aircraftType: "737-MAX",
    port: "SYD",
    bay: "Bay 39",
    startHour: 20,
    durationMinutes: 93,
    pcaAvailability: "available",
    gpuAvailability: "available",
    reasonCode: "crew-request",
  },
  {
    registration: "VH-8IB",
    aircraftType: "737-800",
    port: "ADL",
    bay: "Bay 15",
    startHour: 19,
    durationMinutes: 69,
    pcaAvailability: "available",
    gpuAvailability: "available",
    reasonCode: "operational-requirement",
  },
  {
    registration: "VH-YIA",
    aircraftType: "737-800",
    port: "PER",
    bay: "Bay 43",
    startHour: 23,
    durationMinutes: 52,
    pcaAvailability: "unavailable",
    gpuAvailability: "available",
    reasonCode: "gpu-unavailable",
  },
  {
    registration: "VH-8IC",
    aircraftType: "737-800",
    port: "BNE",
    bay: "Bay 46",
    startHour: 18,
    durationMinutes: 55,
    pcaAvailability: "available",
    gpuAvailability: "available",
    reasonCode: "maintenance",
  },
  {
    registration: "VH-YIF",
    aircraftType: "737-800",
    port: "MEL",
    bay: "Bay 11",
    startHour: 21,
    durationMinutes: 74,
    pcaAvailability: "available",
    gpuAvailability: "available",
    reasonCode: "weather-cabin-comfort",
  },
  {
    registration: "VH-YIG",
    aircraftType: "737-MAX",
    port: "SYD",
    bay: "Bay 51",
    startHour: 22,
    durationMinutes: 47,
    pcaAvailability: "available",
    gpuAvailability: "unavailable",
    reasonCode: "other",
  },
  {
    registration: "VH-YIH",
    aircraftType: "737-800",
    port: "ADL",
    bay: "Bay 18",
    startHour: 20,
    durationMinutes: 41,
    pcaAvailability: "available",
    gpuAvailability: "available",
    reasonCode: "none",
  },
];

function addMonths(date: Date, monthsBack: number) {
  const copy = new Date(date);
  copy.setUTCMonth(copy.getUTCMonth() - monthsBack);
  return copy;
}

export function buildHistoricalRecords(baseDate = new Date("2026-05-07T12:00:00+10:00")): HistoricalApuRecord[] {
  const records: HistoricalApuRecord[] = [];

  for (let monthOffset = 0; monthOffset < 12; monthOffset += 1) {
    monthlySeeds.forEach((seed, seedIndex) => {
      const start = addMonths(baseDate, monthOffset);
      start.setUTCDate(Math.max(1, 26 - seedIndex * 2));
      start.setUTCHours(seed.startHour, seedIndex % 2 === 0 ? 10 : 35, 0, 0);
      const durationMinutes = seed.durationMinutes + ((monthOffset + seedIndex) % 4) * 8;
      const stop = new Date(start.getTime() + durationMinutes * 60000);

      records.push({
        id: `hist-${monthOffset}-${seedIndex}`,
        registration: seed.registration,
        aircraftType: seed.aircraftType,
        port: seed.port,
        bay: seed.bay,
        apuStartedAt: start.toISOString(),
        apuStoppedAt: stop.toISOString(),
        pcaAvailability: seed.pcaAvailability,
        gpuAvailability: seed.gpuAvailability,
        reasonCode: seed.reasonCode,
      });
    });
  }

  return records;
}

export const historicalApuRecords = buildHistoricalRecords();
```

- [ ] **Step 3: Remove historical export from live mock feed**

In `src/data/mockApuFeed.ts`, remove `HistoricalApuRecord` from the type import and delete the `export const historicalApuRecords` block at the end of the file.

The import should become:

```ts
import type { AircraftApuFeedRecord, AvailabilityState, LiveApuEvent, LiveApuFeed } from "../types";
```

- [ ] **Step 4: Update HistoryDashboard import**

Change the import at the top of `src/components/HistoryDashboard.tsx` from:

```ts
import { historicalApuRecords } from "../data/mockApuFeed";
```

to:

```ts
import { historicalApuRecords } from "../data/historicalApuRecords";
```

- [ ] **Step 5: Verify build**

Run:

```bash
npm run build
```

Expected: PASS. If Vite fails with `spawn EPERM`, rerun with the same command using sandbox escalation.

- [ ] **Step 6: Commit**

Run:

```bash
git add src/types.ts src/data/historicalApuRecords.ts src/data/mockApuFeed.ts src/components/HistoryDashboard.tsx
git commit -m feat-expand-historical-apu-reporting-data
```

---

### Task 3: Build The Pure Reporting Engine With Tests

**Files:**
- Create: `src/domain/reportingEngine.test.ts`
- Create: `src/domain/reportingEngine.ts`

- [ ] **Step 1: Write failing tests**

Create `src/domain/reportingEngine.test.ts`:

```ts
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
```

- [ ] **Step 2: Run tests to verify failure**

Run:

```bash
npm run test -- src/domain/reportingEngine.test.ts
```

Expected: FAIL because `src/domain/reportingEngine.ts` does not exist.

- [ ] **Step 3: Implement reporting engine**

Create `src/domain/reportingEngine.ts`:

```ts
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

const periodDays: Record<ReportPeriod, number> = {
  "1d": 1,
  "1wk": 7,
  "1m": 30,
  "3m": 90,
  "12m": 365,
};

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
  start.setUTCDate(start.getUTCDate() - periodDays[period]);
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
```

- [ ] **Step 4: Run reporting engine tests**

Run:

```bash
npm run test -- src/domain/reportingEngine.test.ts
```

Expected: PASS.

- [ ] **Step 5: Commit**

Run:

```bash
git add src/domain/reportingEngine.ts src/domain/reportingEngine.test.ts
git commit -m feat-add-apu-reporting-engine
```

---

### Task 4: Build Excel Workbook Export With Tests

**Files:**
- Create: `src/domain/reportExport.test.ts`
- Create: `src/domain/reportExport.ts`

- [ ] **Step 1: Write failing workbook tests**

Create `src/domain/reportExport.test.ts`:

```ts
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
  trend: [{ label: "2026-05-06", startIso: "2026-05-06T00:00:00.000Z", estimatedCostAud: 160, avoidableCostAud: 160, burnHours: 1, eventCount: 1 }],
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
  it("creates the expected workbook sheets", () => {
    const workbook = createReportWorkbook(report, "savings");

    expect(workbook.SheetNames).toEqual(["Summary", "Reason Breakdown", "Event Detail"]);
    expect(workbook.Sheets.Summary.A1.v).toBe("APU Reporting Export");
    expect(workbook.Sheets["Reason Breakdown"].A1.v).toBe("Reason");
    expect(workbook.Sheets["Event Detail"].A1.v).toBe("Aircraft");
  });
});
```

- [ ] **Step 2: Run tests to verify failure**

Run:

```bash
npm run test -- src/domain/reportExport.test.ts
```

Expected: FAIL because `src/domain/reportExport.ts` does not exist.

- [ ] **Step 3: Implement workbook export**

Create `src/domain/reportExport.ts`:

```ts
import * as XLSX from "xlsx";
import type { ReportResult, ReportView } from "../types";
import { estimateCostAud, estimateFuelKg, formatDuration, minutesBetween, reasonLabels } from "./apuCalculations";

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
```

- [ ] **Step 4: Remove unused import if TypeScript flags it**

If `estimateFuelKg` is unused in `src/domain/reportExport.ts`, remove it from the import:

```ts
import { estimateCostAud, formatDuration, minutesBetween, reasonLabels } from "./apuCalculations";
```

- [ ] **Step 5: Run export tests**

Run:

```bash
npm run test -- src/domain/reportExport.test.ts
```

Expected: PASS.

- [ ] **Step 6: Commit**

Run:

```bash
git add src/domain/reportExport.ts src/domain/reportExport.test.ts
git commit -m feat-add-apu-report-excel-export
```

---

### Task 5: Add Shared Reports Controls And Chart Components

**Files:**
- Create: `src/components/reports/ReportControls.tsx`
- Create: `src/components/reports/ReportKpiStrip.tsx`
- Create: `src/components/reports/ReasonBreakdownChart.tsx`
- Create: `src/components/reports/ReasonBreakdownTable.tsx`
- Create: `src/components/reports/ReportDetailTable.tsx`

- [ ] **Step 1: Create report controls**

Create `src/components/reports/ReportControls.tsx`:

```tsx
import { Download, SlidersHorizontal } from "lucide-react";
import type { PortOption } from "../../data/portPreference";
import type { ReportFilters, ReportMetric, ReportPeriod, ReportView } from "../../types";
import { metricLabels } from "../../domain/reportingEngine";

const periods: { value: ReportPeriod; label: string }[] = [
  { value: "12m", label: "12m" },
  { value: "3m", label: "3m" },
  { value: "1m", label: "1m" },
  { value: "1wk", label: "1wk" },
  { value: "1d", label: "1 day" },
];

const metrics = Object.entries(metricLabels) as [ReportMetric, string][];

interface ReportControlsProps {
  view: ReportView;
  filters: ReportFilters;
  portOptions: readonly PortOption[];
  exportDisabled: boolean;
  exportError: string;
  onViewChange: (view: ReportView) => void;
  onFiltersChange: (filters: ReportFilters) => void;
  onExport: () => void;
}

export function ReportControls({
  view,
  filters,
  portOptions,
  exportDisabled,
  exportError,
  onViewChange,
  onFiltersChange,
  onExport,
}: ReportControlsProps) {
  return (
    <section className="report-controls">
      <div className="report-controls__title">
        <SlidersHorizontal size={18} />
        <div>
          <p>Reports</p>
          <h2>Historical APU burn by reason</h2>
        </div>
      </div>

      <div className="report-control-group" aria-label="Report view">
        <button className={view === "ops" ? "is-active" : ""} onClick={() => onViewChange("ops")}>Ops View</button>
        <button className={view === "savings" ? "is-active" : ""} onClick={() => onViewChange("savings")}>Savings View</button>
      </div>

      <label>
        Port
        <select value={filters.port} onChange={(event) => onFiltersChange({ ...filters, port: event.target.value })}>
          {portOptions.map((port) => <option key={port}>{port}</option>)}
        </select>
      </label>

      <label>
        Time period
        <select
          value={filters.period}
          onChange={(event) => onFiltersChange({ ...filters, period: event.target.value as ReportPeriod })}
        >
          {periods.map((period) => <option value={period.value} key={period.value}>{period.label}</option>)}
        </select>
      </label>

      <label>
        Metric
        <select
          value={filters.metric}
          onChange={(event) => onFiltersChange({ ...filters, metric: event.target.value as ReportMetric })}
        >
          {metrics.map(([value, label]) => <option value={value} key={value}>{label}</option>)}
        </select>
      </label>

      <div className="report-export">
        <button onClick={onExport} disabled={exportDisabled}>
          <Download size={16} />
          Export Excel
        </button>
        {exportError ? <span role="alert">{exportError}</span> : null}
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Create KPI strip component**

Create `src/components/reports/ReportKpiStrip.tsx`:

```tsx
import { Banknote, Clock3, Fuel, Target } from "lucide-react";
import { MetricCard } from "../MetricCard";
import type { ReportResult } from "../../types";

interface ReportKpiStripProps {
  report: ReportResult;
  mode: "ops" | "savings";
}

export function ReportKpiStrip({ report, mode }: ReportKpiStripProps) {
  const fourthLabel = mode === "ops" ? "Top reason" : "Projected savings";
  const fourthValue = mode === "ops"
    ? report.topReasonLabel
    : `$${report.savingsScenarios[1]?.estimatedSavingsAud ?? 0}`;
  const fourthHelper = mode === "ops" ? "Largest reason by selected metric" : "If top reason reduced by 50%";

  return (
    <section className="metric-grid metric-grid--reports">
      <MetricCard label="Burn hours" value={String(report.totalBurnHours)} helper={`${report.totalEvents} records`} tone="purple" icon={<Clock3 size={22} />} />
      <MetricCard label="Estimated cost" value={`$${report.totalCostAud}`} helper={`$${report.costPerBurnHour}/burn hr`} tone="red" icon={<Banknote size={22} />} />
      <MetricCard label="Avoidable cost" value={`$${report.avoidableCostAud}`} helper={`${report.avoidableBurnHours} avoidable hrs`} tone="green" icon={<Fuel size={22} />} />
      <MetricCard label={fourthLabel} value={fourthValue} helper={fourthHelper} tone="purple" icon={<Target size={22} />} />
    </section>
  );
}
```

- [ ] **Step 3: Create reason chart**

Create `src/components/reports/ReasonBreakdownChart.tsx`:

```tsx
import type { ReasonBreakdownRow, ReportMetric } from "../../types";
import { metricLabels, reasonColours } from "../../domain/reportingEngine";

interface ReasonBreakdownChartProps {
  rows: ReasonBreakdownRow[];
  metric: ReportMetric;
  title: string;
}

function valueFor(row: ReasonBreakdownRow, metric: ReportMetric) {
  if (metric === "hours") return row.burnHours;
  if (metric === "fuel") return row.fuelKg;
  if (metric === "events") return row.eventCount;
  return row.estimatedCostAud;
}

function displayValue(value: number, metric: ReportMetric) {
  if (metric === "cost") return `$${value}`;
  if (metric === "hours") return `${value}h`;
  if (metric === "fuel") return `${value}kg`;
  return String(value);
}

export function ReasonBreakdownChart({ rows, metric, title }: ReasonBreakdownChartProps) {
  const max = Math.max(...rows.map((row) => valueFor(row, metric)), 1);

  return (
    <section className="report-chart-panel">
      <div className="report-chart-panel__header">
        <h3>{title}</h3>
        <span>{metricLabels[metric]}</span>
      </div>
      {rows.length === 0 ? (
        <div className="empty-state">No APU burn records match this report.</div>
      ) : (
        <div className="reason-chart">
          {rows.map((row) => {
            const value = valueFor(row, metric);
            return (
              <div className="reason-chart__row" key={row.reasonCode}>
                <span>{row.reasonLabel}</span>
                <div className="reason-chart__track">
                  <div
                    style={{
                      width: `${Math.max(4, (value / max) * 100)}%`,
                      background: reasonColours[row.reasonCode],
                    }}
                  />
                </div>
                <strong>{displayValue(value, metric)}</strong>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
```

- [ ] **Step 4: Create reason table**

Create `src/components/reports/ReasonBreakdownTable.tsx`:

```tsx
import type { ReasonBreakdownRow } from "../../types";

interface ReasonBreakdownTableProps {
  rows: ReasonBreakdownRow[];
}

export function ReasonBreakdownTable({ rows }: ReasonBreakdownTableProps) {
  return (
    <section className="report-table-panel">
      <h3>Reason breakdown</h3>
      <div className="report-table report-table--reason">
        <div className="report-table__head">
          <span>Reason</span>
          <span>Hours</span>
          <span>Cost</span>
          <span>Fuel</span>
          <span>Events</span>
          <span>Avoidable</span>
          <span>Share</span>
          <span>Top port</span>
        </div>
        {rows.length === 0 ? (
          <div className="report-table__empty">No reason records for this filter.</div>
        ) : rows.map((row) => (
          <div className="report-table__row" key={row.reasonCode}>
            <span>{row.reasonLabel}</span>
            <span>{row.burnHours}</span>
            <span>${row.estimatedCostAud}</span>
            <span>{row.fuelKg}kg</span>
            <span>{row.eventCount}</span>
            <span>${row.avoidableCostAud}</span>
            <span>{row.shareOfBurn}%</span>
            <span>{row.topPort}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
```

- [ ] **Step 5: Create detail table**

Create `src/components/reports/ReportDetailTable.tsx`:

```tsx
import { estimateCostAud, formatDuration, minutesBetween, reasonLabels } from "../../domain/apuCalculations";
import type { HistoricalApuRecord } from "../../types";

interface ReportDetailTableProps {
  records: HistoricalApuRecord[];
}

export function ReportDetailTable({ records }: ReportDetailTableProps) {
  return (
    <section className="report-table-panel">
      <h3>Event detail</h3>
      <div className="report-table report-table--detail">
        <div className="report-table__head">
          <span>Aircraft</span>
          <span>Port / bay</span>
          <span>Duration</span>
          <span>Reason</span>
          <span>Cost</span>
        </div>
        {records.length === 0 ? (
          <div className="report-table__empty">No event records for this filter.</div>
        ) : records.slice(0, 12).map((record) => {
          const minutes = minutesBetween(record.apuStartedAt, record.apuStoppedAt);
          return (
            <div className="report-table__row" key={record.id}>
              <span>{record.registration} <small>{record.aircraftType}</small></span>
              <span>{record.port} / {record.bay}</span>
              <span>{formatDuration(minutes)}</span>
              <span>{reasonLabels[record.reasonCode]}</span>
              <span>${estimateCostAud(minutes)}</span>
            </div>
          );
        })}
      </div>
    </section>
  );
}
```

- [ ] **Step 6: Run TypeScript build**

Run:

```bash
npm run build
```

Expected: FAIL because these components are not yet imported by a dashboard, or PASS if TypeScript compiles unused exports. Continue either way after fixing any syntax errors.

- [ ] **Step 7: Commit**

Run:

```bash
git add src/components/reports
git commit -m feat-add-report-components
```

---

### Task 6: Add Ops And Savings Report Views

**Files:**
- Create: `src/components/reports/OpsReportView.tsx`
- Create: `src/components/reports/SavingsReportView.tsx`

- [ ] **Step 1: Create Ops view**

Create `src/components/reports/OpsReportView.tsx`:

```tsx
import type { ReportResult } from "../../types";
import { ReasonBreakdownChart } from "./ReasonBreakdownChart";
import { ReasonBreakdownTable } from "./ReasonBreakdownTable";
import { ReportDetailTable } from "./ReportDetailTable";
import { ReportKpiStrip } from "./ReportKpiStrip";

interface OpsReportViewProps {
  report: ReportResult;
}

export function OpsReportView({ report }: OpsReportViewProps) {
  return (
    <section className="report-view">
      <ReportKpiStrip report={report} mode="ops" />
      <div className="report-view__grid">
        <ReasonBreakdownChart rows={report.reasonRows} metric={report.filters.metric} title="APU burn by reason" />
        <ReasonBreakdownTable rows={report.reasonRows} />
      </div>
      <ReportDetailTable records={report.records} />
    </section>
  );
}
```

- [ ] **Step 2: Create Savings view**

Create `src/components/reports/SavingsReportView.tsx`:

```tsx
import type { ReportResult } from "../../types";
import { ReasonBreakdownChart } from "./ReasonBreakdownChart";
import { ReportKpiStrip } from "./ReportKpiStrip";

interface SavingsReportViewProps {
  report: ReportResult;
}

export function SavingsReportView({ report }: SavingsReportViewProps) {
  const maxPortCost = Math.max(...report.portRows.map((row) => row.estimatedCostAud), 1);
  const maxTrendCost = Math.max(...report.trend.map((row) => row.estimatedCostAud), 1);

  return (
    <section className="report-view">
      <ReportKpiStrip report={report} mode="savings" />
      <div className="savings-grid">
        <section className="report-chart-panel">
          <div className="report-chart-panel__header">
            <h3>Cost by port</h3>
            <span>$ cost</span>
          </div>
          <div className="reason-chart">
            {report.portRows.length === 0 ? <div className="empty-state">No port records match this report.</div> : report.portRows.map((row) => (
              <div className="reason-chart__row" key={row.port}>
                <span>{row.port}</span>
                <div className="reason-chart__track">
                  <div style={{ width: `${Math.max(4, (row.estimatedCostAud / maxPortCost) * 100)}%` }} />
                </div>
                <strong>${row.estimatedCostAud}</strong>
              </div>
            ))}
          </div>
        </section>

        <ReasonBreakdownChart rows={report.reasonRows} metric="cost" title="Cost by reason" />

        <section className="report-chart-panel">
          <div className="report-chart-panel__header">
            <h3>Trend</h3>
            <span>$ cost</span>
          </div>
          <div className="trend-strip">
            {report.trend.length === 0 ? <div className="empty-state">No trend records match this report.</div> : report.trend.map((bucket) => (
              <div className="trend-strip__bar" key={bucket.label}>
                <div style={{ height: `${Math.max(8, (bucket.estimatedCostAud / maxTrendCost) * 100)}%` }} />
                <span>{bucket.label.slice(5)}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="report-table-panel">
          <h3>Savings scenarios</h3>
          <div className="scenario-list">
            {report.savingsScenarios.length === 0 ? <div className="empty-state">No savings scenarios for this report.</div> : report.savingsScenarios.map((scenario) => (
              <div className="scenario-item" key={scenario.label}>
                <span>{scenario.label}</span>
                <strong>${scenario.estimatedSavingsAud}</strong>
              </div>
            ))}
          </div>
        </section>
      </div>
    </section>
  );
}
```

- [ ] **Step 3: Build**

Run:

```bash
npm run build
```

Expected: PASS, or fail with CSS class absence only at runtime if TypeScript compiles. CSS comes in Task 8.

- [ ] **Step 4: Commit**

Run:

```bash
git add src/components/reports/OpsReportView.tsx src/components/reports/SavingsReportView.tsx
git commit -m feat-add-report-views
```

---

### Task 7: Wire Reports Dashboard And App Navigation

**Files:**
- Create: `src/components/ReportsDashboard.tsx`
- Modify: `src/App.tsx`

- [ ] **Step 1: Create ReportsDashboard**

Create `src/components/ReportsDashboard.tsx`:

```tsx
import { useMemo, useState } from "react";
import { historicalApuRecords } from "../data/historicalApuRecords";
import { portOptions, readPortPreference, type PortOption } from "../data/portPreference";
import { createReportResult } from "../domain/reportingEngine";
import { downloadReportWorkbook } from "../domain/reportExport";
import type { ReportFilters, ReportMetric, ReportPeriod, ReportView } from "../types";
import { ReportControls } from "./reports/ReportControls";
import { OpsReportView } from "./reports/OpsReportView";
import { SavingsReportView } from "./reports/SavingsReportView";

function defaultPort() {
  const preferred = readPortPreference();
  return preferred === "All" ? "All" : preferred;
}

export function ReportsDashboard() {
  const [view, setView] = useState<ReportView>("ops");
  const [filters, setFilters] = useState<ReportFilters>({
    port: defaultPort(),
    period: "1m",
    metric: "cost",
  });
  const [exportError, setExportError] = useState("");

  const report = useMemo(() => createReportResult(historicalApuRecords, filters), [filters]);

  function handleFiltersChange(nextFilters: ReportFilters) {
    setExportError("");
    setFilters(nextFilters);
  }

  function handleExport() {
    setExportError("");
    try {
      downloadReportWorkbook(report, view);
    } catch (error) {
      setExportError(error instanceof Error ? error.message : "Export failed");
    }
  }

  return (
    <section className="reports-dashboard">
      <ReportControls
        view={view}
        filters={filters}
        portOptions={portOptions as readonly PortOption[]}
        exportDisabled={report.records.length === 0}
        exportError={exportError}
        onViewChange={setView}
        onFiltersChange={handleFiltersChange}
        onExport={handleExport}
      />
      {view === "ops" ? <OpsReportView report={report} /> : <SavingsReportView report={report} />}
    </section>
  );
}
```

- [ ] **Step 2: Add Reports tab to App**

Modify `src/App.tsx`:

```tsx
import { Activity, BarChart3, FileBarChart } from "lucide-react";
import { useState } from "react";
import { HistoryDashboard } from "./components/HistoryDashboard";
import { LiveDashboard } from "./components/LiveDashboard";
import { ReportsDashboard } from "./components/ReportsDashboard";
import { useApuFeed } from "./hooks/useApuFeed";

type Tab = "live" | "history" | "reports";
```

Add this button after the `History` button:

```tsx
<button className={activeTab === "reports" ? "is-active" : ""} onClick={() => setActiveTab("reports")}>
  <FileBarChart size={17} />
  Reports
</button>
```

Replace the bottom conditional with:

```tsx
{activeTab === "live" ? (
  <LiveDashboard
    snapshots={snapshots}
    events={events}
    metrics={metrics}
    selectedPort={selectedPort}
    portOptions={portOptions}
    demoMinute={demoMinute}
    demoClockLabel={demoClockLabel}
    lastUpdated={lastUpdated}
    nextRefreshAt={nextRefreshAt}
    isRefreshing={isRefreshing}
    onRefresh={() => void refresh()}
    onRestartDemo={restartDemo}
    onPortChange={setSelectedPort}
    onReasonChange={updateReason}
  />
) : activeTab === "history" ? (
  <HistoryDashboard />
) : (
  <ReportsDashboard />
)}
```

- [ ] **Step 3: Build**

Run:

```bash
npm run build
```

Expected: PASS after all imports resolve.

- [ ] **Step 4: Commit**

Run:

```bash
git add src/components/ReportsDashboard.tsx src/App.tsx
git commit -m feat-wire-reports-tab
```

---

### Task 8: Add Reports Styling

**Files:**
- Modify: `src/styles.css`

- [ ] **Step 1: Append report styles**

Append to `src/styles.css`:

```css
.reports-dashboard {
  display: grid;
  gap: 14px;
  margin-top: 16px;
}

.report-controls {
  display: grid;
  grid-template-columns: minmax(260px, 1fr) auto 150px 150px 150px auto;
  gap: 12px;
  align-items: end;
  padding: 16px;
  background: var(--panel);
  border: 1px solid var(--line);
  border-radius: 8px;
  box-shadow: 0 10px 30px rgba(24, 25, 35, 0.06);
}

.report-controls__title {
  display: flex;
  gap: 10px;
  align-items: center;
}

.report-controls__title p {
  margin: 0 0 3px;
  color: var(--red);
  font-size: 12px;
  font-weight: 900;
  text-transform: uppercase;
}

.report-controls__title h2 {
  margin: 0;
  color: var(--purple-dark);
  font-size: 22px;
}

.report-control-group {
  display: flex;
  gap: 6px;
  padding: 4px;
  background: #ececf3;
  border: 1px solid #d7d7e3;
  border-radius: 8px;
}

.report-control-group button,
.report-export button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 7px;
  border: 0;
  border-radius: 6px;
  padding: 9px 12px;
  color: var(--purple-dark);
  background: transparent;
  font-weight: 900;
}

.report-control-group button.is-active,
.report-export button {
  background: var(--purple);
  color: white;
}

.report-export button:disabled {
  opacity: 0.55;
  cursor: not-allowed;
}

.report-export span {
  display: block;
  margin-top: 6px;
  color: var(--red);
  font-size: 12px;
  font-weight: 800;
}

.report-controls label {
  display: grid;
  gap: 6px;
  color: var(--muted);
  font-size: 12px;
  font-weight: 900;
}

.report-controls select {
  border: 1px solid var(--line);
  border-radius: 6px;
  padding: 9px 10px;
  background: white;
  color: var(--ink);
}

.report-view {
  display: grid;
  gap: 14px;
}

.metric-grid--reports {
  grid-template-columns: repeat(4, minmax(0, 1fr));
}

.report-view__grid,
.savings-grid {
  display: grid;
  grid-template-columns: minmax(360px, 0.9fr) minmax(420px, 1.1fr);
  gap: 14px;
}

.savings-grid {
  grid-template-columns: repeat(2, minmax(360px, 1fr));
}

.report-chart-panel,
.report-table-panel {
  padding: 16px;
  background: var(--panel);
  border: 1px solid var(--line);
  border-radius: 8px;
  box-shadow: 0 8px 26px rgba(24, 25, 35, 0.045);
}

.report-chart-panel__header {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  align-items: center;
  margin-bottom: 14px;
}

.report-chart-panel__header h3,
.report-table-panel h3 {
  margin: 0;
  color: var(--ink);
}

.report-chart-panel__header span {
  color: var(--muted);
  font-size: 12px;
  font-weight: 900;
  text-transform: uppercase;
}

.reason-chart {
  display: grid;
  gap: 12px;
}

.reason-chart__row {
  display: grid;
  grid-template-columns: 160px minmax(120px, 1fr) 74px;
  gap: 10px;
  align-items: center;
  font-size: 13px;
}

.reason-chart__track {
  height: 16px;
  overflow: hidden;
  background: #ececf3;
  border-radius: 999px;
}

.reason-chart__track div {
  height: 100%;
  background: var(--purple);
  border-radius: inherit;
}

.report-table {
  display: grid;
  overflow: hidden;
  border: 1px solid var(--line);
  border-radius: 8px;
}

.report-table__head,
.report-table__row {
  display: grid;
  gap: 10px;
  align-items: center;
  padding: 10px 12px;
}

.report-table--reason .report-table__head,
.report-table--reason .report-table__row {
  grid-template-columns: minmax(150px, 1.4fr) 0.5fr 0.7fr 0.7fr 0.6fr 0.8fr 0.6fr 0.7fr;
}

.report-table--detail .report-table__head,
.report-table--detail .report-table__row {
  grid-template-columns: 1fr 1fr 0.7fr 1.2fr 0.7fr;
}

.report-table__head {
  background: var(--purple-dark);
  color: white;
  font-size: 12px;
  font-weight: 900;
}

.report-table__row {
  border-top: 1px solid var(--line);
  font-size: 13px;
}

.report-table__row small {
  display: block;
  color: var(--muted);
}

.report-table__empty,
.empty-state {
  padding: 18px;
  color: var(--muted);
  font-weight: 800;
}

.trend-strip {
  display: flex;
  align-items: end;
  gap: 8px;
  min-height: 210px;
  padding-top: 12px;
}

.trend-strip__bar {
  display: grid;
  grid-template-rows: 1fr auto;
  gap: 7px;
  align-items: end;
  flex: 1;
  min-width: 30px;
  height: 210px;
}

.trend-strip__bar div {
  align-self: end;
  min-height: 8px;
  background: var(--purple);
  border-radius: 6px 6px 0 0;
}

.trend-strip__bar span {
  color: var(--muted);
  font-size: 11px;
  text-align: center;
}

.scenario-list {
  display: grid;
  gap: 10px;
}

.scenario-item {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  padding: 12px;
  background: var(--panel-soft);
  border: 1px solid var(--line);
  border-radius: 8px;
}

.scenario-item strong {
  color: var(--green);
}

@media (max-width: 1180px) {
  .report-controls,
  .report-view__grid,
  .savings-grid,
  .metric-grid--reports {
    grid-template-columns: 1fr;
  }

  .report-table--reason .report-table__head,
  .report-table--reason .report-table__row,
  .report-table--detail .report-table__head,
  .report-table--detail .report-table__row,
  .reason-chart__row {
    grid-template-columns: 1fr;
  }
}
```

- [ ] **Step 2: Build and review in browser**

Run:

```bash
npm run build
```

Expected: PASS.

Open or refresh:

```text
http://127.0.0.1:5173
```

Expected: `Reports` tab appears. Ops View and Savings View render without overlap at desktop width. Export button is visible.

- [ ] **Step 3: Commit**

Run:

```bash
git add src/styles.css
git commit -m style-add-reporting-dashboard-ui
```

---

### Task 9: Final Verification And Export Smoke Test

**Files:**
- Verify: all files touched by Tasks 1-8

- [ ] **Step 1: Run tests**

Run:

```bash
npm run test
```

Expected: PASS for reporting engine and workbook tests.

- [ ] **Step 2: Run production build**

Run:

```bash
npm run build
```

Expected: PASS.

- [ ] **Step 3: Browser smoke test**

In the running dev app at `http://127.0.0.1:5173`, verify:

```text
1. Reports tab opens.
2. Ops View is selected by default.
3. Port defaults to the persisted Live Ops port preference or All.
4. Period defaults to 1m.
5. Metric defaults to $ cost.
6. Changing port filters chart, reason table, and detail table.
7. Changing metric changes the reason chart values.
8. Savings View shows cost by port, cost by reason, trend, and savings scenarios.
9. Export Excel downloads an .xlsx workbook.
```

- [ ] **Step 4: Inspect exported workbook**

Open the downloaded workbook and verify it has:

```text
Summary
Reason Breakdown
Event Detail
```

Expected: `Reason Breakdown` includes rows by APU reason and `Event Detail` includes filtered source records.

- [ ] **Step 5: Commit final verification adjustments**

If verification required small fixes, run:

```bash
git add src package.json package-lock.json
git commit -m fix-polish-apu-reporting-module
```

If no fixes were needed, no commit is required for this step.

---

## Self-Review

Spec coverage:

- Reports tab: Task 7.
- Ops View and Savings View: Task 6.
- Port, time period, and metric filters: Tasks 3, 5, 7.
- Reporting engine grouped by reason: Task 3.
- Chart on screen: Task 5.
- Excel export: Task 4.
- Expanded 12-month mock data: Task 2.
- Empty and export error states: Tasks 5 and 7.

Completeness scan:

- This plan contains no unfinished marker text or unspecified implementation slots.
- Each created module has concrete code to start from.
- Each verification step has a command and expected result.

Type consistency:

- `ReportFilters`, `ReportView`, `ReportMetric`, and `ReportResult` are defined in Task 2 and used consistently through Tasks 3-7.
- `createReportResult` returns the same fields consumed by views and export.
- `createReportWorkbook` and `downloadReportWorkbook` accept `ReportResult` plus `ReportView`, matching `ReportsDashboard`.
