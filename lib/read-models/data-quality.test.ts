import { describe, expect, it } from "vitest";
import { bneEquipmentMismatchScenario } from "@/lib/fixtures/scenarios";
import { deriveDataQualityTelemetry } from "./data-quality";

describe("deriveDataQualityTelemetry", () => {
  it("surfaces equipment mismatch diagnostics from data-quality events", () => {
    expect(deriveDataQualityTelemetry(bneEquipmentMismatchScenario.events)).toEqual([
      expect.objectContaining({
        flagId: "dq:VH-8NB:equipment-mismatch",
        tail: "VH-8NB",
        category: "equipment_mismatch",
        severity: "warning",
        summary: "Flight-state equipment B738 conflicts with tail reference equipment B38M.",
      }),
    ]);
  });
});
