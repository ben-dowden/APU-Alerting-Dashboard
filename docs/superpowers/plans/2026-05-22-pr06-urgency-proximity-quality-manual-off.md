# PR 06 Urgency Proximity Source Quality And Manual-Off Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add operational prioritisation, spatial context, source-quality markers, data-quality flagging, and manual APU-off pending confirmation.

**Architecture:** Ranking and proximity remain in the read-model/domain layer. UI components receive already-derived urgency, proximity, and quality fields and render compact charms/tooltips. Fallback fuel-assumption detail must stay out of collapsed aircraft cards; it belongs in the card drawer, HQ reporting, and export lineage.

**Tech Stack:** TypeScript, React, Tailwind, lucide-react, Vitest, Testing Library.

**Status:** Pending as a dedicated feature PR after PR 05 integration; several foundations were completed or hardened on `pr05-aircraft-reason-workflow`.

**Progress Notes (updated 2026-05-23):**
- Aircraft-card urgency is now organized as named policy entries in `lib/read-models/aircraft-card.ts`, including the manual-off pending bucket and deterministic sorting boundary.
- Manual-off source events are indexed in `lib/read-models/current-board-context.ts`; components should continue to consume `manualOffPending` as a derived read-model field.
- PR 05 cleanup did not implement the dedicated PR 06 source-quality charm, proximity hover card, data-quality flag action, or manual-off action UI. Those remain the next PR 06 deliverables.
- Latest branch verification passed with `npm run test` (146 tests), `npx tsc --noEmit`, and `npm run build` after clearing stale ignored `.next` output.

---

## PR 03 Clean-Code Carry-Forward

- Extend existing helpers in `lib/domain/proximity.ts`, `lib/domain/time.ts`, `lib/domain/ids.ts`, `lib/read-models/current-board.ts`, and `lib/read-models/aircraft-card.ts` before adding parallel ranking, proximity, source-quality, or pending-state logic.
- Ranking, proximity, source quality, and manual-off pending status remain derived facts. Components should receive fields such as urgency bucket, closest tail, source freshness, and pending confirmation state rather than inferring them from raw events.
- Prefer table-driven bucket, label, charm, and telemetry mappings plus named helper functions. Avoid nested conditionals that mix business rules, source-quality semantics, and visual styling in one component.

## PR 04 Command-Board Carry-Forward

- Extend the PR 04 aircraft card display body rather than replacing it; PR 06 should add urgency, proximity, source-quality, and manual-off affordances around the established card metrics and current-reason layout.
- Replace `Closest tail pending` with derived proximity text only after read-model fields exist and are tested.
- Keep fallback fuel-assumption lineage out of collapsed aircraft cards; the PR 04 Senior surface intentionally shows runtime and estimated kg fuel only.
- Preserve the compact command-board layout and avoid reintroducing the foundation left sidebar.

---

## File Structure

- Modify: `lib/read-models/aircraft-card.ts`, `current-board.ts`.
- Modify: `lib/domain/proximity.ts`.
- Create: `lib/domain/urgency-ranking.ts`, `lib/domain/urgency-ranking.test.ts`.
- Create: `components/senior/source-quality-charm.tsx`, `proximity-hover-card.tsx`, `data-quality-flag-action.tsx`, `manual-apu-off-action.tsx`.
- Modify: `components/senior/desktop-aircraft-card.tsx`, `ground-aircraft-table.tsx`.

---

### Task 1: Add Urgency Ranking

**Files:**
- Create: `lib/domain/urgency-ranking.ts`
- Create: `lib/domain/urgency-ranking.test.ts`
- Modify: read-model files.

- [ ] **Step 1: Write tests**

Cover fixed bucket order:

```text
missing reason
overdue review
active APU valid reason
manual APU-off pending
APU off or OK
```

Cover weighted tiebreakers: overdue minutes, runtime minutes, fuel kg, nearby APU cluster, total ground time, deterministic tail fallback.

- [ ] **Step 2: Implement ranking**

Export `rankAircraftCards(cards, settings)` and add `urgencyRank`, `urgencyBucket`, `urgencyScore`, `urgencyReason`, and `urgencyTiebreakerBreakdown` to aircraft card read models.

- [ ] **Step 3: Verify and commit**

Run:

```bash
npm run test -- lib/domain/urgency-ranking.test.ts
git add lib/domain/urgency-ranking.ts lib/domain/urgency-ranking.test.ts lib/read-models
git commit -m feat-add-aircraft-urgency-ranking
```

---

### Task 2: Add Proximity Display

**Files:**
- Modify: `lib/domain/proximity.ts`
- Create: `components/senior/proximity-hover-card.tsx`
- Modify: `components/senior/aircraft-card-content.tsx`

- [ ] **Step 1: Write tests**

Assert closest tail distance is calculated from stand coordinates and nearby APU-running list includes aircraft within 100m from the selected aircraft.

- [ ] **Step 2: Implement UI**

Show `Closest tail: VH-XXX · Xm` on cards. On hover/focus, show nearby APU-running aircraft with tail, bay, and distance from selected aircraft.

- [ ] **Step 3: Verify and commit**

Run:

```bash
npm run test -- lib/domain/proximity.test.ts
git add lib/domain/proximity.ts components/senior/proximity-hover-card.tsx components/senior/aircraft-card-content.tsx
git commit -m feat-add-aircraft-proximity-context
```

---

### Task 3: Add Source Quality Charms

**Files:**
- Create: `components/senior/source-quality-charm.tsx`
- Modify: `components/senior/aircraft-card-content.tsx`

- [ ] **Step 1: Write tests**

Assert stale, unknown, conflicting, and low-confidence source markers render as compact charms with accessible tooltip text. Assert fallback fuel-assumption markers are not rendered on the collapsed aircraft card and are available only in drawer/detail or reporting/export contexts.

- [ ] **Step 2: Implement charms**

Use tiny badges or icon buttons. Keep visible text compact and put source timestamp/meaning in tooltip content. Do not create a collapsed-card charm for fallback burn-rate assumptions; the collapsed card should avoid noisy data-lineage markers unless they affect immediate operational confidence.

- [ ] **Step 3: Verify and commit**

Run:

```bash
npm run test -- components/senior/source-quality-charm.test.tsx
git add components/senior/source-quality-charm.tsx components/senior/aircraft-card-content.tsx
git commit -m feat-add-source-quality-charms
```

---

### Task 4: Add Data-Quality Flag Action

**Files:**
- Create: `components/senior/data-quality-flag-action.tsx`
- Modify: `lib/prototype/workflow-actions.ts`
- Modify: `components/senior/desktop-aircraft-card.tsx`

- [ ] **Step 1: Write tests**

Assert flag action creates `data_quality_flag_created` with tail, port, bay, derived state, source freshness, issue type, optional note, user/persona, and timestamp.

- [ ] **Step 2: Implement action**

Place a small ghost action in card source details or drawer utility area. Do not make it a dominant card action.

- [ ] **Step 3: Verify and commit**

Run:

```bash
npm run test -- components/senior/data-quality-flag-action.test.tsx lib/prototype/workflow-actions.test.ts
git add components/senior/data-quality-flag-action.tsx components/senior/desktop-aircraft-card.tsx lib/prototype/workflow-actions.ts
git commit -m feat-add-data-quality-flag-action
```

---

### Task 5: Add Manual APU-Off Pending Workflow

**Files:**
- Create: `components/senior/manual-apu-off-action.tsx`
- Modify: `lib/prototype/workflow-actions.ts`
- Modify: `components/senior/desktop-aircraft-card.tsx`, `ground-aircraft-table.tsx`
- Update tests.

- [ ] **Step 1: Write tests**

Cover:

```text
manual action creates manual_apu_off_observed
card moves to Pending off
review prompts pause while pending
trusted off closes officially
trusted running event reopens as APU-running
reason chain burn durations do not close on manual observation alone
```

- [ ] **Step 2: Implement workflow**

Render `Mark APU off` near APU state context. Use neutral pending styling and tooltip `Source confirmation outstanding`.

- [ ] **Step 3: Full verification and commit**

Run:

```bash
npm run test
npm run build
git add components/senior lib
git commit -m feat-add-manual-apu-off-and-quality-signals
```

---

## Self-Review

- Spec coverage: urgency ranking, proximity, data quality, compact source charms, drawer/reporting-only fallback markers, data issue flags, and manual-off pending state are covered.
- Public interfaces: UI consumes derived urgency/proximity/quality fields from read models.
- Handoff checks: full tests and build pass before wallboard PR.
