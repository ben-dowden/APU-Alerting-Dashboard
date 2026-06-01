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

  it("scales the strongest source issue chip for wallboard display", () => {
    render(
      <SourceQualityCharm
        size="wallboard"
        sourceCharms={[sourceCharm({ sourceSystem: "AODB", isStale: true })]}
      />,
    );

    const chip = screen.getByLabelText("Source issue: Stale");

    expect(chip).toHaveTextContent("Stale");
    expect(chip).toHaveClass("px-2", "py-0.5", "text-xs", "leading-5");
  });
});
