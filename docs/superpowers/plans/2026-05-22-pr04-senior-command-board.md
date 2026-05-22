# PR 04 Senior BNE Command Board Shell Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the `/senior/bne` desktop command board shell using the event-derived BNE read model.

**Architecture:** Use read models from PR 03 as the only data source. Keep cards display-first in this PR; workflow mutations belong to PR 05 and PR 06.

**Tech Stack:** Next.js App Router, React, Tailwind, lucide-react, Testing Library, Vitest.

---

## File Structure

- Create: `components/senior/command-bar.tsx`, `scorecard-benchmark-band.tsx`, `aircraft-board.tsx`, `aircraft-card-content.tsx`, `ground-aircraft-table.tsx`.
- Create: `components/senior/bne-command-board.tsx`.
- Modify: `app/senior/bne/page.tsx`.
- Create: `components/senior/bne-command-board.test.tsx`.

---

### Task 1: Add Senior Command Board Data Adapter

**Files:**
- Create: `components/senior/bne-command-board.tsx`
- Modify: `app/senior/bne/page.tsx`

- [ ] **Step 1: Create the board component skeleton**

Create a server component that loads `bne-baseline`, active settings/reference fixtures, derives the current BNE board, and passes it to child components.

- [ ] **Step 2: Route to the board**

Update `app/senior/bne/page.tsx` to render `BneCommandBoard` instead of `RouteStub`.

- [ ] **Step 3: Commit**

Run:

```bash
npm run build
git add app/senior/bne/page.tsx components/senior/bne-command-board.tsx
git commit -m feat-add-bne-command-board-shell
```

---

### Task 2: Build Command Bar

**Files:**
- Create: `components/senior/command-bar.tsx`
- Create or update: `components/senior/bne-command-board.test.tsx`

- [ ] **Step 1: Write render test**

Assert the command bar shows:

```text
BNE APU Command Board
BNE
Senior Engineer
temperature chip without METAR text
feed/source freshness
current local time
Wallboard link
```

- [ ] **Step 2: Implement command bar**

Use Tailwind layout, `Badge`, `Button`, and lucide icons. Keep it compact and do not include benchmark controls.

- [ ] **Step 3: Verify and commit**

Run:

```bash
npm run test -- components/senior/bne-command-board.test.tsx
git add components/senior/command-bar.tsx components/senior/bne-command-board.test.tsx
git commit -m feat-add-senior-command-bar
```

---

### Task 3: Build Scorecard And Benchmark Band

**Files:**
- Create: `components/senior/scorecard-benchmark-band.tsx`
- Update tests.

- [ ] **Step 1: Add tests**

Assert the four metric labels render in order:

```text
APU on now
Runtime today
Fuel burned today
Attributed runtime
```

Assert only one benchmark mode is visible by default and fuel kg delta is visually/textually primary before runtime delta.

- [ ] **Step 2: Implement band**

Use four metric panels and one benchmark panel. Desktop can expose benchmark toggle buttons; use similar-temperature as default.

- [ ] **Step 3: Verify and commit**

Run:

```bash
npm run test -- components/senior/bne-command-board.test.tsx
git add components/senior/scorecard-benchmark-band.tsx components/senior/bne-command-board.test.tsx
git commit -m feat-add-scorecard-benchmark-band
```

---

### Task 4: Build Display-Only Aircraft Cards

**Files:**
- Create: `components/senior/aircraft-card-content.tsx`
- Create: `components/senior/aircraft-board.tsx`
- Update tests.

- [ ] **Step 1: Add tests**

Assert aircraft cards show tail, equipment, bay, APU state, APU runtime, ground time, estimated kg fuel, current reason, review due state, and closest tail placeholder text if proximity has not been enabled yet.

- [ ] **Step 2: Implement display cards**

Use `Card`, `Badge`, and stable Tailwind grid constraints. No reason buttons, drawer triggers, manual-off, data-quality flag action, or popovers in this PR.

- [ ] **Step 3: Verify and commit**

Run:

```bash
npm run test -- components/senior/bne-command-board.test.tsx
git add components/senior/aircraft-card-content.tsx components/senior/aircraft-board.tsx components/senior/bne-command-board.test.tsx
git commit -m feat-add-display-aircraft-card-board
```

---

### Task 5: Build Ground Aircraft Side Table

**Files:**
- Create: `components/senior/ground-aircraft-table.tsx`
- Update: `components/senior/bne-command-board.tsx`
- Update tests.

- [ ] **Step 1: Add tests**

Assert the side table shows tail, bay, red `On` chip, green `Off` chip, APU elapsed minutes, ground minutes, reason signal, and a ghost focus button.

- [ ] **Step 2: Implement table**

The focus button can set an anchor hash or data attribute in this PR; smooth scrolling behavior can be refined later.

- [ ] **Step 3: Full verification and commit**

Run:

```bash
npm run test
npm run build
git add components/senior app/senior/bne/page.tsx
git commit -m feat-complete-senior-command-board-shell
```

---

## Self-Review

- Spec coverage: command bar, scorecard, benchmark band, display cards, and side table are covered.
- Public interfaces: `AircraftCardContent` is shared with future desktop workflow and wallboard wrappers.
- Handoff checks: `/senior/bne` renders from event read models and passes tests/build before PR 05.
