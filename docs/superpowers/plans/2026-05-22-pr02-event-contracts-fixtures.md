# PR 02 Event Contracts And Scenario Fixtures Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add strict event contracts, typed source/domain events, reference settings snapshots, and BNE event-shaped scenario fixtures.

**Architecture:** Keep all event contracts and fixtures independent of React. Use `lib/events` for event types and guards, `lib/fixtures` for scenario data, and tests that validate every fixture can be replayed by later reducers.

**Carry-Forward From PR 01:** PR 01 introduced the active Next.js runtime, `next-env.d.ts`, Vitest alias/runtime config, and a foundation-only `AppShell` sidebar. If Vitest cannot resolve setup files through the `New project/APU Alerting Dashboard` junction, run commands from the resolved repo path at `C:\Users\DOWDENR\OneDrive - Virgin Australia Airlines Pty Ltd\Documents\APU Alerting Dashboard`. Do not revert the Next-generated TypeScript support. Do not spend PR 02 scope on replacing the large sidebar; that UX correction is explicitly scheduled for PR 04 when the Senior Engineer command board replaces the stub.

**Tech Stack:** TypeScript, Vitest, Next.js project layout from PR 01.

---

## File Structure

- Create: `lib/events/envelope.ts`, `lib/events/source-events.ts`, `lib/events/domain-events.ts`, `lib/events/settings-events.ts`, `lib/events/guards.ts`, `lib/events/index.ts`.
- Create: `lib/fixtures/reference/reason-taxonomy.ts`, `fuel-assumptions.ts`, `urgency-ranking.ts`, `tail-equipment.ts`, `stand-coordinates.ts`.
- Create: `lib/fixtures/scenarios/bne-baseline.ts`, `bne-acms-lag.ts`, `bne-manual-off-confirmed.ts`, `bne-manual-off-contradicted.ts`, `bne-equipment-mismatch.ts`, `bne-missing-burn-assumption.ts`, `bne-stale-stand-assignment.ts`, `index.ts`.
- Create: `lib/fixtures/scenarios.test.ts`.

---

### Task 1: Define Event Envelope And Shared Types

**Files:**
- Create: `lib/events/envelope.ts`
- Create: `lib/events/index.ts`

- [ ] **Step 1: Write failing envelope tests**

Create `lib/events/envelope.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { buildEventId, buildIdempotencyKey } from "./envelope";

describe("event envelope helpers", () => {
  it("creates stable ids and idempotency keys from event facts", () => {
    expect(buildEventId("apu_state_event", "BNE", "VH-8IA", "2026-05-22T00:00:00.000Z")).toBe(
      "apu_state_event:BNE:VH-8IA:2026-05-22T00:00:00.000Z",
    );
    expect(buildIdempotencyKey("ACMS", "MSG-1")).toBe("ACMS:MSG-1");
  });
});
```

- [ ] **Step 2: Run failing test**

Run:

```bash
npm run test -- lib/events/envelope.test.ts
```

Expected: FAIL because `lib/events/envelope.ts` does not exist.

- [ ] **Step 3: Implement envelope**

Create `lib/events/envelope.ts` with exported `EventCorrelation`, `EventQuality`, `EventEnvelope<TPayload>`, `EventSourceSystem`, `buildEventId`, and `buildIdempotencyKey`. Include fields from the spec: `eventId`, `eventType`, `eventVersion`, `sourceSystem`, `sourceEventId`, `occurredAt`, `receivedAt`, `correlation`, `quality`, and `payload`.

Create `lib/events/index.ts` that re-exports from all event files added in this PR.

- [ ] **Step 4: Verify and commit**

Run:

```bash
npm run test -- lib/events/envelope.test.ts
git add lib/events
git commit -m feat-add-event-envelope-contract
```

---

### Task 2: Define Source And Domain Event Payloads

**Files:**
- Create: `lib/events/source-events.ts`
- Create: `lib/events/domain-events.ts`
- Create: `lib/events/settings-events.ts`
- Modify: `lib/events/index.ts`

- [ ] **Step 1: Add event payload types**

Create source payload unions for:

```text
flight_state_event
stand_assignment_event
apu_state_event
weather_observation_event
tail_equipment_reference_event
stand_coordinate_reference_event
```

Create domain payload unions for:

```text
reason_selected
reason_changed
reason_kept
reason_note_added
manual_apu_off_observed
data_quality_flag_created
review_resolved
settings_changed
```

Use `EventEnvelope<TPayload>` for exported event aliases. APU source events must represent transition state `on | off`, not sampled ticks.

- [ ] **Step 2: Add settings snapshot types**

Create settings payload types for reason taxonomy, fuel price, fuel burn assumptions, urgency ranking settings, tail equipment reference, and stand coordinates. Include `settingsFamily`, `settingsVersion`, `effectiveFrom`, `changedBy`, `changedAt`, `summary`, and `snapshot`.

- [ ] **Step 3: Commit event types**

Run:

```bash
npm run build
git add lib/events
git commit -m feat-add-source-domain-event-types
```

---

### Task 3: Add Event Guards

**Files:**
- Create: `lib/events/guards.ts`
- Create: `lib/events/guards.test.ts`

- [ ] **Step 1: Write guard tests**

Create tests proving:

```text
isSourceEvent returns true for apu_state_event and false for reason_selected.
isDomainEvent returns true for reason_selected and false for apu_state_event.
isApuStateEvent returns true only for apu_state_event with payload.state on/off.
```

- [ ] **Step 2: Implement guards**

Create guards using event type strings and payload shape checks. Keep these as lightweight runtime checks, not a schema library.

- [ ] **Step 3: Verify and commit**

Run:

```bash
npm run test -- lib/events/guards.test.ts
git add lib/events/guards.ts lib/events/guards.test.ts
git commit -m test-add-event-type-guards
```

---

### Task 4: Add Reference Fixtures

**Files:**
- Create: files under `lib/fixtures/reference/`

- [ ] **Step 1: Create reference fixture modules**

Create modules exporting:

```text
reasonTaxonomySettings
fuelPriceSettings
fuelBurnAssumptionSettings
urgencyRankingSettings
tailEquipmentReferenceEvents
standCoordinateReferenceEvents
```

Use BNE-focused data with B738, B38M, B39M, and a configured fallback fuel burn assumption. Include stand coordinates for at least eight BNE stands and reason categories/details from the spec.

- [ ] **Step 2: Commit reference fixtures**

Run:

```bash
npm run build
git add lib/fixtures/reference
git commit -m feat-add-reference-event-fixtures
```

---

### Task 5: Add BNE Scenario Fixtures And Validity Tests

**Files:**
- Create: `lib/fixtures/scenarios/*`
- Create: `lib/fixtures/scenarios.test.ts`

- [ ] **Step 1: Create scenario fixtures**

Each scenario exports `{ id, name, description, events }`. Include source and domain events needed for:

```text
bne-baseline
bne-acms-lag
bne-manual-off-confirmed
bne-manual-off-contradicted
bne-equipment-mismatch
bne-missing-burn-assumption
bne-stale-stand-assignment
```

Every event must include a populated envelope, `correlation.port`, `occurredAt`, `receivedAt`, and an idempotency key in quality or correlation metadata. `bne-stale-stand-assignment` must represent the product constraint that stand/bay context may be stale or planned, and the UI must not imply live aircraft tracking.

- [ ] **Step 2: Add fixture tests**

Test that every scenario:

```text
has at least one flight_state_event
has at least one stand_assignment_event
has at least one apu_state_event
has events sorted by receivedAt or intentionally replayable by occurredAt
has unique eventId values
has no event missing correlation.port
```

- [ ] **Step 3: Verify and commit**

Run:

```bash
npm run test -- lib/fixtures/scenarios.test.ts
npm run build
git add lib/fixtures
git commit -m feat-add-bne-event-scenario-fixtures
```

---

## Self-Review

- Spec coverage: common envelope, source families, domain families, settings snapshots, and BNE scenarios are covered.
- Public interfaces: `lib/events/index.ts` and `lib/fixtures/scenarios/index.ts` are the intended imports for later PRs.
- Handoff checks: `npm run test` and `npm run build` must pass before PR 03.
