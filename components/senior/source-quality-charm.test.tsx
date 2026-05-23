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
  it("renders stale, unknown, conflicting, and low-confidence markers with accessible detail", () => {
    render(
      <SourceQualityCharm
        sourceCharms={[
          sourceCharm({ sourceSystem: "AODB", isStale: true, sourceLatencyMinutes: 24 }),
          sourceCharm({ sourceSystem: "ACMS", confidence: "low" }),
          sourceCharm({ sourceSystem: "UNKNOWN", qualityFlags: ["unknown"] }),
          sourceCharm({ sourceSystem: "AODB", qualityFlags: ["conflicting"] }),
        ]}
      />,
    );

    expect(screen.getByLabelText(/Stale AODB source/i)).toHaveAttribute(
      "title",
      expect.stringContaining("24m latency"),
    );
    expect(screen.getByLabelText(/Low confidence ACMS source/i)).toBeVisible();
    expect(screen.getByLabelText(/Unknown UNKNOWN source/i)).toBeVisible();
    expect(screen.getByLabelText(/Conflicting AODB source/i)).toBeVisible();
  });

  it("does not render fallback burn-rate assumption markers on collapsed cards", () => {
    render(
      <SourceQualityCharm
        sourceCharms={[sourceCharm({ sourceSystem: "FUEL_ASSUMPTIONS", qualityFlags: ["fallback_assumption"] })]}
      />,
    );

    expect(screen.queryByText(/fallback/i)).not.toBeInTheDocument();
    expect(screen.queryByLabelText(/fallback/i)).not.toBeInTheDocument();
  });
});
