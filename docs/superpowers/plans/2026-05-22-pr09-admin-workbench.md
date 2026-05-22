# PR 09 HQ Admin Workbench Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the functional HQ/Admin Workbench for settings, admin previews, and data-quality diagnostics.

**Architecture:** Admin edits create versioned settings snapshot events in the prototype store. Pages use staged form state with explicit save/discard/reset actions and small previews against the current BNE read model.

**Tech Stack:** Next.js, React client components, TypeScript, Tailwind, Vitest, Testing Library.

---

## File Structure

- Create: `lib/prototype/settings-event-store.ts`, `lib/prototype/admin-settings-actions.ts`.
- Create: `components/admin/admin-workbench-layout.tsx`, `admin-overview-status-list.tsx`, `admin-action-bar.tsx`, `admin-preview-panel.tsx`.
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
- Modify: `app/admin/page.tsx`

- [ ] **Step 1: Write tests**

Assert left nav, page header, scope badge, last updated metadata, status list, and links to reasons/fuel/urgency/reference data.

- [ ] **Step 2: Implement layout**

Keep the UI dense, desktop-first, and plain. Use purple primary save actions and ghost/outline secondary actions.

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

Assert category table, detail editor, max four active details warning, review interval fields, active switches, ordering controls, staged save/discard, and fast-capture preview.

- [ ] **Step 2: Implement page**

Use current reason taxonomy settings. Enforce four active details per category before save.

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

Fuel tests cover fuel price, equipment burn rates, fallback rate warning, version metadata, and estimated kg preview. Urgency tests cover fixed bucket display, editable weights, validation, reset defaults, and BNE board order preview.

- [ ] **Step 2: Implement pages**

Use staged edits and preview panels. Bucket order is read-only. Weights must be non-negative and at least one weight must be greater than zero.

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

Assert reference data tables for tail/equipment and stand coordinates. Assert data-quality filters by port, source, issue type, status, and recency; detail panel shows tail, bay, source metadata, user note, and related event ids.

- [ ] **Step 2: Implement pages**

Use table-first layout and compact badges for stale/conflicting/fallback states.

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
- Public interfaces: settings snapshot events are the only write path for admin changes.
- Handoff checks: full tests/build pass before cleanup.
