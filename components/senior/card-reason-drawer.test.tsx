import { fireEvent, render, screen } from "@testing-library/react";
import { useState } from "react";
import { describe, expect, it, vi } from "vitest";

import type { ReasonSegment } from "@/lib/domain/reason-chain-reducer";
import { CardReasonDrawer } from "./card-reason-drawer";

const currentReason: ReasonSegment = {
  reasonSegmentId: "reason-2",
  apuEventId: "BNE:VH-8IA:apu:2026-05-22T08:37:00.000Z",
  categoryId: "cleaning-in-progress",
  categoryLabel: "Cleaning in progress",
  detailId: "cleaner-onboard",
  detailLabel: "Cleaner onboard",
  startedAt: "2026-05-22T08:50:00.000Z",
  selectedBy: "senior-engineer-bne",
  sourceEventIds: ["reason-2"],
};

const previousReason: ReasonSegment = {
  ...currentReason,
  reasonSegmentId: "reason-1",
  categoryId: "infrastructure-unavailable",
  categoryLabel: "Infrastructure unavailable",
  detailId: "pca-unavailable",
  detailLabel: "PCA unavailable",
  startedAt: "2026-05-22T08:40:00.000Z",
  endedAt: "2026-05-22T08:50:00.000Z",
};

const segmentForIndex = (index: number): ReasonSegment => ({
  ...currentReason,
  reasonSegmentId: `reason-${index}`,
  categoryId: `category-${index}`,
  categoryLabel: `Reason ${index}`,
  detailId: `detail-${index}`,
  detailLabel: `Detail ${index}`,
  startedAt: `2026-05-22T08:${String(40 + index).padStart(2, "0")}:00.000Z`,
  sourceEventIds: [`reason-${index}`],
});

const segmentsForCount = (count: number) =>
  Array.from({ length: count }, (_, index) => segmentForIndex(index + 1));

function DrawerHarness() {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div>
      <div className="relative">
        <CardReasonDrawer
          currentReason={currentReason}
          isOpen={isOpen}
          onAddNote={vi.fn()}
          onClose={() => setIsOpen(false)}
          segments={[previousReason, currentReason]}
          tail="VH-8IA"
        />
      </div>
      <button type="button">Outside target</button>
    </div>
  );
}

describe("CardReasonDrawer", () => {
  it("opens below the card and shows current reason, note field, and timeline", () => {
    render(
      <CardReasonDrawer
        currentReason={currentReason}
        isOpen
        onAddNote={vi.fn()}
        onClose={vi.fn()}
        segments={[previousReason, currentReason]}
        tail="VH-8IA"
      />,
    );

    const drawer = screen.getByRole("dialog", { name: "Reason chain for VH-8IA" });
    expect(drawer).toHaveClass("absolute");
    expect(drawer).toHaveClass("top-full");
    expect(drawer).toHaveClass("bg-white");
    expect(drawer).toHaveClass("border-neutral-200");
    expect(drawer).toHaveClass("shadow-lg");
    expect(drawer).toHaveClass("w-[760px]");
    expect(drawer).toHaveClass("max-w-[calc(100vw-2rem)]");
    expect(screen.getAllByText("Cleaning in progress")[0]).toBeVisible();
    expect(screen.getAllByText("Cleaner onboard")[0]).toBeVisible();
    expect(screen.getByLabelText("Reason note")).toBeVisible();
    expect(screen.getByRole("list", { name: "Reason timeline" })).toBeVisible();
  });

  it("stacks the note form below the reason timeline", () => {
    render(
      <CardReasonDrawer
        currentReason={currentReason}
        isOpen
        onAddNote={vi.fn()}
        onClose={vi.fn()}
        segments={[previousReason, currentReason]}
        tail="VH-8IA"
      />,
    );

    const timeline = screen.getByRole("list", { name: "Reason timeline" });
    const note = screen.getByLabelText("Reason note");

    expect(timeline.compareDocumentPosition(note)).toBe(Node.DOCUMENT_POSITION_FOLLOWING);
  });

  it.each([
    [1, "w-[540px]"],
    [2, "w-[760px]"],
    [3, "w-[960px]"],
    [4, "w-[1160px]"],
    [5, "w-[1200px]"],
    [6, "w-[1200px]"],
  ])("uses %s-segment drawer width %s", (segmentCount, widthClass) => {
    render(
      <CardReasonDrawer
        currentReason={currentReason}
        isOpen
        onAddNote={vi.fn()}
        onClose={vi.fn()}
        segments={segmentsForCount(segmentCount)}
        tail="VH-8IA"
      />,
    );

    expect(screen.getByRole("dialog", { name: "Reason chain for VH-8IA" })).toHaveClass(
      widthClass,
    );
  });

  it.each([
    ["left", ["left-0"], ["xl:left-1/2", "xl:right-0"]],
    ["center", ["left-0", "xl:left-1/2", "xl:-translate-x-1/2"], ["xl:right-0"]],
    ["right", ["left-0", "xl:left-auto", "xl:right-0"], ["xl:left-1/2"]],
  ] as const)("applies %s drawer placement classes", (placement, expected, absent) => {
    render(
      <CardReasonDrawer
        currentReason={currentReason}
        isOpen
        onAddNote={vi.fn()}
        onClose={vi.fn()}
        placement={placement}
        segments={[previousReason, currentReason]}
        tail="VH-8IA"
      />,
    );

    const drawer = screen.getByRole("dialog", { name: "Reason chain for VH-8IA" });
    expected.forEach((className) => expect(drawer).toHaveClass(className));
    absent.forEach((className) => expect(drawer).not.toHaveClass(className));
  });

  it("closes on Escape", () => {
    render(<DrawerHarness />);

    fireEvent.keyDown(document, { key: "Escape" });

    expect(screen.queryByRole("dialog", { name: "Reason chain for VH-8IA" })).not.toBeInTheDocument();
  });

  it("closes on outside click", () => {
    render(<DrawerHarness />);

    fireEvent.mouseDown(screen.getByRole("button", { name: "Outside target" }));

    expect(screen.queryByRole("dialog", { name: "Reason chain for VH-8IA" })).not.toBeInTheDocument();
  });

  it("submits notes from the drawer only", () => {
    const onAddNote = vi.fn();
    render(
      <CardReasonDrawer
        currentReason={currentReason}
        isOpen
        onAddNote={onAddNote}
        onClose={vi.fn()}
        segments={[previousReason, currentReason]}
        tail="VH-8IA"
      />,
    );

    fireEvent.change(screen.getByLabelText("Reason note"), {
      target: { value: "Engineer confirmed GPU is being moved." },
    });
    fireEvent.click(screen.getByRole("button", { name: "Add note" }));

    expect(onAddNote).toHaveBeenCalledWith("Engineer confirmed GPU is being moved.");
  });
});
