# Fixed Aircraft Card Anatomy Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild the senior-board aircraft card as a fixed-height, shadcn-styled operational card with clear status, metrics, context, and action zones.

**Architecture:** Keep read models and workflow behavior unchanged. Add small domain UI components for APU state, source quality, and compact nearby context, then compose them inside `DesktopAircraftCard` with a 260px fixed-height layout and a bottom action rail.

**Tech Stack:** Next.js, React, TypeScript, Tailwind CSS, local shadcn-style `Card`/`Badge`/`Button` primitives, lucide-react, Vitest, Testing Library.

---

## File Structure

- Create: `components/senior/apu-status-badge.tsx` for the local domain status badge with LED treatment.
- Create: `components/senior/apu-status-badge.test.tsx` for the three APU state variants.
- Modify: `components/senior/source-quality-charm.tsx` to render one strongest exception chip instead of multiple markers.
- Modify: `components/senior/source-quality-charm.test.tsx` to assert single-chip priority and no-issue rendering.
- Modify: `components/senior/manual-apu-off-action.tsx` to make Mark APU off a ghost icon-only action and remove pending-status badge behavior from this action component.
- Modify: `components/senior/manual-apu-off-action.test.tsx` for icon-only/manual-off behavior and pending absence.
- Modify: `components/senior/proximity-hover-card.tsx` to render compact Nearby Tail context while preserving hover/focus detail.
- Modify: `components/senior/desktop-aircraft-card.tsx` to implement the 260px fixed card anatomy and bottom action rail.
- Modify: `components/senior/desktop-aircraft-card.test.tsx` to assert the new anatomy.
- Modify: `components/senior/bne-command-board.test.tsx` to keep the three-column board contract and assert the visible review section is gone from cards.
- Run: targeted Vitest suites, full Vitest suite, and browser verification against `http://localhost:3000/senior/bne`.

### Task 1: Local APU Status Badge

**Files:**
- Create: `components/senior/apu-status-badge.tsx`
- Create: `components/senior/apu-status-badge.test.tsx`

- [ ] **Step 1: Write the failing APU status badge tests**

Create `components/senior/apu-status-badge.test.tsx`:

```tsx
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { ApuStatusBadge } from "./apu-status-badge";

describe("ApuStatusBadge", () => {
  it("renders urgent pulsing red treatment for APU on", () => {
    render(<ApuStatusBadge state="on" />);

    const badge = screen.getByRole("status", { name: "APU On" });
    const led = screen.getByRole("img", { name: "APU on active" });

    expect(badge).toHaveTextContent("APU On");
    expect(badge).toHaveClass("border-virgin-red/40", "text-virgin-red");
    expect(led).toHaveClass("bg-virgin-red", "motion-safe:animate-pulse");
  });

  it("renders pulsing amber treatment for pending manual off confirmation", () => {
    render(<ApuStatusBadge state="pending" />);

    const badge = screen.getByRole("status", { name: "Pending off" });
    const led = screen.getByRole("img", { name: "APU off confirmation pending" });

    expect(badge).toHaveTextContent("Pending off");
    expect(badge).toHaveClass("border-amber-400/50", "text-amber-700");
    expect(led).toHaveClass("bg-amber-500", "motion-safe:animate-pulse");
  });

  it("renders solid green treatment for APU off", () => {
    render(<ApuStatusBadge state="off" />);

    const badge = screen.getByRole("status", { name: "APU Off" });
    const led = screen.getByRole("img", { name: "APU off" });

    expect(badge).toHaveTextContent("APU Off");
    expect(badge).toHaveClass("border-green-500/40", "text-green-700");
    expect(led).toHaveClass("bg-green-600");
    expect(led).not.toHaveClass("motion-safe:animate-pulse");
  });
});
```

- [ ] **Step 2: Run the badge test and confirm it fails**

Run:

```bash
npm test -- components/senior/apu-status-badge.test.tsx
```

Expected: FAIL because `components/senior/apu-status-badge.tsx` does not exist.

- [ ] **Step 3: Implement the APU status badge**

Create `components/senior/apu-status-badge.tsx`:

```tsx
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils/cn";

export type ApuStatusBadgeState = "on" | "pending" | "off";

type ApuStatusBadgeProps = {
  state: ApuStatusBadgeState;
};

const statusCopy: Record<
  ApuStatusBadgeState,
  { label: string; ledLabel: string; badgeClass: string; ledClass: string }
> = {
  on: {
    label: "APU On",
    ledLabel: "APU on active",
    badgeClass: "border-virgin-red/40 bg-white text-virgin-red",
    ledClass: "bg-virgin-red shadow-[0_0_0_3px_rgba(225,10,10,0.12)] motion-safe:animate-pulse",
  },
  pending: {
    label: "Pending off",
    ledLabel: "APU off confirmation pending",
    badgeClass: "border-amber-400/50 bg-white text-amber-700",
    ledClass: "bg-amber-500 shadow-[0_0_0_3px_rgba(245,158,11,0.14)] motion-safe:animate-pulse",
  },
  off: {
    label: "APU Off",
    ledLabel: "APU off",
    badgeClass: "border-green-500/40 bg-white text-green-700",
    ledClass: "bg-green-600 shadow-[0_0_0_3px_rgba(22,163,74,0.12)]",
  },
};

export function ApuStatusBadge({ state }: ApuStatusBadgeProps) {
  const copy = statusCopy[state];

  return (
    <Badge
      aria-label={copy.label}
      className={cn("gap-1.5 px-2 py-0.5 text-xs font-semibold", copy.badgeClass)}
      role="status"
      variant="outline"
    >
      <span
        aria-label={copy.ledLabel}
        className={cn("inline-block size-2 shrink-0 rounded-full", copy.ledClass)}
        role="img"
      />
      {copy.label}
    </Badge>
  );
}
```

- [ ] **Step 4: Re-run the badge test**

Run:

```bash
npm test -- components/senior/apu-status-badge.test.tsx
```

Expected: PASS.

- [ ] **Step 5: Commit the badge component**

Run:

```bash
git add components/senior/apu-status-badge.tsx components/senior/apu-status-badge.test.tsx
git commit -m Add-APU-status-badge
```

Expected: commit succeeds with only the new badge files staged.

### Task 2: Single Source Quality Chip

**Files:**
- Modify: `components/senior/source-quality-charm.tsx`
- Modify: `components/senior/source-quality-charm.test.tsx`

- [ ] **Step 1: Replace source quality tests with single-chip behavior**

Replace `components/senior/source-quality-charm.test.tsx` with:

```tsx
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import type { SourceCharm } from "@/lib/read-models";
import { SourceQualityCharm } from "./source-quality-charm";

const sourceCharm = (overrides: Partial<SourceCharm>): SourceCharm => ({
  sourceSystem: "AODB",
  sourceEventId: "source:event:1",
  confidence: "high",
  receivedAt: "2026-05-22T08:50:00.000Z",
  ...overrides,
});

describe("SourceQualityCharm", () => {
  it("renders only the strongest source issue as a compact chip", () => {
    render(
      <SourceQualityCharm
        sourceCharms={[
          sourceCharm({ sourceSystem: "AODB", isStale: true, sourceLatencyMinutes: 24 }),
          sourceCharm({ sourceSystem: "ACMS", confidence: "low" }),
          sourceCharm({ sourceSystem: "AODB", qualityFlags: ["conflicting"] }),
        ]}
      />,
    );

    const chip = screen.getByLabelText("Source issue: Conflict");

    expect(chip).toBeVisible();
    expect(chip).toHaveTextContent("Conflict");
    expect(chip).toHaveClass("border-virgin-red/30", "text-virgin-red");
    expect(chip).toHaveAttribute("title", expect.stringContaining("Conflict"));
    expect(chip).toHaveAttribute("title", expect.stringContaining("Stale"));
    expect(chip).toHaveAttribute("title", expect.stringContaining("Low confidence"));
    expect(screen.queryByText("Stale")).not.toBeInTheDocument();
    expect(screen.queryByText("Low")).not.toBeInTheDocument();
  });

  it("renders amber treatment for stale or low-confidence source issues", () => {
    render(
      <SourceQualityCharm
        sourceCharms={[
          sourceCharm({ sourceSystem: "AODB", isStale: true, sourceLatencyMinutes: 24 }),
          sourceCharm({ sourceSystem: "ACMS", confidence: "low" }),
        ]}
      />,
    );

    const chip = screen.getByLabelText("Source issue: Stale");

    expect(chip).toHaveTextContent("Stale");
    expect(chip).toHaveClass("border-amber-300", "text-amber-800");
    expect(chip).toHaveAttribute("title", expect.stringContaining("Low confidence"));
  });

  it("renders nothing when no visible source issue exists", () => {
    render(
      <SourceQualityCharm
        sourceCharms={[
          sourceCharm({ sourceSystem: "AODB" }),
          sourceCharm({ sourceSystem: "FUEL_ASSUMPTIONS", qualityFlags: ["fallback_assumption"] }),
        ]}
      />,
    );

    expect(screen.queryByLabelText(/Source issue:/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/fallback/i)).not.toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run the source quality test and confirm it fails**

Run:

```bash
npm test -- components/senior/source-quality-charm.test.tsx
```

Expected: FAIL because the current component renders multiple badges and uses the old labels.

- [ ] **Step 3: Implement the single-chip source quality component**

Replace `components/senior/source-quality-charm.tsx` with:

```tsx
import type { SourceCharm, SourceQualityFlag } from "@/lib/read-models";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils/cn";

type SourceQualityCharmProps = {
  sourceCharms: SourceCharm[];
};

type VisibleSourceQualityFlag = Exclude<SourceQualityFlag, "fallback_assumption">;

const flagLabels: Record<
  VisibleSourceQualityFlag,
  { label: string; accessibleLabel: string; severity: "critical" | "warning"; rank: number }
> = {
  conflicting: {
    label: "Conflict",
    accessibleLabel: "Conflict",
    severity: "critical",
    rank: 1,
  },
  stale: {
    label: "Stale",
    accessibleLabel: "Stale",
    severity: "warning",
    rank: 2,
  },
  low_confidence: {
    label: "Low confidence",
    accessibleLabel: "Low confidence",
    severity: "warning",
    rank: 3,
  },
  unknown: {
    label: "Unknown",
    accessibleLabel: "Unknown",
    severity: "warning",
    rank: 4,
  },
};

const visibleFlag = (flag: SourceQualityFlag): flag is VisibleSourceQualityFlag =>
  flag !== "fallback_assumption";

const flagsForCharm = (source: SourceCharm) => {
  const flags = new Set<SourceQualityFlag>(source.qualityFlags ?? []);

  if (source.isStale) {
    flags.add("stale");
  }

  if (source.confidence === "low") {
    flags.add("low_confidence");
  }

  if (source.sourceSystem === "UNKNOWN") {
    flags.add("unknown");
  }

  return [...flags].filter(visibleFlag);
};

const titleFor = (markers: Array<{ flag: VisibleSourceQualityFlag; source: SourceCharm }>) =>
  markers
    .map(({ flag, source }) => {
      const latency = source.sourceLatencyMinutes ? `, ${source.sourceLatencyMinutes}m latency` : "";
      return `${flagLabels[flag].accessibleLabel}: ${source.sourceSystem} received ${source.receivedAt}${latency}`;
    })
    .join(" | ");

export function SourceQualityCharm({ sourceCharms }: SourceQualityCharmProps) {
  const markers = sourceCharms.flatMap((source) =>
    flagsForCharm(source).map((flag) => ({
      flag,
      source,
    })),
  );
  const strongest = markers.sort(
    (left, right) => flagLabels[left.flag].rank - flagLabels[right.flag].rank,
  )[0];

  if (!strongest) {
    return null;
  }

  const label = flagLabels[strongest.flag];

  return (
    <Badge
      aria-label={`Source issue: ${label.accessibleLabel}`}
      className={cn(
        "px-1.5 py-0 text-[10px] font-semibold leading-4",
        label.severity === "critical"
          ? "border-virgin-red/30 bg-virgin-red/5 text-virgin-red"
          : "border-amber-300 bg-amber-50 text-amber-800",
      )}
      title={titleFor(markers)}
      variant="outline"
    >
      {label.label}
    </Badge>
  );
}
```

- [ ] **Step 4: Re-run the source quality test**

Run:

```bash
npm test -- components/senior/source-quality-charm.test.tsx
```

Expected: PASS.

- [ ] **Step 5: Commit the source chip change**

Run:

```bash
git add components/senior/source-quality-charm.tsx components/senior/source-quality-charm.test.tsx
git commit -m Use-single-source-quality-chip
```

Expected: commit succeeds with only the source quality component and test staged.

### Task 3: Ghost Icon Manual APU-Off Action

**Files:**
- Modify: `components/senior/manual-apu-off-action.tsx`
- Modify: `components/senior/manual-apu-off-action.test.tsx`

- [ ] **Step 1: Update manual APU-off action tests**

Replace `components/senior/manual-apu-off-action.test.tsx` with:

```tsx
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { ManualApuOffAction } from "./manual-apu-off-action";

describe("ManualApuOffAction", () => {
  it("creates a ghost icon-only mark-off action when confirmation is not pending", () => {
    const onMarkOff = vi.fn();

    render(<ManualApuOffAction isPending={false} onMarkOff={onMarkOff} tail="VH-8IA" />);

    const button = screen.getByRole("button", { name: "Manually mark APU off for VH-8IA" });

    expect(button).toHaveAttribute("title", "Manually mark APU off");
    expect(button).toHaveClass("text-virgin-red");
    expect(button).toHaveClass("hover:bg-neutral-100");
    expect(button).toHaveTextContent("");

    fireEvent.click(button);

    expect(onMarkOff).toHaveBeenCalledOnce();
  });

  it("renders no action while source confirmation is outstanding", () => {
    render(<ManualApuOffAction isPending={true} onMarkOff={vi.fn()} tail="VH-8IA" />);

    expect(
      screen.queryByRole("button", { name: "Manually mark APU off for VH-8IA" }),
    ).not.toBeInTheDocument();
    expect(screen.queryByText("Pending off")).not.toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run the manual action test and confirm it fails**

Run:

```bash
npm test -- components/senior/manual-apu-off-action.test.tsx
```

Expected: FAIL because the action still renders a text button and pending badge.

- [ ] **Step 3: Implement the ghost icon-only manual action**

Replace `components/senior/manual-apu-off-action.tsx` with:

```tsx
import { Power } from "lucide-react";

import { Button } from "@/components/ui/button";

type ManualApuOffActionProps = {
  tail: string;
  isPending: boolean;
  onMarkOff: () => void;
};

export function ManualApuOffAction({ tail, isPending, onMarkOff }: ManualApuOffActionProps) {
  if (isPending) {
    return null;
  }

  return (
    <Button
      aria-label={`Manually mark APU off for ${tail}`}
      className="size-8 text-virgin-red"
      onClick={onMarkOff}
      size="icon"
      title="Manually mark APU off"
      type="button"
      variant="ghost"
    >
      <Power data-icon="inline-start" />
    </Button>
  );
}
```

- [ ] **Step 4: Re-run manual action tests**

Run:

```bash
npm test -- components/senior/manual-apu-off-action.test.tsx
```

Expected: PASS.

- [ ] **Step 5: Commit the manual action change**

Run:

```bash
git add components/senior/manual-apu-off-action.tsx components/senior/manual-apu-off-action.test.tsx
git commit -m Make-manual-APU-off-an-icon-action
```

Expected: commit succeeds with only the manual action files staged.

### Task 4: Compact Nearby Tail Context

**Files:**
- Modify: `components/senior/proximity-hover-card.tsx`
- Modify: `components/senior/desktop-aircraft-card.test.tsx`

- [ ] **Step 1: Add compact nearby expectations to the card test**

In `components/senior/desktop-aircraft-card.test.tsx`, inside `places review and reason actions inside the current-reason block`, add these assertions after the action assertions:

```tsx
expect(screen.getByText("Nearby Tail")).toBeVisible();
expect(screen.getByText("VH-YFX")).toBeVisible();
expect(screen.getByText("33m")).toBeVisible();
expect(screen.queryByText(/Closest tail:/)).not.toBeInTheDocument();
```

- [ ] **Step 2: Run the card test and confirm it fails**

Run:

```bash
npm test -- components/senior/desktop-aircraft-card.test.tsx
```

Expected: FAIL because nearby still renders `Closest tail: VH-YFX · 33m`.

- [ ] **Step 3: Implement compact nearby display with existing hover detail**

Replace `components/senior/proximity-hover-card.tsx` with:

```tsx
import type { AircraftProximityContext } from "@/lib/domain/proximity";
import { Badge } from "@/components/ui/badge";

type ProximityHoverCardProps = {
  tail: string;
  proximity: AircraftProximityContext;
};

const formatDistance = (distanceMeters: number) => `${distanceMeters}m`;

export function ProximityHoverCard({ tail, proximity }: ProximityHoverCardProps) {
  const closest = proximity.closestAircraft;

  if (!closest) {
    return (
      <div className="text-right">
        <p className="text-[10px] font-semibold uppercase tracking-normal text-neutral-500">
          Nearby Tail
        </p>
        <p className="mt-1 text-xs font-semibold text-neutral-600">No stand context</p>
      </div>
    );
  }

  return (
    <div className="group relative text-right">
      <p className="text-[10px] font-semibold uppercase tracking-normal text-neutral-500">
        Nearby Tail
      </p>
      <button
        aria-describedby={`proximity-details-${tail}`}
        aria-label={`Nearby aircraft for ${tail}`}
        className="mt-1 inline-flex items-center justify-end gap-1.5 text-xs font-semibold text-neutral-950 outline-none focus-visible:ring-2 focus-visible:ring-virgin-purple"
        type="button"
      >
        <span>{closest.tail}</span>
        <Badge className="px-1.5 py-0 text-[11px] leading-4 tabular-nums" variant="secondary">
          {formatDistance(closest.distanceMeters)}
        </Badge>
      </button>
      <div
        className="pointer-events-none absolute right-0 top-full z-20 mt-2 min-w-[220px] rounded-product border border-neutral-200 bg-white p-3 text-left text-xs text-neutral-700 opacity-0 shadow-lg transition-opacity group-focus-within:opacity-100 group-hover:opacity-100"
        id={`proximity-details-${tail}`}
        role="tooltip"
      >
        <p className="font-semibold text-neutral-950">Nearby APU on</p>
        <p className="mt-1 text-neutral-600">
          Closest tail: {closest.tail}, {closest.bay ?? closest.stand} ·{" "}
          {formatDistance(closest.distanceMeters)}
        </p>
        {proximity.nearbyApuAircraft.length > 0 ? (
          <ul className="mt-2 grid gap-1">
            {proximity.nearbyApuAircraft.map((aircraft) => (
              <li className="flex items-center justify-between gap-3" key={aircraft.tail}>
                <span>{aircraft.tail}</span>
                <span className="text-neutral-500">
                  {aircraft.bay ?? aircraft.stand} · {formatDistance(aircraft.distanceMeters)}
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-2 text-neutral-500">No APU-running aircraft within 100m</p>
        )}
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Re-run the card test**

Run:

```bash
npm test -- components/senior/desktop-aircraft-card.test.tsx
```

Expected: PASS.

- [ ] **Step 5: Commit compact nearby context**

Run:

```bash
git add components/senior/proximity-hover-card.tsx components/senior/desktop-aircraft-card.test.tsx
git commit -m Compact-nearby-tail-context
```

Expected: commit succeeds with only nearby/card-test changes staged.

### Task 5: Fixed Card Anatomy And Action Rail

**Files:**
- Modify: `components/senior/desktop-aircraft-card.tsx`
- Modify: `components/senior/desktop-aircraft-card.test.tsx`
- Modify: `components/senior/bne-command-board.test.tsx`

- [ ] **Step 1: Update the desktop card anatomy test**

In `components/senior/desktop-aircraft-card.test.tsx`, update `places review and reason actions inside the current-reason block` so it asserts the new anatomy:

```tsx
const card = screen.getByRole("article", { name: "VH-8IA aircraft card" });
const statusRow = within(card).getByRole("group", { name: "VH-8IA status" });
const metricRow = within(card).getByRole("group", { name: "VH-8IA metrics" });
const contextStack = within(card).getByRole("group", { name: "VH-8IA context" });
const actionRail = within(card).getByRole("group", { name: "VH-8IA actions" });
const currentReasonBlock = within(contextStack).getByRole("group", {
  name: "Current reason for VH-8IA",
});
const reasonActions = within(actionRail).getByRole("group", {
  name: "Reason actions for VH-8IA",
});
const utilityActions = within(actionRail).getByRole("group", {
  name: "Utility actions for VH-8IA",
});

expect(card).toHaveClass("h-[260px]");
expect(within(statusRow).getByText("VH-8IA")).toHaveClass("text-lg", "font-semibold");
expect(within(statusRow).getByRole("status", { name: "APU On" })).toBeVisible();
expect(within(metricRow).getByText("Est. Fuel Burn")).toBeVisible();
expect(within(metricRow).getByText("85.9 kg")).toHaveClass("text-base", "font-semibold", "tabular-nums");
expect(within(currentReasonBlock).getByText("Cleaning in progress")).toBeVisible();
expect(within(currentReasonBlock).getByText("00:35")).toHaveClass("tabular-nums");
expect(within(contextStack).queryByText("Review")).not.toBeInTheDocument();
expect(within(reasonActions).getByRole("button", { name: "Change reason" })).toHaveClass("border-neutral-300");
expect(
  within(reasonActions).getByRole("button", { name: "Keep current reason for VH-8IA" }),
).toHaveClass("text-neutral-800");
expect(
  within(utilityActions).getByRole("button", { name: "Manually mark APU off for VH-8IA" }),
).toHaveClass("text-virgin-red");
expect(
  within(utilityActions).getByRole("button", { name: "Open reason drawer for VH-8IA" }),
).toHaveClass("text-neutral-800");
expect(
  within(utilityActions).getByRole("button", { name: "Flag data quality for VH-8IA" }),
).toHaveClass("text-neutral-800");
```

- [ ] **Step 2: Update the command-board card assertions**

In `components/senior/bne-command-board.test.tsx`, inside `renders workflow-ready aircraft cards from the read model`, change the visible review expectation:

```tsx
expect(within(card).queryByText("Review due")).not.toBeInTheDocument();
expect(
  within(card).getByRole("button", { name: "Keep current reason for VH-8IA" }),
).toBeVisible();
```

Keep the existing `xl:grid-cols-3` expectations.

- [ ] **Step 3: Run card and command-board tests and confirm failures**

Run:

```bash
npm test -- components/senior/desktop-aircraft-card.test.tsx components/senior/bne-command-board.test.tsx
```

Expected: FAIL because the card does not yet have status/metrics/context/action groups, local `ApuStatusBadge`, hidden review section, or final action rail.

- [ ] **Step 4: Implement the fixed card anatomy**

Update imports at the top of `components/senior/desktop-aircraft-card.tsx`:

```tsx
import { History, RefreshCw } from "lucide-react";
```

Add the local badge import:

```tsx
import { ApuStatusBadge, type ApuStatusBadgeState } from "./apu-status-badge";
```

Remove the old `apuStateLabel` and `reviewLabel` helpers, then add this helper near `formatDuration`:

```tsx
const apuBadgeState = (aircraft: AircraftCardReadModel): ApuStatusBadgeState => {
  if (aircraft.manualOffPending) {
    return "pending";
  }

  return aircraft.apuState;
};
```

Change the top-level `Card` class to fixed height:

```tsx
className={cn(
  "relative h-[260px] outline-none transition-shadow",
  isFocusHighlighted && "ring-2 ring-virgin-purple ring-offset-2",
)}
```

Change the card body to:

```tsx
<div className="flex h-full flex-col gap-2 p-3">
```

Replace the current header, metric, and detail placement inside `DesktopAircraftCard` with:

```tsx
<AircraftCardHeader
  aircraft={aircraft}
/>
<AircraftMetricGrid aircraft={aircraft} />

<div
  aria-label={`${aircraft.tail} context`}
  className="grid min-h-0 flex-1 grid-cols-[minmax(0,1fr)_minmax(5.5rem,auto)] gap-2 border-t border-neutral-200 pt-2"
  role="group"
>
  <CurrentReasonGroup
    aircraft={aircraft}
    currentReason={currentReason}
    groundAircraft={groundAircraft}
    reasonCaptureHandlers={reasonCaptureHandlers}
    taxonomy={taxonomy}
  />
  <NearbySummary aircraft={aircraft} />
</div>

<ActionRail
  aircraft={aircraft}
  currentReason={currentReason}
  groundAircraft={groundAircraft}
  manualOffControl={
    aircraft.apuState === "on" && groundAircraft.apuEvent ? (
      <ManualApuOffAction
        isPending={aircraft.manualOffPending}
        onMarkOff={() => onMarkManualApuOff(groundAircraft)}
        tail={aircraft.tail}
      />
    ) : null
  }
  onOpenDrawer={() => setIsDrawerOpen(true)}
  reasonCaptureHandlers={reasonCaptureHandlers}
  taxonomy={taxonomy}
  dataQualityFlagControl={
    <DataQualityFlagAction
      onCreateFlag={(input) => onCreateDataQualityFlag(groundAircraft, aircraft, input)}
      tail={aircraft.tail}
    />
  }
/>
```

Update `AircraftCardHeader` to remove action controls and render the new badge:

```tsx
function AircraftCardHeader({ aircraft }: { aircraft: AircraftCardReadModel }) {
  return (
    <div aria-label={`${aircraft.tail} status`} className="flex items-start justify-between gap-2" role="group">
      <div className="min-w-0">
        <div className="flex min-w-0 items-center gap-1.5">
          <p className="whitespace-nowrap text-lg font-semibold leading-6 tracking-normal text-neutral-950">
            {aircraft.tail}
          </p>
          <SourceQualityCharm sourceCharms={aircraft.sourceCharms} />
        </div>
        <div className="mt-0.5 flex flex-wrap items-center gap-1.5 text-xs font-medium text-neutral-500">
          {aircraft.aircraftType ? <span>{aircraft.aircraftType}</span> : null}
          {aircraft.bay ? <span>{aircraft.bay}</span> : null}
        </div>
      </div>
      <ApuStatusBadge state={apuBadgeState(aircraft)} />
    </div>
  );
}
```

Update `AircraftMetricGrid`:

```tsx
function AircraftMetricGrid({ aircraft }: { aircraft: AircraftCardReadModel }) {
  return (
    <dl aria-label={`${aircraft.tail} metrics`} className="grid grid-cols-3 gap-1.5" role="group">
      <AircraftMetric label="APU Runtime" value={formatDuration(aircraft.apuRuntimeMinutes)} />
      <AircraftMetric label="Ground Time" value={formatDuration(aircraft.groundMinutes)} />
      <AircraftMetric label="Est. Fuel Burn" value={`${aircraft.estimatedFuelKg} kg`} />
    </dl>
  );
}
```

Update `AircraftMetric`:

```tsx
function AircraftMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-product bg-neutral-50 p-2">
      <dt className="text-[11px] font-medium leading-4 text-neutral-500">{label}</dt>
      <dd className="mt-0.5 text-base font-semibold leading-5 tabular-nums text-neutral-950">
        {value}
      </dd>
    </div>
  );
}
```

Update `CurrentReasonGroup` to remove buttons and drawer dependency:

```tsx
type CurrentReasonGroupProps = {
  aircraft: AircraftCardReadModel;
  groundAircraft: GroundAircraftState;
  currentReason?: ReasonSegment;
  taxonomy: ReasonTaxonomySnapshot;
  reasonCaptureHandlers: ReasonCaptureHandlers;
};

function CurrentReasonGroup({ aircraft }: CurrentReasonGroupProps) {
  return (
    <div aria-label={`Current reason for ${aircraft.tail}`} className="min-w-0" role="group">
      <p className="text-[10px] font-semibold uppercase tracking-normal text-neutral-500">Reason</p>
      <CurrentReasonSummary aircraft={aircraft} />
    </div>
  );
}
```

Update `CurrentReasonSummary`:

```tsx
function CurrentReasonSummary({ aircraft }: { aircraft: AircraftCardReadModel }) {
  if (!aircraft.currentReason) {
    return <p className="mt-1 text-sm font-semibold text-neutral-600">Reason pending</p>;
  }

  return (
    <div className="mt-1 min-w-0">
      <div className="flex min-w-0 items-center gap-1.5">
        <p className="truncate text-sm font-semibold text-neutral-950">
          {aircraft.currentReason.categoryLabel}
        </p>
        <Badge
          className="shrink-0 px-1.5 py-0 text-[11px] leading-4 tabular-nums text-virgin-purple"
          variant="secondary"
        >
          {formatDuration(aircraft.currentReason.elapsedMinutes)}
        </Badge>
      </div>
      <p className="mt-0.5 truncate text-xs font-medium text-neutral-500">
        {aircraft.currentReason.detailLabel}
      </p>
    </div>
  );
}
```

Remove `ReviewSummary`.

Update `NearbySummary`:

```tsx
function NearbySummary({ aircraft }: { aircraft: AircraftCardReadModel }) {
  return (
    <div className="min-w-[5.5rem]">
      <ProximityHoverCard proximity={aircraft.proximity} tail={aircraft.tail} />
    </div>
  );
}
```

Add `ActionRail` below `NearbySummary`:

```tsx
type ActionRailProps = {
  aircraft: AircraftCardReadModel;
  groundAircraft: GroundAircraftState;
  currentReason?: ReasonSegment;
  taxonomy: ReasonTaxonomySnapshot;
  reasonCaptureHandlers: ReasonCaptureHandlers;
  manualOffControl: ReactNode;
  dataQualityFlagControl: ReactNode;
  onOpenDrawer: () => void;
};

function ActionRail({
  aircraft,
  groundAircraft,
  currentReason,
  taxonomy,
  reasonCaptureHandlers,
  manualOffControl,
  dataQualityFlagControl,
  onOpenDrawer,
}: ActionRailProps) {
  const canCaptureReason = aircraft.apuState === "on" && Boolean(groundAircraft.apuEvent);

  return (
    <div
      aria-label={`${aircraft.tail} actions`}
      className="mt-auto flex h-8 items-center justify-between gap-2"
      role="group"
    >
      <div
        aria-label={`Reason actions for ${aircraft.tail}`}
        className="flex min-w-0 basis-[63%] items-center gap-1.5"
        role="group"
      >
        {!aircraft.currentReason && canCaptureReason ? (
          <ReasonPicker
            mode="select"
            onSelect={(selection) => reasonCaptureHandlers.onSelectReason(groundAircraft, selection)}
            taxonomy={taxonomy}
          />
        ) : null}

        {currentReason ? (
          <ReasonPicker
            mode="change"
            onSelect={(selection) =>
              reasonCaptureHandlers.onChangeReason(groundAircraft, currentReason, selection)
            }
            taxonomy={taxonomy}
          />
        ) : null}

        {currentReason && aircraft.reviewState.isReviewDue && !aircraft.manualOffPending ? (
          <Button
            aria-label={`Keep current reason for ${aircraft.tail}`}
            className="size-8 text-neutral-800"
            onClick={() => reasonCaptureHandlers.onKeepCurrentReason(groundAircraft, currentReason)}
            size="icon"
            title="Keep current reason"
            type="button"
            variant="ghost"
          >
            <RefreshCw data-icon="inline-start" />
          </Button>
        ) : null}
      </div>

      <div
        aria-label={`Utility actions for ${aircraft.tail}`}
        className="flex shrink-0 items-center justify-end gap-1"
        role="group"
      >
        {manualOffControl}
        {groundAircraft.reasonChain.segments.length > 0 ? (
          <Button
            aria-label={`Open reason drawer for ${aircraft.tail}`}
            className="size-8 text-neutral-800"
            onClick={onOpenDrawer}
            size="icon"
            title="Reason chain"
            type="button"
            variant="ghost"
          >
            <History data-icon="inline-start" />
          </Button>
        ) : null}
        {dataQualityFlagControl}
      </div>
    </div>
  );
}
```

- [ ] **Step 5: Update data-quality flag icon styling**

In `components/senior/data-quality-flag-action.tsx`, ensure the trigger button has ghost icon treatment:

```tsx
<Button
  aria-label={`Flag data quality for ${tail}`}
  className="size-8 text-neutral-800"
  onClick={() => setIsOpen((current) => !current)}
  size="icon"
  title="Flag data quality"
  type="button"
  variant="ghost"
>
  <Flag data-icon="inline-start" />
</Button>
```

- [ ] **Step 6: Re-run senior card and command-board tests**

Run:

```bash
npm test -- components/senior/desktop-aircraft-card.test.tsx components/senior/bne-command-board.test.tsx
```

Expected: PASS.

- [ ] **Step 7: Commit the fixed card anatomy**

Run:

```bash
git add components/senior/desktop-aircraft-card.tsx components/senior/desktop-aircraft-card.test.tsx components/senior/bne-command-board.test.tsx components/senior/data-quality-flag-action.tsx
git commit -m Implement-fixed-aircraft-card-anatomy
```

Expected: commit succeeds with only the card anatomy files staged.

### Task 6: Integration Verification

**Files:**
- Verify: `components/senior/apu-status-badge.tsx`
- Verify: `components/senior/source-quality-charm.tsx`
- Verify: `components/senior/manual-apu-off-action.tsx`
- Verify: `components/senior/proximity-hover-card.tsx`
- Verify: `components/senior/desktop-aircraft-card.tsx`

- [ ] **Step 1: Run targeted senior UI tests**

Run:

```bash
npm test -- components/senior/apu-status-badge.test.tsx components/senior/source-quality-charm.test.tsx components/senior/manual-apu-off-action.test.tsx components/senior/desktop-aircraft-card.test.tsx components/senior/bne-command-board.test.tsx components/senior/data-quality-flag-action.test.tsx
```

Expected: PASS.

- [ ] **Step 2: Run wallboard tests to guard unaffected carousel behavior**

Run:

```bash
npm test -- components/wallboard/wallboard.test.tsx
```

Expected: PASS. The two-card carousel viewport stays unchanged.

- [ ] **Step 3: Run the full test suite**

Run:

```bash
npm test
```

Expected: PASS.

- [ ] **Step 4: Browser-check the live senior board**

Open `http://localhost:3000/senior/bne` on the running dev server and verify:

- First card row contains three cards while the right-side ops rail remains visible.
- Cards use equal 260px height.
- Status row shows tail/type/bay/source chip on the left and the LED APU badge on the right.
- Metric row shows `APU Runtime`, `Ground Time`, and `Est. Fuel Burn`.
- Review text is not visible as its own section.
- Nearby context shows `Nearby Tail`, closest tail, and distance badge.
- Action rail shows `Select/Change reason`, optional keep icon, Mark APU off icon, history icon, and flag icon in the approved order.

- [ ] **Step 5: Commit any visual polish from browser verification**

If browser verification exposes small spacing issues, make the smallest CSS-only adjustment, run:

```bash
npm test -- components/senior/desktop-aircraft-card.test.tsx components/senior/bne-command-board.test.tsx
```

Expected: PASS.

Then commit:

```bash
git add components/senior/desktop-aircraft-card.tsx components/senior/proximity-hover-card.tsx components/senior/source-quality-charm.tsx components/senior/apu-status-badge.tsx
git commit -m Polish-fixed-aircraft-card-spacing
```

Expected: commit succeeds only if visual polish was needed.
