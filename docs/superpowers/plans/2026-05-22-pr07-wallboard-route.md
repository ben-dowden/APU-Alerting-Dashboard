# PR 07 Wallboard Route Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build `/senior/bne/wallboard` as a read-only fixed-frame TV display with amplified metrics, two-card carousel, page marker, and enlarged side index.

**Architecture:** Reuse BNE command-board read models and shared aircraft content. Wallboard components are wrappers that remove workflow actions and adjust layout/typography.

**Tech Stack:** Next.js, React client components for carousel/rotators, Tailwind, Vitest, Testing Library, Playwright or screenshot-capable route checks.

---

## File Structure

- Create: `components/wallboard/senior-wallboard-layout.tsx`, `wallboard-command-bar.tsx`, `wallboard-scorecard-band.tsx`, `wallboard-aircraft-carousel.tsx`, `wallboard-aircraft-card.tsx`, `wallboard-side-index.tsx`.
- Modify: `app/senior/bne/wallboard/page.tsx`.
- Create: `components/wallboard/wallboard.test.tsx`.

---

### Task 1: Add Wallboard Layout And Data Adapter

**Files:**
- Create: `components/wallboard/senior-wallboard-layout.tsx`
- Modify: `app/senior/bne/wallboard/page.tsx`

- [ ] **Step 1: Write smoke test**

Assert `/senior/bne/wallboard` renders `BNE Wallboard`, `APU on now`, and a side index region.

- [ ] **Step 2: Implement layout**

Use a fixed-height 16:9-friendly frame: command bar, scorecard/benchmark band, main region with carousel stage and fixed side index rail.

- [ ] **Step 3: Verify and commit**

Run:

```bash
npm run test -- components/wallboard/wallboard.test.tsx
git add app/senior/bne/wallboard/page.tsx components/wallboard
git commit -m feat-add-wallboard-layout-shell
```

---

### Task 2: Add Wallboard Command Bar And Scorecard

**Files:**
- Create: `components/wallboard/wallboard-command-bar.tsx`
- Create: `components/wallboard/wallboard-scorecard-band.tsx`

- [ ] **Step 1: Add tests**

Assert wallboard command bar excludes scenario selector, manual refresh, admin nav, reason controls, and benchmark controls. Assert scorecard metrics use amplified labels and benchmark auto-rotation state exists.

- [ ] **Step 2: Implement components**

Render port, persona/view, temperature, time, feed/source freshness, and read-only mode badge. Scorecard keeps four metrics visible and benchmark changes in place every 5 seconds.

- [ ] **Step 3: Verify and commit**

Run:

```bash
npm run test -- components/wallboard/wallboard.test.tsx
git add components/wallboard
git commit -m feat-add-wallboard-command-scorecard
```

---

### Task 3: Add Passive Wallboard Aircraft Cards

**Files:**
- Create: `components/wallboard/wallboard-aircraft-card.tsx`
- Update tests.

- [ ] **Step 1: Add tests**

Assert cards show tail, equipment, bay, APU state, runtime, ground time, fuel kg, ground support, closest tail, current reason, review state, and source charms. Assert no buttons for reason, manual-off, data issue, drawer, QR, or deep links exist.

- [ ] **Step 2: Implement passive card**

Reuse `AircraftCardContent` where practical. Increase typography and spacing through wrapper classes, not viewport-width font scaling.

- [ ] **Step 3: Verify and commit**

Run:

```bash
npm run test -- components/wallboard/wallboard.test.tsx
git add components/wallboard/wallboard-aircraft-card.tsx components/wallboard/wallboard.test.tsx
git commit -m feat-add-passive-wallboard-aircraft-card
```

---

### Task 4: Add Carousel And Page Marker

**Files:**
- Create: `components/wallboard/wallboard-aircraft-carousel.tsx`
- Update tests.

- [ ] **Step 1: Add tests**

Assert two cards per page, page marker text `[1 of N]` when more than one page, no marker when one page, and urgency changes do not interrupt the current interval.

- [ ] **Step 2: Implement carousel**

Use a client component with a 10-second interval and 180-220ms fade or short slide. Current page should stay steady until interval completes.

- [ ] **Step 3: Verify and commit**

Run:

```bash
npm run test -- components/wallboard/wallboard.test.tsx
git add components/wallboard/wallboard-aircraft-carousel.tsx components/wallboard/wallboard.test.tsx
git commit -m feat-add-wallboard-aircraft-carousel
```

---

### Task 5: Add Enlarged Side Index And Visual Checks

**Files:**
- Create: `components/wallboard/wallboard-side-index.tsx`
- Update: `components/wallboard/senior-wallboard-layout.tsx`

- [ ] **Step 1: Add tests**

Assert side index lists all BNE ground aircraft, includes red `On` and green `Off` chips, shows reason signal, is sorted by shared urgency rank, and shows subtle urgency cue on changed rows.

- [ ] **Step 2: Implement side index**

Use enlarged row height and text. Keep it passive; no focus/scroll buttons.

- [ ] **Step 3: Full verification**

Run:

```bash
npm run test
npm run build
```

Expected: PASS.

- [ ] **Step 4: Commit**

Run:

```bash
git add components/wallboard app/senior/bne/wallboard/page.tsx
git commit -m feat-complete-read-only-wallboard-route
```

---

## Self-Review

- Spec coverage: fixed frame, scorecard amplification, passive cards, carousel, page marker, side index, and no workflow controls are covered.
- Public interfaces: wallboard consumes same BNE board read model as `/senior/bne`.
- Handoff checks: tests/build pass and wallboard route is visually readable at 16:9.
