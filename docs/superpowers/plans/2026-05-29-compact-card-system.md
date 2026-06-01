# Compact Card System Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the senior BNE aircraft cards compact enough for three cards per row while preserving the wallboard's two-card carousel viewport.

**Architecture:** Keep read models and workflow handlers unchanged. Adjust the senior board grid and card presentation classes in place, then lightly tighten the passive wallboard card internals without changing carousel paging.

**Tech Stack:** Next.js, React, TypeScript, Tailwind CSS, Vitest, Testing Library, lucide-react.

---

## File Structure

- Modify: `components/senior/aircraft-board.tsx` for the senior-board grid column count.
- Modify: `components/senior/desktop-aircraft-card.tsx` for compact card spacing, hierarchy, and action grouping.
- Modify: `components/senior/data-quality-flag-action.tsx` for the compact header icon control.
- Modify: `components/wallboard/wallboard-aircraft-card.tsx` for light wallboard density improvements while preserving content.
- Modify: `components/senior/bne-command-board.test.tsx` to assert the three-column senior board contract.
- Modify: `components/senior/desktop-aircraft-card.test.tsx` to assert compact action grouping remains accessible.
- Run: targeted Vitest suites for senior card, command board, and wallboard.

### Task 1: Senior Board Grid Contract

**Files:**
- Modify: `components/senior/bne-command-board.test.tsx`
- Modify: `components/senior/aircraft-board.tsx`

- [ ] **Step 1: Write the failing layout contract test**

Add this assertion inside the existing `renders workflow-ready aircraft cards from the read model` test after the board is found:

```tsx
expect(board).toHaveClass("xl:grid-cols-3");
expect(board).not.toHaveClass("xl:grid-cols-2");
```

- [ ] **Step 2: Run the focused test and confirm it fails**

Run:

```bash
npm test -- components/senior/bne-command-board.test.tsx
```

Expected: failure because the board still has `xl:grid-cols-2`.

- [ ] **Step 3: Change the grid to three columns**

In `components/senior/aircraft-board.tsx`, change:

```tsx
className="grid gap-4 xl:grid-cols-2"
```

to:

```tsx
className="grid gap-3 xl:grid-cols-3"
```

- [ ] **Step 4: Re-run the focused test**

Run:

```bash
npm test -- components/senior/bne-command-board.test.tsx
```

Expected: pass.

### Task 2: Compact Senior Aircraft Card

**Files:**
- Modify: `components/senior/desktop-aircraft-card.tsx`
- Modify: `components/senior/data-quality-flag-action.tsx`
- Modify: `components/senior/desktop-aircraft-card.test.tsx`

- [ ] **Step 1: Strengthen the action grouping test**

In `components/senior/desktop-aircraft-card.test.tsx`, inside `places review and reason actions inside the current-reason block`, add:

```tsx
const actionRow = within(currentReasonBlock).getByRole("group", {
  name: "Reason actions for VH-8IA",
});

expect(within(actionRow).getByRole("button", { name: "Change reason" })).toBeVisible();
expect(within(actionRow).getByRole("button", { name: "Keep current reason for VH-8IA" })).toBeVisible();
expect(within(actionRow).getByRole("button", { name: "Open reason drawer for VH-8IA" })).toBeVisible();
```

- [ ] **Step 2: Run the senior card test and confirm it fails**

Run:

```bash
npm test -- components/senior/desktop-aircraft-card.test.tsx
```

Expected: failure because the reason actions row does not yet expose the named group.

- [ ] **Step 3: Tighten card shell, header, metrics, and detail spacing**

In `components/senior/desktop-aircraft-card.tsx`, update the top-level card classes from:

```tsx
"relative min-h-[260px] outline-none transition-shadow"
```

to:

```tsx
"relative min-h-[220px] outline-none transition-shadow"
```

Update the main card body from:

```tsx
<div className="flex h-full flex-col gap-4 p-4">
```

to:

```tsx
<div className="flex h-full flex-col gap-3 p-3">
```

Update the detail grid from:

```tsx
<div className="grid gap-3 border-t border-neutral-200 pt-3 sm:grid-cols-3">
```

to:

```tsx
<div className="grid gap-2 border-t border-neutral-200 pt-2 sm:grid-cols-[minmax(0,1.25fr)_minmax(4.5rem,0.75fr)_minmax(0,1fr)]">
```

- [ ] **Step 4: Tighten header and metric subcomponents**

In `AircraftCardHeader`, change the header wrapper to:

```tsx
<div className="flex items-start justify-between gap-2">
```

Change the tail text to:

```tsx
<p className="text-xl font-semibold leading-6 tracking-normal text-neutral-950">{aircraft.tail}</p>
```

Change the aircraft type/bay row to:

```tsx
<div className="mt-0.5 flex flex-wrap items-center gap-1.5 text-[11px] font-semibold text-neutral-500">
```

Change the action cluster to:

```tsx
<div className="flex max-w-[11rem] flex-wrap items-center justify-end gap-1.5">
```

In `AircraftMetricGrid`, change:

```tsx
<dl className="grid grid-cols-3 gap-2">
```

to:

```tsx
<dl className="grid grid-cols-3 gap-1.5">
```

In `AircraftMetric`, change the wrapper and text sizes to:

```tsx
<div className="rounded-product bg-neutral-50 p-2">
  <dt className="text-[11px] font-medium leading-4 text-neutral-500">{label}</dt>
  <dd className="mt-0.5 text-base font-semibold leading-5 text-neutral-950">{value}</dd>
</div>
```

- [ ] **Step 5: Add the named compact reason action row**

In `CurrentReasonGroup`, change the action row wrapper to:

```tsx
<div
  aria-label={`Reason actions for ${aircraft.tail}`}
  className="mt-2 flex flex-wrap items-center gap-1.5"
  role="group"
>
```

Add compact classes to the two icon buttons:

```tsx
className="size-8"
```

- [ ] **Step 6: Tighten the data-quality flag trigger**

In `components/senior/data-quality-flag-action.tsx`, add this class to the icon `Button`:

```tsx
className="size-8"
```

- [ ] **Step 7: Re-run senior card tests**

Run:

```bash
npm test -- components/senior/desktop-aircraft-card.test.tsx components/senior/bne-command-board.test.tsx
```

Expected: pass.

### Task 3: Wallboard Internal Density Without Carousel Change

**Files:**
- Modify: `components/wallboard/wallboard-aircraft-card.tsx`
- Test: `components/wallboard/wallboard.test.tsx`

- [ ] **Step 1: Preserve the existing carousel contract**

Do not change this constant in `components/wallboard/wallboard-aircraft-carousel.tsx`:

```tsx
const cardsPerPage = 2;
```

- [ ] **Step 2: Tighten wallboard card internals**

In `components/wallboard/wallboard-aircraft-card.tsx`, reduce shell padding and section spacing:

```tsx
className="flex min-h-0 flex-col rounded-product border border-neutral-200 bg-white p-4"
```

Change metric grid spacing to:

```tsx
<dl className="mt-4 grid grid-cols-3 gap-2">
```

Change the details wrapper to:

```tsx
<div className="mt-4 grid flex-1 gap-3 border-t border-neutral-200 pt-3 lg:grid-cols-2">
```

Reduce header tail and metadata sizes to:

```tsx
<p className="text-3xl font-semibold leading-9 tracking-normal text-neutral-950">{aircraft.tail}</p>
<div className="mt-1 flex flex-wrap items-center gap-2 text-base font-semibold text-neutral-500">
```

Reduce wallboard metric values to:

```tsx
<dt className="text-sm font-semibold text-neutral-500">{label}</dt>
<dd className="mt-1 text-xl font-semibold text-neutral-950">{value}</dd>
```

Reduce current reason/status values from `text-2xl`/`text-xl` to `text-xl`/`text-lg` where the data remains readable.

- [ ] **Step 3: Run the wallboard tests**

Run:

```bash
npm test -- components/wallboard/wallboard.test.tsx
```

Expected: pass, including the two-aircraft-per-page carousel test.

### Task 4: Verification

**Files:**
- Verify: `components/senior/aircraft-board.tsx`
- Verify: `components/senior/desktop-aircraft-card.tsx`
- Verify: `components/wallboard/wallboard-aircraft-card.tsx`

- [ ] **Step 1: Run the targeted component suite**

Run:

```bash
npm test -- components/senior/bne-command-board.test.tsx components/senior/desktop-aircraft-card.test.tsx components/wallboard/wallboard.test.tsx
```

Expected: pass.

- [ ] **Step 2: Optionally run the full suite**

Run:

```bash
npm test
```

Expected: pass.

- [ ] **Step 3: Inspect the live app on port 3000**

Open `http://localhost:3000/senior/bne` and confirm the senior board shows three compact aircraft cards per row with the ops rail visible. Open `http://localhost:3000/senior/bne/wallboard` and confirm the carousel still shows two aircraft cards per viewport.
