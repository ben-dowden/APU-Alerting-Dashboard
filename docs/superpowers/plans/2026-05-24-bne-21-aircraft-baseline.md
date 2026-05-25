# BNE 21-Aircraft Baseline Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Expand the default BNE baseline to 21 aircraft on ground and harden the dense senior/wallboard UI paths.

**Architecture:** Keep the baseline event-shaped by adding a typed seed table and local event expansion helpers in `lib/fixtures/scenarios/bne-baseline.ts`. Preserve existing read-model derivation, but pass the ground table aircraft in `deriveAircraftCards` urgency order and constrain dense lists with internal overflow.

**Tech Stack:** Next.js 16, React 19, TypeScript, Tailwind CSS, Vitest, Testing Library.

---

## File Structure

- Modify `lib/fixtures/scenarios/bne-baseline.ts`: replace the two-aircraft literal fixture with a deterministic 21-aircraft seed table expanded into source/domain events.
- Modify `lib/read-models/current-board.test.ts`: update baseline assertions for 21 aircraft and representative states.
- Modify `components/senior/bne-command-board.tsx`: derive a priority-ordered ground aircraft array from `aircraftCards`.
- Modify `components/senior/ground-aircraft-table.tsx`: constrain the dense row list and keep table headers readable.
- Modify `components/senior/bne-command-board.test.tsx`: assert high-density default rendering and workflow controls still exist.
- Modify `components/wallboard/wallboard-side-index.tsx`: constrain the 21-row side index inside the wallboard frame.
- Modify `components/wallboard/wallboard.test.tsx`: assert default wallboard pagination and full side-index row count.

### Task 1: Expand Default Baseline Fixture

**Files:**
- Modify: `lib/fixtures/scenarios/bne-baseline.ts`
- Test: `lib/fixtures/scenarios.test.ts`
- Test: `lib/read-models/current-board.test.ts`

- [ ] **Step 1: Replace the baseline fixture with typed seed expansion**

Use a local `BaselineAircraftSeed` type with fields for tail, aircraft type, flight numbers, gate state, on-ground time, optional stand, APU state, optional reason, manual-off observation, and source quality. Add helpers that call existing scenario builders: `flightStateEvent`, `standAssignmentEvent`, `apuStateEvent`, `reasonSelectedEvent`, and `manualApuOffObservedEvent`.

- [ ] **Step 2: Include exactly 21 aircraft**

Create seeds for these tails and state groups:

`VH-8IA`, `VH-YFX`, `VH-VUK`, `VH-YQO`, `VH-8NJ`, `VH-VUY`, `VH-YIT`, `VH-YFW`, `VH-VOP`, `VH-VUL`, `VH-8FE`, `VH-YVA`, `VH-VUT`, `VH-VUF`, `VH-YIR`, `VH-8XB`, `VH-VUZ`, `VH-YWE`, `VH-8FP`, `VH-VUQ`, `VH-YFR`.

Ensure the expanded scenario yields:

- 5 missing-reason active APU aircraft.
- 5 review-overdue active APU aircraft.
- 4 active-valid-reason aircraft with review still set in the future.
- 2 manual-off-pending aircraft.
- 5 APU-off aircraft.
- At least one stale/low-confidence stand assignment.
- At least one unassigned aircraft with no stand event.
- At least one ACMS latency charm over 5 minutes.

- [ ] **Step 3: Keep deterministic replay ordering**

Sort the final baseline `events` array by `receivedAt`, then `occurredAt`, then `eventId` so the existing scenario ordering tests still pass.

- [ ] **Step 4: Run fixture/read-model tests**

Run: `npm run test -- lib/fixtures/scenarios.test.ts lib/read-models/current-board.test.ts`

Expected: tests pass after Task 2 updates read-model expectations.

### Task 2: Update Read-Model Tests

**Files:**
- Modify: `lib/read-models/current-board.test.ts`

- [ ] **Step 1: Update baseline count and tail assertions**

Change the baseline test to assert `board.groundAircraft` has length `21`, contains the known edge-case tails, and all entries have `port === "BNE"`.

- [ ] **Step 2: Add representative state assertions**

Assert the derived cards include:

- `VH-8IA` as review-overdue with cleaning reason.
- `VH-VUK` as missing reason.
- `VH-8NJ` as manual-off pending.
- `VH-YFX` as APU off.
- `VH-VUF` as unassigned.
- A stale/low-confidence source charm for `VH-VOP`.
- ACMS latency for `VH-YIT`.

- [ ] **Step 3: Keep existing behavioral tests**

Preserve port filtering, future-event exclusion, source ordering, manual-off confirmation, manual-off contradiction, and APU-off calm-state tests.

### Task 3: Harden Senior Board Dense UI

**Files:**
- Modify: `components/senior/bne-command-board.tsx`
- Modify: `components/senior/ground-aircraft-table.tsx`
- Modify: `components/senior/bne-command-board.test.tsx`

- [ ] **Step 1: Pass priority-ordered ground aircraft to the side table**

In `BneCommandBoard`, build a map from `board.groundAircraft`, derive `prioritizedGroundAircraft` from `aircraftCards`, and pass that to `GroundAircraftTable`.

- [ ] **Step 2: Constrain the side table**

Wrap the table in a large-screen max-height scroll container such as `lg:max-h-[calc(100vh-19rem)] lg:overflow-y-auto`, keep `overflow-x-auto`, and make the header row sticky inside the scroll region.

- [ ] **Step 3: Update senior board tests**

Assert the work queue renders 21 aircraft cards, the side table renders 21 data rows, and the existing `VH-8IA` workflow controls still render.

### Task 4: Harden Wallboard Dense UI

**Files:**
- Modify: `components/wallboard/wallboard-side-index.tsx`
- Modify: `components/wallboard/wallboard.test.tsx`

- [ ] **Step 1: Constrain the side index**

Make the side index a `flex min-h-0 flex-col` container and make the `<ol>` a `min-h-0 flex-1 overflow-y-auto` list so 21 rows stay inside the wallboard shell.

- [ ] **Step 2: Update wallboard tests**

For the default wallboard page, assert the carousel marker shows `[1 of 11]`, the side index renders 21 list items, and rows are still passive with no buttons.

### Task 5: Verify And Commit

**Files:**
- All modified files from Tasks 1-4.

- [ ] **Step 1: Run targeted tests**

Run: `npm run test -- lib/fixtures/scenarios.test.ts lib/read-models/current-board.test.ts components/senior/bne-command-board.test.tsx components/wallboard/wallboard.test.tsx`

Expected: PASS.

- [ ] **Step 2: Run full tests**

Run: `npm run test`

Expected: PASS.

- [ ] **Step 3: Run production build**

Run: `npm run build`

Expected: PASS unless blocked by an unrelated local Next.js/OneDrive artifact issue.

- [ ] **Step 4: Commit implementation**

Run:

```bash
git add lib/fixtures/scenarios/bne-baseline.ts lib/read-models/current-board.test.ts components/senior/bne-command-board.tsx components/senior/ground-aircraft-table.tsx components/senior/bne-command-board.test.tsx components/wallboard/wallboard-side-index.tsx components/wallboard/wallboard.test.tsx docs/superpowers/plans/2026-05-24-bne-21-aircraft-baseline.md
git commit -m "feat-expand-bne-baseline-ground-load"
```
