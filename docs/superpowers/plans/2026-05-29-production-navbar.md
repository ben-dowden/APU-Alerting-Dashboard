# Production Navbar Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the generic command and wallboard headers with compact production-style chrome for the Daily APU Fuel Burn surfaces.

**Architecture:** Keep the change inside the existing header components and their direct callers. The command board gets one client-side cog menu for all-area navigation, while the wallboard header becomes a passive display header with only the product name and live status chips.

**Tech Stack:** Next.js App Router, React 19, TypeScript, Tailwind CSS, lucide-react, Vitest, React Testing Library.

---

## File Structure

- Modify: `components/senior/bne-command-board.test.tsx`  
  Updates command header expectations and verifies the cog menu exposes all-area links after interaction.
- Modify: `components/senior/command-bar.tsx`  
  Replaces visible route shortcuts and persona labels with `Daily APU Fuel Burn - Command`, larger status chips, and an accessible cog dropdown.
- Modify: `components/senior/bne-command-board.tsx`  
  Stops passing the now-unused `port` prop into `CommandBar`.
- Modify: `components/wallboard/wallboard.test.tsx`  
  Updates wallboard header expectations and asserts `Read-only TV mode` is gone.
- Modify: `components/wallboard/wallboard-command-bar.tsx`  
  Replaces the prominent wallboard header with a compact title and larger live status chips.
- Modify: `components/wallboard/senior-wallboard-layout.tsx`  
  Stops passing the now-unused `port` prop into `WallboardCommandBar`.

## Task 1: Command Board Test Coverage

**Files:**
- Modify: `components/senior/bne-command-board.test.tsx`
- Test: `components/senior/bne-command-board.test.tsx`

- [ ] **Step 1: Replace the compact command bar test**

Replace the existing `it("renders the compact command bar", ...)` block with:

```tsx
  it("renders the production command bar with an area menu", () => {
    render(<BneCommandBoard />);

    const header = screen.getByRole("banner");

    expect(
      within(header).getByRole("heading", {
        name: "Daily APU Fuel Burn - Command",
        level: 1,
      }),
    ).toBeVisible();
    expect(within(header).queryByText("BNE")).not.toBeInTheDocument();
    expect(within(header).queryByText("Senior Engineer")).not.toBeInTheDocument();
    expect(within(header).getByText("24°C")).toBeVisible();
    expect(within(header).queryByText(/METAR/i)).not.toBeInTheDocument();
    expect(within(header).getByText(/Feed fresh/i)).toBeVisible();
    expect(within(header).getByText("18:55 AEST")).toBeVisible();
    expect(within(header).queryByRole("link", { name: "Wallboard" })).not.toBeInTheDocument();
    expect(within(header).queryByRole("link", { name: /HQ/i })).not.toBeInTheDocument();
    expect(within(header).queryByRole("link", { name: /Admin/i })).not.toBeInTheDocument();

    const areaMenuButton = within(header).getByRole("button", { name: "Open area menu" });
    expect(areaMenuButton).toHaveAttribute("aria-expanded", "false");

    fireEvent.click(areaMenuButton);

    expect(areaMenuButton).toHaveAttribute("aria-expanded", "true");
    const areaMenu = within(header).getByRole("navigation", { name: "Area menu" });
    expect(within(areaMenu).getByRole("link", { name: "Wallboard" })).toHaveAttribute(
      "href",
      "/senior/bne/wallboard",
    );
    expect(within(areaMenu).getByRole("link", { name: "HQ Monitoring" })).toHaveAttribute(
      "href",
      "/hq",
    );
    expect(within(areaMenu).getByRole("link", { name: "HQ Reports" })).toHaveAttribute(
      "href",
      "/hq/reports",
    );
    expect(within(areaMenu).getByRole("link", { name: "Data Quality" })).toHaveAttribute(
      "href",
      "/hq/data-quality",
    );
    expect(within(areaMenu).getByRole("link", { name: "Admin Workbench" })).toHaveAttribute(
      "href",
      "/admin",
    );
    expect(within(areaMenu).getByRole("link", { name: "Reason Settings" })).toHaveAttribute(
      "href",
      "/admin/reasons",
    );
    expect(within(areaMenu).getByRole("link", { name: "Fuel Settings" })).toHaveAttribute(
      "href",
      "/admin/fuel",
    );
    expect(within(areaMenu).getByRole("link", { name: "Urgency Ranking" })).toHaveAttribute(
      "href",
      "/admin/urgency",
    );
    expect(within(areaMenu).getByRole("link", { name: "Reference Data" })).toHaveAttribute(
      "href",
      "/admin/reference-data",
    );
  });
```

- [ ] **Step 2: Run the focused test and verify it fails**

Run:

```bash
npm test -- components/senior/bne-command-board.test.tsx
```

Expected: FAIL because the heading is still `BNE APU Command Board`, the header still exposes visible route links, and the cog menu does not exist yet.

- [ ] **Step 3: Commit the failing test**

```bash
git add components/senior/bne-command-board.test.tsx
git commit -m test-cover-production-command-navbar
```

## Task 2: Command Board Header Implementation

**Files:**
- Modify: `components/senior/command-bar.tsx`
- Modify: `components/senior/bne-command-board.tsx`
- Test: `components/senior/bne-command-board.test.tsx`

- [ ] **Step 1: Replace the command bar component**

Replace `components/senior/command-bar.tsx` with:

```tsx
"use client";

import Link from "next/link";
import { useState } from "react";
import { Clock3, Cog, Radio, Thermometer } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

type CommandBarProps = {
  temperatureLabel: string;
  sourceFreshnessLabel: string;
  localTimeLabel: string;
};

const areaMenuLinks = [
  { href: "/senior/bne/wallboard", label: "Wallboard" },
  { href: "/hq", label: "HQ Monitoring" },
  { href: "/hq/reports", label: "HQ Reports" },
  { href: "/hq/data-quality", label: "Data Quality" },
  { href: "/admin", label: "Admin Workbench" },
  { href: "/admin/reasons", label: "Reason Settings" },
  { href: "/admin/fuel", label: "Fuel Settings" },
  { href: "/admin/urgency", label: "Urgency Ranking" },
  { href: "/admin/reference-data", label: "Reference Data" },
] as const;

export function CommandBar({
  temperatureLabel,
  sourceFreshnessLabel,
  localTimeLabel,
}: CommandBarProps) {
  const [isAreaMenuOpen, setIsAreaMenuOpen] = useState(false);

  return (
    <header className="border-b border-neutral-200 bg-white">
      <div className="mx-auto flex w-full max-w-[1600px] flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6">
        <div className="min-w-0">
          <h1 className="truncate text-lg font-semibold tracking-normal text-neutral-950 sm:text-xl">
            Daily APU Fuel Burn - Command
          </h1>
        </div>

        <div className="flex flex-wrap items-center justify-end gap-2">
          <Badge variant="secondary" className="gap-2 px-3 py-1.5 text-sm">
            <Thermometer aria-hidden="true" className="size-4" data-icon />
            {temperatureLabel}
          </Badge>
          <Badge variant="outline" className="gap-2 px-3 py-1.5 text-sm">
            <Radio aria-hidden="true" className="size-4" data-icon />
            {sourceFreshnessLabel}
          </Badge>
          <Badge variant="neutral" className="gap-2 px-3 py-1.5 text-sm">
            <Clock3 aria-hidden="true" className="size-4" data-icon />
            {localTimeLabel}
          </Badge>
          <div className="relative">
            <Button
              aria-controls={isAreaMenuOpen ? "area-menu" : undefined}
              aria-expanded={isAreaMenuOpen}
              aria-label="Open area menu"
              className="bg-white"
              onClick={() => setIsAreaMenuOpen((isOpen) => !isOpen)}
              size="icon"
              type="button"
              variant="outline"
            >
              <Cog aria-hidden="true" data-icon />
            </Button>

            {isAreaMenuOpen ? (
              <nav
                aria-label="Area menu"
                className="absolute right-0 z-50 mt-2 w-56 rounded-product border border-neutral-200 bg-white p-2 text-sm font-semibold text-neutral-700 shadow-xl"
                id="area-menu"
              >
                {areaMenuLinks.map((link) => (
                  <Link
                    className="block rounded-product px-3 py-2 transition-colors hover:bg-neutral-100 hover:text-neutral-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-virgin-purple"
                    href={link.href}
                    key={link.href}
                  >
                    {link.label}
                  </Link>
                ))}
              </nav>
            ) : null}
          </div>
        </div>
      </div>
    </header>
  );
}
```

- [ ] **Step 2: Stop passing `port` into `CommandBar`**

In `components/senior/bne-command-board.tsx`, change:

```tsx
      <CommandBar
        localTimeLabel={formatBneLocalTime(board.nowIso)}
        port={board.port}
        sourceFreshnessLabel={sourceFreshnessLabel(board)}
        temperatureLabel={`${board.weather?.temperatureC ?? "--"}°C`}
      />
```

to:

```tsx
      <CommandBar
        localTimeLabel={formatBneLocalTime(board.nowIso)}
        sourceFreshnessLabel={sourceFreshnessLabel(board)}
        temperatureLabel={`${board.weather?.temperatureC ?? "--"}°C`}
      />
```

- [ ] **Step 3: Run the focused command board test**

Run:

```bash
npm test -- components/senior/bne-command-board.test.tsx
```

Expected: PASS for the command bar test and all existing command board tests.

- [ ] **Step 4: Commit the command board implementation**

```bash
git add components/senior/command-bar.tsx components/senior/bne-command-board.tsx
git commit -m feat-add-production-command-navbar
```

## Task 3: Wallboard Test Coverage

**Files:**
- Modify: `components/wallboard/wallboard.test.tsx`
- Test: `components/wallboard/wallboard.test.tsx`

- [ ] **Step 1: Update the wallboard shell test**

In `components/wallboard/wallboard.test.tsx`, replace the heading expectation in `it("renders the read-only BNE wallboard shell", ...)` with:

```tsx
    expect(screen.getByRole("heading", { name: "Daily APU Fuel Burn", level: 1 })).toBeVisible();
    expect(screen.queryByRole("heading", { name: "BNE Wallboard", level: 1 })).not.toBeInTheDocument();
```

- [ ] **Step 2: Update the wallboard command bar test**

Replace `it("renders a read-only wallboard command bar without workflow controls", ...)` with:

```tsx
  it("renders a quiet wallboard command bar without workflow controls or mode labels", () => {
    render(<SeniorBneWallboardPage />);

    const header = screen.getByRole("banner");

    expect(
      within(header).getByRole("heading", { name: "Daily APU Fuel Burn", level: 1 }),
    ).toBeVisible();
    expect(within(header).queryByText("BNE")).not.toBeInTheDocument();
    expect(within(header).queryByText("Senior Engineer / Wallboard")).not.toBeInTheDocument();
    expect(within(header).queryByText("Read-only TV mode")).not.toBeInTheDocument();
    expect(within(header).getByText("24°C")).toBeVisible();
    expect(within(header).getByText(/Feed fresh/i)).toBeVisible();
    expect(within(header).getByText("18:55 AEST")).toBeVisible();
    expect(screen.queryByText(/scenario/i)).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /manual refresh/i })).not.toBeInTheDocument();
    expect(screen.queryByRole("link", { name: /admin/i })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /change reason/i })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /mark apu off/i })).not.toBeInTheDocument();
    expect(screen.queryByText(/benchmark controls/i)).not.toBeInTheDocument();
  });
```

- [ ] **Step 3: Run the focused wallboard test and verify it fails**

Run:

```bash
npm test -- components/wallboard/wallboard.test.tsx
```

Expected: FAIL because the wallboard heading is still `BNE Wallboard` and the read-only TV mode badge still renders.

- [ ] **Step 4: Commit the failing wallboard test**

```bash
git add components/wallboard/wallboard.test.tsx
git commit -m test-cover-quiet-wallboard-navbar
```

## Task 4: Wallboard Header Implementation

**Files:**
- Modify: `components/wallboard/wallboard-command-bar.tsx`
- Modify: `components/wallboard/senior-wallboard-layout.tsx`
- Test: `components/wallboard/wallboard.test.tsx`

- [ ] **Step 1: Replace the wallboard command bar component**

Replace `components/wallboard/wallboard-command-bar.tsx` with:

```tsx
import { Clock3, Radio, Thermometer } from "lucide-react";

import { Badge } from "@/components/ui/badge";

type WallboardCommandBarProps = {
  temperatureLabel: string;
  sourceFreshnessLabel: string;
  localTimeLabel: string;
};

export function WallboardCommandBar({
  temperatureLabel,
  sourceFreshnessLabel,
  localTimeLabel,
}: WallboardCommandBarProps) {
  return (
    <header className="flex items-center justify-between gap-4 border-b border-neutral-200 bg-white px-6 py-3">
      <h1 className="min-w-0 truncate text-xl font-semibold tracking-normal text-neutral-950">
        Daily APU Fuel Burn
      </h1>

      <div className="flex shrink-0 flex-wrap items-center justify-end gap-2">
        <Badge variant="secondary" className="gap-2 px-3 py-1.5 text-sm">
          <Thermometer aria-hidden="true" className="size-4" data-icon />
          {temperatureLabel}
        </Badge>
        <Badge variant="outline" className="gap-2 px-3 py-1.5 text-sm">
          <Radio aria-hidden="true" className="size-4" data-icon />
          {sourceFreshnessLabel}
        </Badge>
        <Badge variant="neutral" className="gap-2 px-3 py-1.5 text-sm">
          <Clock3 aria-hidden="true" className="size-4" data-icon />
          {localTimeLabel}
        </Badge>
      </div>
    </header>
  );
}
```

- [ ] **Step 2: Stop passing `port` into `WallboardCommandBar`**

In `components/wallboard/senior-wallboard-layout.tsx`, change:

```tsx
        <WallboardCommandBar
          localTimeLabel={formatBneLocalTime(board.nowIso)}
          port={board.port}
          sourceFreshnessLabel={sourceFreshnessLabel(board)}
          temperatureLabel={`${board.weather?.temperatureC ?? "--"}°C`}
        />
```

to:

```tsx
        <WallboardCommandBar
          localTimeLabel={formatBneLocalTime(board.nowIso)}
          sourceFreshnessLabel={sourceFreshnessLabel(board)}
          temperatureLabel={`${board.weather?.temperatureC ?? "--"}°C`}
        />
```

- [ ] **Step 3: Run the focused wallboard test**

Run:

```bash
npm test -- components/wallboard/wallboard.test.tsx
```

Expected: PASS for all wallboard tests.

- [ ] **Step 4: Commit the wallboard implementation**

```bash
git add components/wallboard/wallboard-command-bar.tsx components/wallboard/senior-wallboard-layout.tsx
git commit -m feat-quiet-wallboard-navbar
```

## Task 5: Final Verification

**Files:**
- Verify: command board and wallboard routes in the running app
- Test: full relevant Vitest coverage

- [ ] **Step 1: Run the focused test files together**

Run:

```bash
npm test -- components/senior/bne-command-board.test.tsx components/wallboard/wallboard.test.tsx
```

Expected: PASS.

- [ ] **Step 2: Run the route smoke tests**

Run:

```bash
npm test -- app/routes.test.tsx
```

Expected: PASS.

- [ ] **Step 3: Check the command board visually**

Open `http://localhost:3000/senior/bne`.

Expected:
- Header title reads `Daily APU Fuel Burn - Command`.
- Header does not show BNE or Senior Engineer labels.
- Temperature, feed, and time chips are larger than the old compact badges.
- Cog button opens the all-area menu.
- Wallboard, HQ, and Admin are not visible as top-level header links.

- [ ] **Step 4: Check the wallboard visually**

Open `http://localhost:3000/senior/bne/wallboard`.

Expected:
- Header title reads `Daily APU Fuel Burn`.
- Header does not show BNE, Senior Engineer / Wallboard, or Read-only TV mode.
- Temperature, feed, and time remain visible.
- The wallboard content remains the visual focus.
