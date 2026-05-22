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
    expect(screen.getAllByText("Cleaning in progress")[0]).toBeVisible();
    expect(screen.getAllByText("Cleaner onboard")[0]).toBeVisible();
    expect(screen.getByLabelText("Reason note")).toBeVisible();
    expect(screen.getByRole("list", { name: "Reason timeline" })).toBeVisible();
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
