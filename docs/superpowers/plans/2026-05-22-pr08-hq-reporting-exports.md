# PR 08 HQ Reporting And Exports Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build HQ reporting overview, reports page, and reason-tagged burn export using derived event/read-model data.

**Architecture:** Reports consume `deriveReasonTaggedBurnRows`, scorecard/read-model outputs, and active assumptions. UI is table-first; export rows must reconcile with HQ totals.

**Tech Stack:** Next.js, TypeScript, React, xlsx, Vitest, Testing Library.

**Status:** Complete 2026-05-23 on branch `pr08-hq-reporting-exports`; pushed for manual PR creation/integration after PR 07.

**Progress Notes (updated 2026-05-23):**
- PR 05 cleanup hardened `deriveReasonTaggedBurnRows` by separating timeline slicing, row projection, attribution gaps, and final-row reconciliation.
- HQ/export work should build on the existing reason-tagged burn read-model boundary and preserve the tested behavior that unattributed runtime remains its own bucket and review telemetry does not become visible timeline segments.
- PR 08 added `deriveHqReport(events, settings, filters)`, exported through `lib/read-models/index.ts`, with totals, KPI data, location/reason/unattributed rows, assumption metadata, data-quality summaries, and export-ready rows.
- PR 08 added an XLSX workbook builder with `Summary`, `Reason Tagged Burn`, `Assumptions`, and `Data Quality` sheets. Export rows include source event ids, `aircraftGroundEventId`, `apuEventId`, fuel price and burn assumption lineage, reason taxonomy lineage, `settingsVersion`, manual-off status, closure type/confidence, and fallback flags.
- PR 08 wired `/hq` and `/hq/reports` to `HQReportsOverview`, added shared BNE HQ report fixtures, and extracted shared HQ display formatting during the clean-code pass.
- Final verification passed with `npm run test` (32 files, 180 tests) and `npm run build`. If `next build` hits `.next` `EPERM` cleanup on Windows/OneDrive, remove the ignored `.next` output and rerun.

---

## File Structure

- Create: `lib/read-models/hq-report.ts`, `lib/read-models/hq-report.test.ts`.
- Create: `lib/export/reason-tagged-burn-export.ts`, `lib/export/reason-tagged-burn-export.test.ts`.
- Create: `components/hq/hq-reports-overview.tsx`, `hq-filter-bar.tsx`, `hq-kpi-row.tsx`, `location-performance-table.tsx`, `reason-breakdown-table.tsx`, `export-button.tsx`.
- Create: `components/hq/format.ts`, `components/hq/hq-reports-overview.test.tsx`.
- Create: `lib/fixtures/hq-reporting.ts`.
- Modify: `app/hq/page.tsx`, `app/hq/reports/page.tsx`.

---

### Task 1: Add HQ Report Read Model

**Files:**
- Create: `lib/read-models/hq-report.ts`
- Create: `lib/read-models/hq-report.test.ts`

- [x] **Step 1: Write tests**

Cover filters by date range and port, totals for runtime, kg fuel, dollar conversion using active fuel price, attribution percentage, location rows, reason breakdown, unattributed burn as its own bucket, manual-off observations excluded from official closure unless ACMS/off or inferred closure exists, and assumption metadata.

- [x] **Step 2: Implement read model**

Export `deriveHqReport(events, settings, filters)` returning:

```text
filters
generatedAt
totalRuntimeMinutes
totalFuelKg
totalDollarImpact
attributedRuntimePercent
locationRows
reasonRows
unattributedRows
assumptionMetadata
exportRows
```

- [x] **Step 3: Verify and commit**

Run:

```bash
npm run test -- lib/read-models/hq-report.test.ts
git add lib/read-models/hq-report.ts lib/read-models/hq-report.test.ts
git commit -m feat-add-hq-report-read-model
```

---

### Task 2: Add Export Builder

**Files:**
- Create: `lib/export/reason-tagged-burn-export.ts`
- Create: `lib/export/reason-tagged-burn-export.test.ts`

- [x] **Step 1: Write tests**

Assert workbook sheets:

```text
Summary
Reason Tagged Burn
Assumptions
Data Quality
```

Assert totals reconcile with HQ report rows and include fuel price version, burn assumption version, reason taxonomy version, settings version, source event ids, `aircraftGroundEventId`, `apuEventId`, manual-off pending/confirmed markers, and fallback-rate flags.

- [x] **Step 2: Implement export builder**

Use `xlsx` to create a workbook and `downloadReasonTaggedBurnWorkbook(report)` for browser downloads. Export rows must be suitable for EDP/SQL/XLSX ingestion and reconciliation, not merely a screen scrape of the HQ table.

- [x] **Step 3: Verify and commit**

Run:

```bash
npm run test -- lib/export/reason-tagged-burn-export.test.ts
git add lib/export
git commit -m feat-add-reason-tagged-burn-export
```

---

### Task 3: Build HQ Reporting Components

**Files:**
- Create: `components/hq/*`
- Create: `components/hq/hq-reports-overview.test.tsx`

- [x] **Step 1: Write tests**

Assert filters render, KPI cards show runtime/fuel/dollar/attribution, location table renders ports, reason table renders categories, assumption metadata is visible, and export button is present.

- [x] **Step 2: Implement components**

Use compact cards and tables. Dollars are allowed here, but kg fuel must remain visible next to dollar conversion assumptions.

- [x] **Step 3: Verify and commit**

Run:

```bash
npm run test -- components/hq/hq-reports-overview.test.tsx
git add components/hq
git commit -m feat-add-hq-reporting-components
```

---

### Task 4: Wire `/hq` And `/hq/reports`

**Files:**
- Modify: `app/hq/page.tsx`
- Modify: `app/hq/reports/page.tsx`

- [x] **Step 1: Wire pages**

Both pages can use the same `HQReportsOverview`, with `/hq` defaulting to overview filters and `/hq/reports` showing the export-first layout.

- [x] **Step 2: Verify and commit**

Run:

```bash
npm run test
npm run build
git add app/hq components/hq lib/read-models lib/export
git commit -m feat-wire-hq-reporting-routes
```

---

## Self-Review

- Spec coverage: HQ reports, assumption metadata, kg plus dollar view, export reconciliation, location and reason tables are covered.
- Public interfaces: `deriveHqReport` and export builder are stable for admin previews and final hardening.
- Handoff checks: full tests/build passed before PR 09; branch is pushed for manual PR creation/integration.
