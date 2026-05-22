# PR 03 Reducers And Read-Model Foundation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build pure reducers and read-model functions that replay event-shaped fixtures into board state, aircraft cards, scorecards, reason-tagged burn rows, and diagnostics.

**Architecture:** Keep this PR UI-free. Reducers live in `lib/domain`, read models live in `lib/read-models`, and all functions are deterministic, replayable, and directly testable.

**Tech Stack:** TypeScript, Vitest, event contracts and fixtures from PR 02.

---

## File Structure

- Create: `lib/domain/ids.ts`, `time.ts`, `apu-reducer.ts`, `reason-chain-reducer.ts`, `manual-observation-reducer.ts`, `fuel.ts`, `proximity.ts`.
- Create: `lib/read-models/current-board.ts`, `aircraft-card.ts`, `daily-scorecard.ts`, `benchmark-panel.ts`, `reason-tagged-burn.ts`, `data-quality.ts`, `index.ts`.
- Create tests beside each domain/read-model file.

---

### Task 1: Canonical ID Helpers

**Files:**
- Create: `lib/domain/ids.ts`
- Create: `lib/domain/ids.test.ts`

- [ ] **Step 1: Write tests**

Test exact outputs:

```text
createAircraftGroundEventId("BNE", "VH-8IA", "2026-05-22T08:14:00.000Z")
=> "BNE:VH-8IA:ground:2026-05-22T08:14:00.000Z"

createApuEventId("BNE", "VH-8IA", "2026-05-22T08:37:00.000Z")
=> "BNE:VH-8IA:apu:2026-05-22T08:37:00.000Z"
```

- [ ] **Step 2: Implement helpers**

Export `createAircraftGroundEventId`, `createApuEventId`, and `normalizeTail`.

Post-implementation helper surface also includes `createLegacyFixtureApuEventId` and `matchesApuEventId` so legacy PR 02 fixture event references are handled in one place instead of scattered through reducers or UI code.

- [ ] **Step 3: Verify and commit**

Run:

```bash
npm run test -- lib/domain/ids.test.ts
git add lib/domain/ids.ts lib/domain/ids.test.ts
git commit -m feat-add-canonical-event-id-helpers
```

---

### Task 2: APU Event Reducer

**Files:**
- Create: `lib/domain/apu-reducer.ts`
- Create: `lib/domain/apu-reducer.test.ts`

- [ ] **Step 1: Write tests**

Cover:

```text
opens an APU event on on transition
closes it on off transition using occurredAt
ignores duplicate same-state messages
replays late off messages by source timestamp
derives low-confidence inferred closure from off-ground/departed flight state when explicit off is absent
```

- [ ] **Step 2: Implement reducer**

Export `deriveApuEvents(events, options)` returning open/closed APU events with:

```ts
apuEventId
tail
port
startedAt
endedAt
state
closureType
closureConfidence
closureReason
closureSourceEventIds
sourceEventIds
```

- [ ] **Step 3: Verify and commit**

Run:

```bash
npm run test -- lib/domain/apu-reducer.test.ts
git add lib/domain/apu-reducer.ts lib/domain/apu-reducer.test.ts
git commit -m feat-add-apu-transition-reducer
```

---

### Task 3: Reason Chain And Review State

**Files:**
- Create: `lib/domain/reason-chain-reducer.ts`
- Create: `lib/domain/reason-chain-reducer.test.ts`

- [ ] **Step 1: Write tests**

Cover:

```text
first reason creates current segment
changed reason closes previous segment and opens next
kept reason records review resolution but does not create a visible segment
review due is derived from current segment start and configured interval
closed APU event locks segment end timestamp
```

- [ ] **Step 2: Implement reducer**

Export `deriveReasonChain(apuEvent, domainEvents, settings, nowIso)` and return segments plus derived fields:

```ts
currentReason
reviewDueAt
isReviewDue
reviewResponseTelemetry
isLocked
```

- [ ] **Step 3: Verify and commit**

Run:

```bash
npm run test -- lib/domain/reason-chain-reducer.test.ts
git add lib/domain/reason-chain-reducer.ts lib/domain/reason-chain-reducer.test.ts
git commit -m feat-add-reason-chain-reducer
```

---

### Task 4: Fuel, Proximity, And Data Quality Helpers

**Files:**
- Create: `lib/domain/fuel.ts`, `lib/domain/proximity.ts`
- Create: `lib/domain/fuel.test.ts`, `lib/domain/proximity.test.ts`

- [ ] **Step 1: Write tests**

Fuel tests cover equipment-specific rate, fallback rate, assumption version metadata, and reason-tagged kg allocation. Proximity tests cover closest tail and nearby APU-running aircraft within 100m.

- [ ] **Step 2: Implement helpers**

Export:

```ts
estimateFuelKgForEquipment(runtimeMinutes, equipmentTypeCode, settings)
calculateClosestAircraft(target, candidates, standCoordinates)
calculateNearbyApuAircraft(target, candidates, standCoordinates, 100)
```

- [ ] **Step 3: Verify and commit**

Run:

```bash
npm run test -- lib/domain/fuel.test.ts lib/domain/proximity.test.ts
git add lib/domain/fuel.ts lib/domain/fuel.test.ts lib/domain/proximity.ts lib/domain/proximity.test.ts
git commit -m feat-add-fuel-and-proximity-domain-helpers
```

---

### Task 5: Current Board And Aircraft Card Read Models

**Files:**
- Create: `lib/read-models/current-board.ts`, `lib/read-models/aircraft-card.ts`
- Create: corresponding tests.

- [ ] **Step 1: Write tests**

Use `bne-baseline` and assert:

```text
all BNE ground aircraft appear
APU-off aircraft remain calm/visible
active APU cards include runtime, fuel kg, current reason, review state, and source charms
manual-off scenario produces pending confirmation state
```

- [ ] **Step 2: Implement read models**

Export `deriveCurrentBoard(events, settings, nowIso)` and `deriveAircraftCards(boardState)`.

- [ ] **Step 3: Verify and commit**

Run:

```bash
npm run test -- lib/read-models/current-board.test.ts lib/read-models/aircraft-card.test.ts
git add lib/read-models
git commit -m feat-add-current-board-read-model
```

---

### Task 6: Scorecard, Benchmark, Burn Rows, And Diagnostics

**Files:**
- Create: `lib/read-models/daily-scorecard.ts`, `benchmark-panel.ts`, `reason-tagged-burn.ts`, `data-quality.ts`, `index.ts`
- Create tests.

- [ ] **Step 1: Write tests**

Cover:

```text
daily scorecard active APU count, runtime, fuel kg, attributed runtime
benchmark panel modes for similar-temperature, weekly average, monthly average, and annual average
similar-temperature benchmark uses 3°C bands and exact absolute and percentage deltas
reason-tagged burn rows reconcile to APU event duration
fallback burn assumptions are flagged
equipment mismatches appear in data-quality telemetry
```

- [ ] **Step 2: Implement read models**

Export `deriveDailyScorecard`, `deriveBenchmarkPanel`, `deriveReasonTaggedBurnRows`, and `deriveDataQualityTelemetry`.

`deriveBenchmarkPanel` must return exactly one active comparison at a time plus the selectable modes. It must provide runtime and estimated kg fuel deltas in absolute and percentage terms, and must not calculate dollar impact for Senior Engineer consumers. Similar-temperature comparison should expose the active 3°C band label used by the UI.

`deriveReasonTaggedBurnRows` must allocate kg burn by reason segment using equipment-specific or fallback burn rates and preserve assumption version fields for export/HQ reconciliation. Unattributed runtime must remain a first-class bucket rather than disappearing into totals.

- [ ] **Step 3: Run all checks and commit**

Run:

```bash
npm run test
npm run build
git add lib/read-models
git commit -m feat-add-scorecard-benchmark-burn-read-models
```

---

## Post-Implementation Clean-Code Handoff

- Pass 1, `refactor-clean-read-model-domain-helpers`: centralized canonical/legacy APU id matching in `lib/domain/ids.ts`, split current-board event collection context from per-aircraft projection, moved aircraft-card labels to table-driven mappings, and made reason review-resolution mapping declarative.
- Pass 2, `refactor-centralize-time-event-ordering`: added `lib/domain/time.ts` and `lib/domain/time.test.ts`, then replaced duplicated elapsed-minute math, ISO minute addition, and event replay ordering across domain reducers and read models.
- Pass 3, `refactor-post-vite-clean-code`: centralized route metadata in `lib/app-routes.ts`, reduced route stubs to registry lookups, split current-board derivation into context/projection/type modules, derived source/domain event guards from event registries, moved BNE fixture defaults into one scenario context, and made reason-chain replay handlers table-driven.
- Carry-forward framework: keep domain and read-model functions small and named by intent; centralize deterministic replay/time/id helpers; prefer table-driven mappings and registries over nested conditional label, telemetry, route, or event-family logic; preserve the boundary where UI imports `lib/read-models/index.ts` instead of replaying source events locally.

## Self-Review

- Spec coverage: replay, APU state, inferred closure, manual pending state, reason chain, review derivation, fuel assumptions, proximity, scorecards, benchmarks, burn attribution, and diagnostics are covered.
- Public interfaces: later UI PRs should import read models from `lib/read-models` and route metadata from `lib/app-routes` instead of duplicating route labels, descriptions, or navigation groups.
- Handoff checks: all domain/read-model tests plus build pass before PR 04. Latest clean-code verification: `npm run test` passed with 99 tests, and `npm run build` passed after clearing ignored `.next` output.
