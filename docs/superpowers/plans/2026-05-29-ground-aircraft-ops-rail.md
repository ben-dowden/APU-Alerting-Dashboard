# Ground Aircraft Ops Rail Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Convert the desktop and wallboard ground-aircraft side rail into a dense spreadsheet-style operations table with LED APU state indicators and desktop row-to-card focus behavior.

**Architecture:** Keep the existing command-board route structure: command bar, full-width scorecard/benchmark band, then a lower split workspace. Add one shared LED status component, refactor the desktop `GroundAircraftTable`, wire row activation through the board to focus aircraft cards, and convert the wallboard side index from list-card rows to the same ops-table language at larger scale.

**Tech Stack:** Next.js, React, TypeScript, Tailwind CSS, Testing Library, Vitest.

---

## Scope Check

This plan covers one UI subsystem: the ground-aircraft operations rail shared conceptually across desktop and wallboard. It does not change event contracts, ranking logic, card workflow actions, scorecard calculation, benchmark rotation, or HQ/Admin routes.

There are existing unrelated working-tree changes in this branch. Execution should stage and commit only the files listed in each task.

## File Structure

- Create: `components/senior/apu-status-led.tsx`
  - Shared visual component for APU `on`, `off`, and `pending` LED states.
- Create: `components/senior/apu-status-led.test.tsx`
  - Unit tests for LED labels, color classes, and motion-safe pulsing.
- Create: `components/senior/aircraft-card-focus.ts`
  - Small shared DOM id and highlight-duration helper for row-to-card focus.
- Modify: `components/senior/ground-aircraft-table.tsx`
  - Desktop dense ops rail, no badge, no focus column, optional row activation callback.
- Modify: `components/senior/bne-command-board.tsx`
  - Owns focused tail state and handles table row activation.
- Modify: `components/senior/aircraft-board.tsx`
  - Passes focused-tail state to each desktop aircraft card.
- Modify: `components/senior/desktop-aircraft-card.tsx`
  - Adds stable card id, focusability, and temporary highlight styling.
- Modify: `components/senior/bne-command-board.test.tsx`
  - Updates desktop table expectations and adds row activation coverage.
- Modify: `components/wallboard/wallboard-side-index.tsx`
  - Converts wallboard side index to table-style ops rail with LED state.
- Modify: `components/wallboard/wallboard.test.tsx`
  - Updates wallboard side-index expectations for table rows and LED status.

---

### Task 1: Shared APU Status LED

**Files:**
- Create: `components/senior/apu-status-led.test.tsx`
- Create: `components/senior/apu-status-led.tsx`

- [ ] **Step 1: Write the failing LED tests**

Create `components/senior/apu-status-led.test.tsx` with:

```tsx
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { ApuStatusLed } from "./apu-status-led";

describe("ApuStatusLed", () => {
  it("renders a pulsing red LED for active APU state", () => {
    render(<ApuStatusLed status="on" />);

    const led = screen.getByRole("img", { name: "APU on" });
    expect(led).toHaveAttribute("title", "APU on");
    expect(led).toHaveClass("bg-virgin-red");
    expect(led).toHaveClass("motion-safe:animate-pulse");
  });

  it("renders a steady green LED for off APU state", () => {
    render(<ApuStatusLed status="off" />);

    const led = screen.getByRole("img", { name: "APU off" });
    expect(led).toHaveAttribute("title", "APU off");
    expect(led).toHaveClass("bg-green-600");
    expect(led).not.toHaveClass("motion-safe:animate-pulse");
  });

  it("renders a steady amber LED for pending manual off confirmation", () => {
    render(<ApuStatusLed status="pending" />);

    const led = screen.getByRole("img", { name: "Pending manual off confirmation" });
    expect(led).toHaveAttribute("title", "Pending manual off confirmation");
    expect(led).toHaveClass("bg-amber-500");
    expect(led).not.toHaveClass("motion-safe:animate-pulse");
  });
});
```

- [ ] **Step 2: Run the LED tests to verify they fail**

Run:

```bash
npm run test -- components/senior/apu-status-led.test.tsx
```

Expected: FAIL because `components/senior/apu-status-led.tsx` does not exist.

- [ ] **Step 3: Implement the shared LED component**

Create `components/senior/apu-status-led.tsx` with:

```tsx
import { cn } from "@/lib/utils/cn";

export type ApuStatusLedState = "on" | "off" | "pending";

type ApuStatusLedProps = {
  status: ApuStatusLedState;
  size?: "desktop" | "wallboard";
};

const ledLabels: Record<ApuStatusLedState, string> = {
  on: "APU on",
  off: "APU off",
  pending: "Pending manual off confirmation",
};

const ledClasses: Record<ApuStatusLedState, string> = {
  on: "bg-virgin-red shadow-[0_0_0_3px_rgba(225,10,10,0.12)] motion-safe:animate-pulse",
  off: "bg-green-600 shadow-[0_0_0_3px_rgba(22,163,74,0.12)]",
  pending: "bg-amber-500 shadow-[0_0_0_3px_rgba(245,158,11,0.14)]",
};

const ledSizes: Record<NonNullable<ApuStatusLedProps["size"]>, string> = {
  desktop: "size-2.5",
  wallboard: "size-3.5",
};

export function ApuStatusLed({ status, size = "desktop" }: ApuStatusLedProps) {
  const label = ledLabels[status];

  return (
    <span
      aria-label={label}
      className={cn("inline-block shrink-0 rounded-full", ledSizes[size], ledClasses[status])}
      role="img"
      title={label}
    />
  );
}
```

- [ ] **Step 4: Run the LED tests to verify they pass**

Run:

```bash
npm run test -- components/senior/apu-status-led.test.tsx
```

Expected: PASS.

- [ ] **Step 5: Commit Task 1**

Run:

```bash
git add components/senior/apu-status-led.tsx components/senior/apu-status-led.test.tsx
git commit -m "feat: add apu status led"
```

Expected: a commit containing only the shared LED component and its tests.

---

### Task 2: Dense Desktop Ground Aircraft Table

**Files:**
- Modify: `components/senior/bne-command-board.test.tsx`
- Modify: `components/senior/ground-aircraft-table.tsx`

- [ ] **Step 1: Update the desktop table test for compact LED behavior**

In `components/senior/bne-command-board.test.tsx`, replace the existing `renders the ground aircraft side table` test with:

```tsx
  it("renders the dense ground aircraft ops table with LED APU state", () => {
    render(<BneCommandBoard />);

    const table = screen.getByRole("table", { name: "Ground aircraft ops table" });
    const rows = within(table).getAllByRole("row");
    expect(rows).toHaveLength(22);
    expect(within(rows[0]).queryByText("Focus")).not.toBeInTheDocument();

    const activeReasonRow = within(table).getByRole("row", {
      name: /Show VH-8IA aircraft card/,
    });
    expect(activeReasonRow).toHaveAttribute("data-focus-tail", "VH-8IA");
    expect(within(activeReasonRow).getByText("Bay 20")).toBeVisible();
    expect(within(activeReasonRow).getByRole("img", { name: "APU on" })).toHaveClass(
      "bg-virgin-red",
    );
    expect(within(activeReasonRow).queryByText("On")).not.toBeInTheDocument();
    expect(within(activeReasonRow).getByText("46 min")).toBeVisible();
    expect(within(activeReasonRow).getByText("55 min")).toBeVisible();
    expect(within(activeReasonRow).getByText("Cleaning in progress")).toBeVisible();
    expect(
      within(activeReasonRow).queryByRole("button", { name: "Focus VH-8IA" }),
    ).not.toBeInTheDocument();

    const missingReasonRow = within(table).getByRole("row", {
      name: /Show VH-VUK aircraft card/,
    });
    expect(within(missingReasonRow).getByText("Reason pending")).toBeVisible();

    const apuOffRow = within(table).getByRole("row", {
      name: /Show VH-YFX aircraft card/,
    });
    expect(within(apuOffRow).getByRole("img", { name: "APU off" })).toHaveClass("bg-green-600");
    expect(within(apuOffRow).getByText("APU off")).toBeVisible();
  });
```

- [ ] **Step 2: Run the desktop board test to verify it fails**

Run:

```bash
npm run test -- components/senior/bne-command-board.test.tsx
```

Expected: FAIL because the table still uses the old accessible name, `Badge` text, and `Focus` button column.

- [ ] **Step 3: Replace the desktop table implementation**

Replace the full contents of `components/senior/ground-aircraft-table.tsx` with:

```tsx
import type { KeyboardEvent } from "react";

import type { GroundAircraftState } from "@/lib/read-models";

import { ApuStatusLed, type ApuStatusLedState } from "./apu-status-led";

type GroundAircraftTableProps = {
  aircraft: GroundAircraftState[];
  onFocusTail?: (tail: string) => void;
};

const apuSignal = (aircraft: GroundAircraftState) => {
  if (aircraft.manualOffPending) {
    return "Pending off";
  }

  if (aircraft.apuState === "off") {
    return "APU off";
  }

  return aircraft.reasonChain.currentReason?.categoryLabel ?? "Reason pending";
};

const apuLedStatus = (aircraft: GroundAircraftState): ApuStatusLedState => {
  if (aircraft.manualOffPending) {
    return "pending";
  }

  return aircraft.apuState;
};

const handleRowKeyDown = (
  event: KeyboardEvent<HTMLTableRowElement>,
  tail: string,
  onFocusTail?: (tail: string) => void,
) => {
  if (event.key !== "Enter" && event.key !== " ") {
    return;
  }

  event.preventDefault();
  onFocusTail?.(tail);
};

export function GroundAircraftTable({ aircraft, onFocusTail }: GroundAircraftTableProps) {
  return (
    <section
      aria-label="Ground aircraft summary"
      className="xl:sticky xl:top-4 xl:self-start"
    >
      <div className="border border-neutral-200 bg-white">
        <div className="border-b border-neutral-200 px-3 py-2">
          <p className="text-xs font-semibold text-neutral-950">Ground aircraft</p>
          <p className="text-[11px] font-medium text-neutral-500">
            Current BNE APU and reason signal
          </p>
        </div>
        <div className="max-h-[640px] overflow-auto lg:max-h-[calc(100vh-18rem)]">
          <table
            aria-label="Ground aircraft ops table"
            className="w-full min-w-[360px] table-fixed text-left text-[12px]"
          >
            <thead className="sticky top-0 z-10 bg-white">
              <tr className="border-b border-neutral-200 text-[11px] font-semibold uppercase tracking-normal text-neutral-500">
                <th className="w-[72px] px-2 py-1.5">Tail</th>
                <th className="w-[64px] px-2 py-1.5">Bay</th>
                <th className="w-[34px] px-2 py-1.5 text-center">APU</th>
                <th className="w-[58px] px-2 py-1.5 text-right">Elapsed</th>
                <th className="w-[58px] px-2 py-1.5 text-right">Ground</th>
                <th className="px-2 py-1.5">Reason</th>
              </tr>
            </thead>
            <tbody>
              {aircraft.map((item) => (
                <tr
                  aria-label={`Show ${item.tail} aircraft card`}
                  className="h-7 cursor-pointer border-b border-neutral-100 text-neutral-800 outline-none transition-colors last:border-b-0 hover:bg-neutral-50 focus-visible:bg-neutral-50 focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-virgin-purple"
                  data-focus-tail={item.tail}
                  key={item.tail}
                  onClick={() => onFocusTail?.(item.tail)}
                  onKeyDown={(event) => handleRowKeyDown(event, item.tail, onFocusTail)}
                  tabIndex={0}
                >
                  <th
                    className="truncate px-2 py-1 text-[12px] font-semibold text-neutral-950"
                    scope="row"
                  >
                    {item.tail}
                  </th>
                  <td className="truncate px-2 py-1 text-neutral-700">{item.bay ?? "Unassigned"}</td>
                  <td className="px-2 py-1 text-center">
                    <ApuStatusLed status={apuLedStatus(item)} />
                  </td>
                  <td className="px-2 py-1 text-right font-medium tabular-nums text-neutral-800">
                    {item.apuRuntimeMinutes} min
                  </td>
                  <td className="px-2 py-1 text-right font-medium tabular-nums text-neutral-800">
                    {item.groundMinutes} min
                  </td>
                  <td className="truncate px-2 py-1 text-neutral-700">{apuSignal(item)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 4: Run the desktop board test to verify it passes**

Run:

```bash
npm run test -- components/senior/bne-command-board.test.tsx
```

Expected: PASS for the updated table rendering expectations. The row click focus behavior is not covered until Task 3.

- [ ] **Step 5: Commit Task 2**

Run:

```bash
git add components/senior/ground-aircraft-table.tsx components/senior/bne-command-board.test.tsx
git commit -m "feat: compact desktop ground aircraft table"
```

Expected: a commit containing only the desktop table rendering refactor and test update.

---

### Task 3: Desktop Row-To-Card Focus

**Files:**
- Create: `components/senior/aircraft-card-focus.ts`
- Modify: `components/senior/bne-command-board.test.tsx`
- Modify: `components/senior/bne-command-board.tsx`
- Modify: `components/senior/aircraft-board.tsx`
- Modify: `components/senior/desktop-aircraft-card.tsx`

- [ ] **Step 1: Add the row activation test**

In `components/senior/bne-command-board.test.tsx`, update the imports:

```tsx
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { within } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
```

Then add this setup inside the existing `beforeEach`:

```tsx
    Object.defineProperty(window.HTMLElement.prototype, "scrollIntoView", {
      configurable: true,
      value: vi.fn(),
    });
```

Add this test after the dense table test:

```tsx
  it("snaps to the matching aircraft card when an ops table row is activated", async () => {
    render(<BneCommandBoard />);

    const table = screen.getByRole("table", { name: "Ground aircraft ops table" });
    const row = within(table).getByRole("row", { name: /Show VH-8IA aircraft card/ });
    const card = screen.getByRole("article", { name: "VH-8IA aircraft card" });

    fireEvent.click(row);

    await waitFor(() => expect(card).toHaveFocus());
    expect(card).toHaveAttribute("data-focus-highlight", "true");
    expect(window.HTMLElement.prototype.scrollIntoView).toHaveBeenCalled();
  });
```

- [ ] **Step 2: Run the desktop board test to verify it fails**

Run:

```bash
npm run test -- components/senior/bne-command-board.test.tsx
```

Expected: FAIL because row activation is not wired to card focus or highlight state.

- [ ] **Step 3: Create the shared focus helper**

Create `components/senior/aircraft-card-focus.ts` with:

```ts
export const aircraftFocusHighlightMs = 1200;

export const aircraftCardDomId = (tail: string) => `aircraft-card-${tail}`;
```

- [ ] **Step 4: Wire focused tail state in the board**

In `components/senior/bne-command-board.tsx`, change the React import to:

```tsx
import { useEffect, useMemo, useRef, useState } from "react";
```

Add this import:

```tsx
import { aircraftCardDomId, aircraftFocusHighlightMs } from "./aircraft-card-focus";
```

Inside `BneCommandBoard`, after `const [workflowEvents, setWorkflowEvents] = useState<DomainEvent[]>([]);`, add:

```tsx
  const [focusedTail, setFocusedTail] = useState<string>();
  const focusTimeoutRef = useRef<number | undefined>(undefined);
```

Add this handler before the existing `return`:

```tsx
  const handleFocusTail = (tail: string) => {
    const cardElement = document.getElementById(aircraftCardDomId(tail));

    setFocusedTail(tail);
    cardElement?.scrollIntoView({ behavior: "smooth", block: "nearest" });
    cardElement?.focus({ preventScroll: true });

    if (focusTimeoutRef.current) {
      window.clearTimeout(focusTimeoutRef.current);
    }

    focusTimeoutRef.current = window.setTimeout(() => {
      setFocusedTail((currentTail) => (currentTail === tail ? undefined : currentTail));
      focusTimeoutRef.current = undefined;
    }, aircraftFocusHighlightMs);
  };
```

Add this cleanup effect below the existing workflow-event refresh effect:

```tsx
  useEffect(() => {
    return () => {
      if (focusTimeoutRef.current) {
        window.clearTimeout(focusTimeoutRef.current);
      }
    };
  }, []);
```

Update the `AircraftBoard` and `GroundAircraftTable` usage:

```tsx
          <AircraftBoard
            aircraft={aircraftCards}
            focusedTail={focusedTail}
            groundAircraft={board.groundAircraft}
            onAddReasonNote={handleAddReasonNote}
            onChangeReason={handleChangeReason}
            onCorrectReason={handleCorrectReason}
            onCreateDataQualityFlag={handleCreateDataQualityFlag}
            onKeepCurrentReason={handleKeepCurrentReason}
            onMarkManualApuOff={handleMarkManualApuOff}
            onSelectReason={handleSelectReason}
            taxonomy={boardSettings.reasonTaxonomy}
          />
          <GroundAircraftTable aircraft={prioritizedGroundAircraft} onFocusTail={handleFocusTail} />
```

- [ ] **Step 5: Pass focus state through the aircraft board**

In `components/senior/aircraft-board.tsx`, update the props type:

```tsx
type AircraftBoardProps = {
  aircraft: AircraftCardReadModel[];
  focusedTail?: string;
  groundAircraft: GroundAircraftState[];
  taxonomy: ReasonTaxonomySnapshot;
} & ReasonWorkflowHandlers;
```

Update the function parameters:

```tsx
export function AircraftBoard({
  aircraft,
  focusedTail,
  groundAircraft,
  taxonomy,
  onSelectReason,
  onChangeReason,
  onKeepCurrentReason,
  onAddReasonNote,
  onCorrectReason,
  onCreateDataQualityFlag,
  onMarkManualApuOff,
}: AircraftBoardProps) {
```

Pass the highlight prop into `DesktopAircraftCard`:

```tsx
          <DesktopAircraftCard
            aircraft={aircraftCard}
            groundAircraft={aircraftState}
            isFocusHighlighted={focusedTail === aircraftCard.tail}
            key={aircraftCard.tail}
            onAddReasonNote={onAddReasonNote}
            onChangeReason={onChangeReason}
            onCorrectReason={onCorrectReason}
            onCreateDataQualityFlag={onCreateDataQualityFlag}
            onKeepCurrentReason={onKeepCurrentReason}
            onMarkManualApuOff={onMarkManualApuOff}
            onSelectReason={onSelectReason}
            taxonomy={taxonomy}
          />
```

- [ ] **Step 6: Make desktop cards focusable and highlightable**

In `components/senior/desktop-aircraft-card.tsx`, add imports:

```tsx
import { cn } from "@/lib/utils/cn";
import { aircraftCardDomId } from "./aircraft-card-focus";
```

Update `DesktopAircraftCardProps`:

```tsx
type DesktopAircraftCardProps = {
  aircraft: AircraftCardReadModel;
  groundAircraft: GroundAircraftState;
  isFocusHighlighted?: boolean;
  taxonomy: ReasonTaxonomySnapshot;
} & ReasonWorkflowHandlers;
```

Update the function parameter list:

```tsx
export function DesktopAircraftCard({
  aircraft,
  groundAircraft,
  isFocusHighlighted = false,
  taxonomy,
  onSelectReason,
  onChangeReason,
  onKeepCurrentReason,
  onAddReasonNote,
  onCorrectReason,
  onCreateDataQualityFlag,
  onMarkManualApuOff,
}: DesktopAircraftCardProps) {
```

Replace the opening `<Card ...>` with:

```tsx
    <Card
      aria-label={`${aircraft.tail} aircraft card`}
      className={cn(
        "relative min-h-[260px] outline-none transition-shadow",
        isFocusHighlighted && "ring-2 ring-virgin-purple ring-offset-2",
      )}
      data-focus-highlight={isFocusHighlighted ? "true" : "false"}
      id={aircraftCardDomId(aircraft.tail)}
      role="article"
      tabIndex={-1}
    >
```

- [ ] **Step 7: Run the desktop board test to verify it passes**

Run:

```bash
npm run test -- components/senior/bne-command-board.test.tsx
```

Expected: PASS, including row click focus and highlight coverage.

- [ ] **Step 8: Commit Task 3**

Run:

```bash
git add components/senior/aircraft-card-focus.ts components/senior/bne-command-board.tsx components/senior/aircraft-board.tsx components/senior/desktop-aircraft-card.tsx components/senior/bne-command-board.test.tsx
git commit -m "feat: focus aircraft cards from ops table rows"
```

Expected: a commit containing only row activation, focus helper, card focusability, and tests.

---

### Task 4: Wallboard Ops Rail Table

**Files:**
- Modify: `components/wallboard/wallboard.test.tsx`
- Modify: `components/wallboard/wallboard-side-index.tsx`

- [ ] **Step 1: Update the wallboard side index test**

In `components/wallboard/wallboard.test.tsx`, replace the existing `renders an enlarged side index sorted by urgency with passive state cues` test with:

```tsx
  it("renders a wallboard-scale ops table sorted by urgency with passive LED state", () => {
    render(<SeniorBneWallboardPage />);

    const sideIndex = screen.getByRole("region", { name: "Wallboard side index" });
    const table = within(sideIndex).getByRole("table", { name: "Wallboard ground aircraft ops table" });
    const rows = within(table).getAllByRole("row");
    const bodyRows = rows.slice(1);
    const apuOffRow = bodyRows.find((row) => row.getAttribute("data-tail") === "VH-YFX");

    expect(bodyRows).toHaveLength(21);
    expect(bodyRows.map((row) => Number(row.getAttribute("data-urgency-rank")))).toEqual(
      Array.from({ length: 21 }, (_, index) => index + 1),
    );
    expect(bodyRows[0]).toHaveAttribute("data-urgency-rank", "1");
    expect(within(bodyRows[0]).getByRole("img", { name: "APU on" })).toHaveClass(
      "bg-virgin-red",
    );
    expect(within(bodyRows[0]).queryByText("On")).not.toBeInTheDocument();
    expect(apuOffRow).toBeDefined();
    expect(within(apuOffRow as HTMLElement).getByRole("img", { name: "APU off" })).toHaveClass(
      "bg-green-600",
    );
    expect(within(apuOffRow as HTMLElement).getByText("APU off")).toBeVisible();
    expect(within(bodyRows[0]).getByText(/Reason missing|Review due|Cleaning in progress/)).toBeVisible();
    expect(within(sideIndex).queryByRole("button")).not.toBeInTheDocument();
  });
```

- [ ] **Step 2: Run the wallboard tests to verify they fail**

Run:

```bash
npm run test -- components/wallboard/wallboard.test.tsx
```

Expected: FAIL because `WallboardSideIndex` still renders list items and badge text.

- [ ] **Step 3: Replace the wallboard side index with a table**

Replace the full contents of `components/wallboard/wallboard-side-index.tsx` with:

```tsx
import type { AircraftCardReadModel } from "@/lib/read-models";
import { ApuStatusLed, type ApuStatusLedState } from "@/components/senior/apu-status-led";

type WallboardSideIndexProps = {
  aircraft: AircraftCardReadModel[];
};

const apuSignal = (aircraft: AircraftCardReadModel) => {
  if (aircraft.manualOffPending) {
    return "Pending off";
  }

  if (aircraft.apuState === "off") {
    return "APU off";
  }

  return aircraft.currentReason?.categoryLabel ?? aircraft.statusLabel;
};

const apuLedStatus = (aircraft: AircraftCardReadModel): ApuStatusLedState => {
  if (aircraft.manualOffPending) {
    return "pending";
  }

  return aircraft.apuState;
};

export function WallboardSideIndex({ aircraft }: WallboardSideIndexProps) {
  return (
    <section
      aria-label="Wallboard side index"
      className="flex min-h-0 flex-col border border-neutral-200 bg-white"
    >
      <div className="border-b border-neutral-200 px-4 py-3">
        <p className="text-lg font-semibold tracking-normal">Ground aircraft</p>
        <p className="text-sm font-medium text-neutral-500">Current BNE APU and reason signal</p>
      </div>
      <div className="min-h-0 flex-1 overflow-auto">
        <table
          aria-label="Wallboard ground aircraft ops table"
          className="w-full table-fixed text-left text-sm"
        >
          <thead className="sticky top-0 z-10 bg-white">
            <tr className="border-b border-neutral-200 text-xs font-semibold uppercase tracking-normal text-neutral-500">
              <th className="w-[86px] px-3 py-2">Tail</th>
              <th className="w-[74px] px-3 py-2">Bay</th>
              <th className="w-[44px] px-3 py-2 text-center">APU</th>
              <th className="w-[74px] px-3 py-2 text-right">Elapsed</th>
              <th className="w-[74px] px-3 py-2 text-right">Ground</th>
              <th className="px-3 py-2">Reason</th>
            </tr>
          </thead>
          <tbody>
            {aircraft.map((item) => (
              <tr
                className="h-10 border-b border-neutral-100 last:border-b-0"
                data-tail={item.tail}
                data-urgency-rank={item.urgencyRank}
                key={item.tail}
              >
                <th
                  className="truncate px-3 py-2 text-sm font-semibold text-neutral-950"
                  scope="row"
                >
                  {item.tail}
                </th>
                <td className="truncate px-3 py-2 text-neutral-700">{item.bay ?? "Unassigned"}</td>
                <td className="px-3 py-2 text-center">
                  <ApuStatusLed size="wallboard" status={apuLedStatus(item)} />
                </td>
                <td className="px-3 py-2 text-right font-semibold tabular-nums text-neutral-900">
                  {item.apuRuntimeMinutes} min
                </td>
                <td className="px-3 py-2 text-right font-semibold tabular-nums text-neutral-900">
                  {item.groundMinutes} min
                </td>
                <td className="truncate px-3 py-2 font-medium text-neutral-700">
                  {apuSignal(item)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
```

- [ ] **Step 4: Run the wallboard tests to verify they pass**

Run:

```bash
npm run test -- components/wallboard/wallboard.test.tsx
```

Expected: PASS.

- [ ] **Step 5: Commit Task 4**

Run:

```bash
git add components/wallboard/wallboard-side-index.tsx components/wallboard/wallboard.test.tsx
git commit -m "feat: compact wallboard ground aircraft table"
```

Expected: a commit containing only the wallboard rail table conversion and tests.

---

### Task 5: Route-Level Regression And Visual Verification

**Files:**
- Modify only if a test or visual check reveals a defect in files changed by Tasks 1-4.

- [ ] **Step 1: Run focused component tests**

Run:

```bash
npm run test -- components/senior/apu-status-led.test.tsx components/senior/bne-command-board.test.tsx components/wallboard/wallboard.test.tsx
```

Expected: PASS.

- [ ] **Step 2: Run the full test suite**

Run:

```bash
npm run test
```

Expected: PASS for the full Vitest suite.

- [ ] **Step 3: Run the production build**

Run:

```bash
npm run build
```

Expected: PASS. If `.next` is locked by OneDrive or an existing dev server, stop the dev server or clear the ignored `.next` output, then rerun the build.

- [ ] **Step 4: Verify desktop route in the browser**

Run the app if it is not already running:

```bash
npm run dev
```

Open:

```text
http://127.0.0.1:3000/senior/bne
```

Expected desktop visual checks:

- Command bar remains at the top.
- Scorecard and benchmark band stretch across the full content width.
- Ground-aircraft rail starts below the scorecard band on the right of the aircraft cards.
- Table rows are visibly tighter than the previous `Ground aircraft` table.
- APU column shows LED dots, not `On` / `Off` badges.
- Red APU LEDs pulse subtly.
- Green APU-off LEDs are steady.
- No visible focus action column or `Focus {tail}` button appears.
- Clicking a row scrolls or snaps to the matching aircraft card and briefly highlights it.

- [ ] **Step 5: Verify wallboard route in the browser**

Open:

```text
http://127.0.0.1:3000/senior/bne/wallboard
```

Expected wallboard visual checks:

- Wallboard command bar remains at the top.
- Wallboard scorecard and benchmark band stretch across the full board width.
- The lower workspace splits into carousel on the left and ops rail on the right.
- The right rail uses table rows rather than large list-card rows.
- Wallboard rows are larger than desktop rows but still dense and column-scannable.
- APU column shows the same LED language as desktop.
- Rows are passive; clicking does not expose workflow actions or navigation buttons.

- [ ] **Step 6: Inspect the final diff**

Run:

```bash
git status --short
git diff --stat
```

Expected: only files from this plan are changed, plus any unrelated pre-existing branch changes that were already present before execution. Do not stage unrelated pre-existing changes.

- [ ] **Step 7: Commit final polish only if needed**

If Step 4 or Step 5 required visual polish, stage only the changed rail files and tests:

```bash
git add components/senior/apu-status-led.tsx components/senior/ground-aircraft-table.tsx components/senior/bne-command-board.tsx components/senior/aircraft-board.tsx components/senior/desktop-aircraft-card.tsx components/senior/bne-command-board.test.tsx components/wallboard/wallboard-side-index.tsx components/wallboard/wallboard.test.tsx
git commit -m "fix: polish ground aircraft ops rail"
```

Expected: commit created only when visual verification required an additional change.

---

## Self-Review

- Spec coverage: the plan keeps the scorecard full width, places the rail under the scorecard, makes the desktop table dense, converts badges to LED indicators, removes the focus button, adds desktop row-to-card focus, and mirrors the table language on the wallboard at larger scale.
- Non-goals: the plan does not alter event contracts, aircraft ranking, scorecard metrics, benchmark behavior, HQ/Admin routes, or card workflow actions.
- Type consistency: LED state uses `ApuStatusLedState = "on" | "off" | "pending"` and both desktop and wallboard map manual-off pending to `pending`.
- Accessibility: LEDs expose `role="img"`, `aria-label`, and `title`; desktop rows are keyboard-activatable and keep table row semantics.
- Verification: focused tests, full tests, production build, and browser checks are included.
