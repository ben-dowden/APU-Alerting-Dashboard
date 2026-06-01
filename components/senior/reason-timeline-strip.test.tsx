import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import type { ReasonSegment } from "@/lib/domain/reason-chain-reducer";
import { ReasonTimelineStrip } from "./reason-timeline-strip";

const segment = (
  reasonSegmentId: string,
  categoryLabel: string,
  detailLabel: string,
  startedAt: string,
  endedAt?: string,
): ReasonSegment => ({
  reasonSegmentId,
  apuEventId: "BNE:VH-8IA:apu:2026-05-22T08:37:00.000Z",
  categoryId: categoryLabel.toLowerCase().replaceAll(" ", "-"),
  categoryLabel,
  detailId: detailLabel.toLowerCase().replaceAll(" ", "-"),
  detailLabel,
  startedAt,
  endedAt,
  selectedBy: "senior-engineer-bne",
  sourceEventIds: [reasonSegmentId],
});

const segments = [
  segment("reason-1", "Infrastructure unavailable", "PCA unavailable", "2026-05-22T08:40:00.000Z", "2026-05-22T08:50:00.000Z"),
  segment("reason-2", "Cleaning in progress", "Cleaner onboard", "2026-05-22T08:50:00.000Z", "2026-05-22T09:00:00.000Z"),
  segment("reason-3", "Engineering requirement", "Maintenance task in progress", "2026-05-22T09:00:00.000Z", "2026-05-22T09:10:00.000Z"),
  segment("reason-4", "Logistics / agent on the way", "Agent on the way", "2026-05-22T09:10:00.000Z"),
];

describe("ReasonTimelineStrip", () => {
  it("renders repeated segment ids as distinct timeline occurrences", () => {
    const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => undefined);
    const repeatedIdSegments = [
      segment("duplicate-reason", "Cleaning in progress", "Cleaner onboard", "2026-05-22T08:50:00.000Z", "2026-05-22T08:55:00.000Z"),
      segment("duplicate-reason", "Engineering requirement", "Maintenance task in progress", "2026-05-22T08:55:00.000Z", "2026-05-22T08:55:00.000Z"),
      segment("duplicate-reason", "Flight operations / pilot discretion", "Pilot discretion", "2026-05-22T08:55:00.000Z"),
    ];

    try {
      render(<ReasonTimelineStrip segments={repeatedIdSegments} />);

      expect(consoleErrorSpy).not.toHaveBeenCalled();
      expect(screen.getAllByRole("listitem")).toHaveLength(3);
      expect(
        within(
          screen.getByRole("listitem", { name: "Engineering requirement segment" }),
        ).queryByText("Current"),
      ).not.toBeInTheDocument();
      expect(
        within(
          screen.getByRole("listitem", {
            name: "Flight operations / pilot discretion segment",
          }),
        ).getByText("Current"),
      ).toBeVisible();
    } finally {
      consoleErrorSpy.mockRestore();
    }
  });

  it("shows the full reason chain by default", () => {
    render(<ReasonTimelineStrip segments={segments} />);

    expect(screen.getByText("Infrastructure unavailable")).toBeVisible();
    expect(screen.getByText("Cleaning in progress")).toBeVisible();
    expect(screen.getByText("Engineering requirement")).toBeVisible();
    expect(screen.getByText("Logistics / agent on the way")).toBeVisible();
  });

  it("keeps the timeline inside an internal horizontal overflow boundary", () => {
    render(<ReasonTimelineStrip segments={segments} />);

    const timeline = screen.getByRole("list", { name: "Reason timeline" });
    expect(screen.getByText("Infrastructure unavailable")).toBeVisible();
    expect(timeline).toHaveClass("overflow-x-auto");
    expect(screen.queryByRole("button", { name: "Show all reason segments" })).not.toBeInTheDocument();
  });

  it("shows the previous-segment correction action on focus", () => {
    const onCorrectSegment = vi.fn();
    render(<ReasonTimelineStrip onCorrectSegment={onCorrectSegment} segments={segments} />);

    expect(screen.queryByRole("button", { name: "Correct Engineering requirement" })).not.toBeInTheDocument();

    fireEvent.focus(screen.getByRole("listitem", { name: "Engineering requirement segment" }));
    fireEvent.click(screen.getByRole("button", { name: "Correct Engineering requirement" }));

    expect(onCorrectSegment).toHaveBeenCalledWith(
      expect.objectContaining({ reasonSegmentId: "reason-3" }),
    );
  });

  it("keeps the current segment visually distinct", () => {
    render(<ReasonTimelineStrip segments={segments} />);

    const currentSegment = screen.getByRole("listitem", {
      name: "Logistics / agent on the way segment",
    });
    expect(within(currentSegment).getByText("Current")).toBeVisible();
  });
});
