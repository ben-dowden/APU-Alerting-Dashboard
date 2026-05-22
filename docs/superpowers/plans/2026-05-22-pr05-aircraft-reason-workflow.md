# PR 05 Aircraft Card Reason Workflow Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add the Senior Engineer reason-capture workflow: reason picker, keep-current action, reason-chain drawer, notes, timeline preview, and local mock domain-event persistence.

**Architecture:** Keep workflow state as app-domain events stored client-side for the prototype. The UI writes event-shaped records through narrow action helpers, then re-derives the board read model.

**Tech Stack:** React client components, TypeScript, Tailwind, Testing Library, Vitest.

---

## File Structure

- Create: `lib/prototype/workflow-event-store.ts`, `lib/prototype/workflow-actions.ts`.
- Create: `components/senior/reason-picker.tsx`, `card-reason-drawer.tsx`, `desktop-aircraft-card.tsx`, `reason-timeline-strip.tsx`.
- Modify: `components/senior/aircraft-board.tsx`, `components/senior/bne-command-board.tsx`.
- Create/update tests under `components/senior/*.test.tsx` and `lib/prototype/*.test.ts`.

---

### Task 1: Add Local Workflow Event Store

**Files:**
- Create: `lib/prototype/workflow-event-store.ts`
- Create: `lib/prototype/workflow-event-store.test.ts`

- [ ] **Step 1: Write tests**

Cover append, list, clear, localStorage hydration, and ignored malformed JSON.

- [ ] **Step 2: Implement store**

Export `readWorkflowEvents`, `appendWorkflowEvent`, `clearWorkflowEvents`, and `WORKFLOW_EVENT_STORAGE_KEY`. Use browser localStorage when available and an in-memory fallback when not.

- [ ] **Step 3: Verify and commit**

Run:

```bash
npm run test -- lib/prototype/workflow-event-store.test.ts
git add lib/prototype
git commit -m feat-add-prototype-workflow-event-store
```

---

### Task 2: Add Workflow Action Creators

**Files:**
- Create: `lib/prototype/workflow-actions.ts`
- Create: `lib/prototype/workflow-actions.test.ts`

- [ ] **Step 1: Write tests**

Cover `selectReason`, `changeReason`, `keepCurrentReason`, `addReasonNote`, and `correctPreviousReason`. Assert each emits the correct domain event type, `apuEventId`, user/persona fields, and timestamps.

- [ ] **Step 2: Implement actions**

Each action should create an event using the common envelope from PR 02 and append it through `appendWorkflowEvent`.

- [ ] **Step 3: Verify and commit**

Run:

```bash
npm run test -- lib/prototype/workflow-actions.test.ts
git add lib/prototype/workflow-actions.ts lib/prototype/workflow-actions.test.ts
git commit -m feat-add-reason-workflow-actions
```

---

### Task 3: Build Reason Picker

**Files:**
- Create: `components/senior/reason-picker.tsx`
- Create: `components/senior/reason-picker.test.tsx`

- [ ] **Step 1: Write tests**

Assert:

```text
Select reason trigger is filled purple
Change reason trigger is quieter
Category click reveals detail pane
Detail click calls onSelect once
Escape closes without selection
No category renders more than four active details
```

- [ ] **Step 2: Implement picker**

Use a client component with a button trigger and absolute positioned two-pane popover. Use the reason taxonomy settings from fixtures. No free-text input in this component.

- [ ] **Step 3: Verify and commit**

Run:

```bash
npm run test -- components/senior/reason-picker.test.tsx
git add components/senior/reason-picker.tsx components/senior/reason-picker.test.tsx
git commit -m feat-add-two-click-reason-picker
```

---

### Task 4: Build Reason Drawer And Timeline Strip

**Files:**
- Create: `components/senior/card-reason-drawer.tsx`
- Create: `components/senior/reason-timeline-strip.tsx`
- Create tests.

- [ ] **Step 1: Write tests**

Assert drawer opens below card, closes on Escape/outside click, shows current reason, note field, current plus previous two segments by default, show-all icon toggles internal scroll, and previous-segment correction icon appears on hover/focus.

- [ ] **Step 2: Implement drawer**

Use a card-attached tray, not a full-screen `Sheet`. Keep note field in drawer only. Correction changes category/detail only and never edits timestamps.

- [ ] **Step 3: Verify and commit**

Run:

```bash
npm run test -- components/senior/card-reason-drawer.test.tsx components/senior/reason-timeline-strip.test.tsx
git add components/senior/card-reason-drawer.tsx components/senior/reason-timeline-strip.tsx components/senior/*drawer*.test.tsx components/senior/*timeline*.test.tsx
git commit -m feat-add-card-reason-drawer
```

---

### Task 5: Wire Desktop Aircraft Card Workflow

**Files:**
- Create: `components/senior/desktop-aircraft-card.tsx`
- Modify: `components/senior/aircraft-board.tsx`
- Modify: `components/senior/bne-command-board.tsx`
- Update tests.

- [ ] **Step 1: Add integration tests**

Assert missing reason cards show `Select reason`, review-due cards show icon-only keep-current action with tooltip, change reason is secondary, drawer icon is a light action, and reason actions sit inside the current-reason block.

- [ ] **Step 2: Implement workflow wiring**

Convert `/senior/bne` aircraft board to render `DesktopAircraftCard`. Re-read local workflow events after each action and re-derive board state.

- [ ] **Step 3: Full verification and commit**

Run:

```bash
npm run test
npm run build
git add components/senior lib/prototype
git commit -m feat-wire-aircraft-reason-workflow
```

---

## Self-Review

- Spec coverage: two-click reason capture, keep current, reason-chain drawer, note field, timeline preview, correction behavior, and event-shaped persistence are covered.
- Public interfaces: workflow actions are the only write path for reason events.
- Handoff checks: reason workflow tests, full test suite, and build pass before PR 06.
