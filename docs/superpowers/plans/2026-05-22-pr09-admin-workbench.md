# PR 09 HQ Admin Workbench Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the functional HQ/Admin Workbench for settings, admin previews, and data-quality diagnostics.

**Architecture:** Admin edits create versioned settings snapshot events in the prototype store. Pages use staged form state with explicit save/discard/reset actions and small previews against the current BNE read model.

**Tech Stack:** Next.js, React client components, TypeScript, Tailwind, Vitest, Testing Library.

**Status:** Next after PR 08 integration/manual PR flow.

**Progress Notes (updated 2026-05-23):**
- PR 05 cleanup isolated workflow event construction from persistence/hydration. Reuse that shape for admin settings actions instead of coupling settings event builders directly to storage.
- Reason-chain review interval lookup and due calculation now live in focused review helpers, which is the right extension point for admin-configurable review settings.
- PR 08 added `deriveHqReport(events, settings, filters)`, `bneHqReportSettings`, `bneHqReport`, and export-ready HQ report rows. Admin previews should consume those boundaries rather than replaying events in React or duplicating HQ reporting fixtures.
- PR 08 export lineage now depends on settings version/source metadata, fuel price source/version, burn assumption source/version, reason taxonomy source/version, source event ids, manual-off status, closure confidence, and fallback flags. PR 09 settings snapshots should preserve that metadata shape so HQ reports and workbook rows remain reconcilable.
- PR 08 added the `xlsx` dependency and the browser download wrapper in `components/hq/export-button.tsx`; PR 09 should not re-add or replace export plumbing unless it is extending an Admin-specific export.
- Latest inherited verification from PR 08: `npm run test` passed with 32 files and 180 tests, and `npm run build` passed after clearing ignored `.next` output for the known Windows/OneDrive `EPERM` cleanup case.

---

## File Structure

- Create: `lib/prototype/settings-event-store.ts`, `lib/prototype/admin-settings-actions.ts`.
- Create: `components/admin/admin-workbench-layout.tsx`, `admin-overview-status-list.tsx`, `admin-action-bar.tsx`, `admin-preview-panel.tsx`, `persona-role-preview.tsx`.
- Create: `components/admin/reason-settings-page.tsx`, `fuel-settings-page.tsx`, `urgency-settings-page.tsx`, `reference-data-page.tsx`.
- Create: `components/hq/data-quality-flags-table.tsx`, `data-quality-flag-detail-panel.tsx`.
- Modify: `app/admin/*/page.tsx`, `app/hq/data-quality/page.tsx`.
- Create tests for admin and data-quality components.

---

### Task 1: Add Settings Snapshot Store And Actions

**Files:**
- Create: `lib/prototype/settings-event-store.ts`
- Create: `lib/prototype/admin-settings-actions.ts`
- Create tests.

- [ ] **Step 1: Write tests**

Cover staged save creating `settings_changed`, version increment, discard returning saved state, reset default creating a snapshot event, and localStorage hydration.
Preserve source/version fields required by PR 08 `assumptionMetadata` and reason-tagged export rows.

- [ ] **Step 2: Implement store/actions**

Use the common event envelope and `settings_changed` typed payload from PR 02.

- [ ] **Step 3: Verify and commit**

Run:

```bash
npm run test -- lib/prototype/settings-event-store.test.ts lib/prototype/admin-settings-actions.test.ts
git add lib/prototype
git commit -m feat-add-admin-settings-snapshot-store
```

---

### Task 2: Build Admin Workbench Layout

**Files:**
- Create: `components/admin/admin-workbench-layout.tsx`
- Create: `components/admin/admin-overview-status-list.tsx`
- Create: `components/admin/admin-action-bar.tsx`
- Create: `components/admin/admin-preview-panel.tsx`
- Create: `components/admin/persona-role-preview.tsx`
- Modify: `app/admin/page.tsx`

- [ ] **Step 1: Write tests**

Assert left nav, page header, scope badge, last updated metadata, status list, persona/role preview, and links to reasons/fuel/urgency/reference data.

- [ ] **Step 2: Implement layout**

Keep the UI dense, desktop-first, and plain. Use purple primary save actions and ghost/outline secondary actions. Include a small persona/role preview so the POC can demonstrate HQ Admin, HQ reporting, Senior Engineer, and future apron engineer viewpoints without building a real auth system in this PR.

- [ ] **Step 3: Verify and commit**

Run:

```bash
npm run test -- components/admin/admin-workbench-layout.test.tsx
git add components/admin app/admin/page.tsx
git commit -m feat-add-admin-workbench-layout
```

---

### Task 3: Build Reason Settings

**Files:**
- Create: `components/admin/reason-settings-page.tsx`
- Modify: `app/admin/reasons/page.tsx`
- Create tests.

- [ ] **Step 1: Write tests**

Assert category table, detail editor, max four active details warning, review interval fields, active switches, ordering controls, staged save/discard, fast-capture preview, and a settings model that can hold global defaults plus a BNE override shape even though this PR edits global defaults only.

- [ ] **Step 2: Implement page**

Use current reason taxonomy settings. Enforce four active details per category before save. Store settings with a global scope and optional per-port override structure so future BNE/port edits do not require redesigning the event contract.

- [ ] **Step 3: Verify and commit**

Run:

```bash
npm run test -- components/admin/reason-settings-page.test.tsx
git add components/admin/reason-settings-page.tsx app/admin/reasons/page.tsx
git commit -m feat-add-admin-reason-settings
```

---

### Task 4: Build Fuel And Urgency Settings

**Files:**
- Create: `components/admin/fuel-settings-page.tsx`
- Create: `components/admin/urgency-settings-page.tsx`
- Modify: `app/admin/fuel/page.tsx`, `app/admin/urgency/page.tsx`
- Create tests.

- [ ] **Step 1: Write tests**

Fuel tests cover fuel price, equipment burn rates, fallback rate warning, version metadata, and estimated kg preview. Urgency tests cover fixed bucket display, editable global weights, global-only urgency editing for MVP, validation, reset defaults, and BNE board order preview.
Fuel previews should verify that changed rates flow through `deriveHqReport` without changing export-row lineage semantics.

- [ ] **Step 2: Implement pages**

Use staged edits and preview panels. Bucket order is read-only. Weights must be non-negative and at least one weight must be greater than zero. The data shape must include room for future port-specific overrides, but the first editor should present global defaults only to avoid overbuilding.

- [ ] **Step 3: Verify and commit**

Run:

```bash
npm run test -- components/admin/fuel-settings-page.test.tsx components/admin/urgency-settings-page.test.tsx
git add components/admin/fuel-settings-page.tsx components/admin/urgency-settings-page.tsx app/admin/fuel/page.tsx app/admin/urgency/page.tsx
git commit -m feat-add-admin-fuel-urgency-settings
```

---

### Task 5: Build Reference Data And Data Quality Diagnostics

**Files:**
- Create: `components/admin/reference-data-page.tsx`
- Create: `components/hq/data-quality-flags-table.tsx`
- Create: `components/hq/data-quality-flag-detail-panel.tsx`
- Modify: `app/admin/reference-data/page.tsx`, `app/hq/data-quality/page.tsx`
- Create tests.

- [ ] **Step 1: Write tests**

Assert reference data tables for tail/equipment and stand coordinates. Assert data-quality filters by port, source, issue type, status, and recency; detail panel shows tail, bay, source metadata, user note, related event ids, PR 08 manual-off status, fallback-rate flags, and inferred-closure confidence where present.

- [ ] **Step 2: Implement pages**

Use table-first layout and compact badges for stale/conflicting/fallback states. Combine existing `deriveDataQualityTelemetry` event flags with PR 08 report/export row fields for manual-off, fallback assumption, inferred closure, and source-event traceability diagnostics.

- [ ] **Step 3: Full verification and commit**

Run:

```bash
npm run test
npm run build
git add components/admin components/hq app/admin app/hq/data-quality lib/prototype
git commit -m feat-complete-admin-workbench
```

---

## Self-Review

- Spec coverage: admin overview, reasons, fuel, urgency, reference data, settings snapshots, previews, validation, and data-quality diagnostics are covered.
- Public interfaces: settings snapshot events are the only write path for admin changes; HQ previews reuse PR 08 report/export read-model contracts.
- Handoff checks: full tests/build pass before cleanup.
