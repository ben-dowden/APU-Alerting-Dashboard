import { describe, expect, it } from "vitest";
import { fuelBurnAssumptionSettings } from "@/lib/fixtures/reference/fuel-assumptions";
import { allocateFuelKgByReasonSegment, estimateFuelKgForEquipment } from "./fuel";

describe("fuel helpers", () => {
  it("uses equipment-specific burn rates", () => {
    expect(estimateFuelKgForEquipment(30, "B738", fuelBurnAssumptionSettings)).toEqual(
      expect.objectContaining({
        estimatedKg: 56,
        kgPerHour: 112,
        equipmentType: "B738",
        assumptionVersion: "fuel-burn-assumptions-v1",
        isFallback: false,
      }),
    );
  });

  it("uses configured fallback burn rates for unmatched equipment", () => {
    expect(estimateFuelKgForEquipment(60, "E190", fuelBurnAssumptionSettings)).toEqual(
      expect.objectContaining({
        estimatedKg: 110,
        kgPerHour: 110,
        equipmentType: "UNKNOWN",
        requestedEquipmentType: "E190",
        isFallback: true,
        fallbackReason: "Configured fallback when equipment type is missing or unmatched.",
      }),
    );
  });

  it("preserves assumption version metadata", () => {
    const estimate = estimateFuelKgForEquipment(15, "B38M", fuelBurnAssumptionSettings);

    expect(estimate.assumptionVersion).toBe("fuel-burn-assumptions-v1");
    expect(estimate.assumptionSourceEventId).toBe(fuelBurnAssumptionSettings.eventId);
  });

  it("allocates reason-tagged kg by segment runtime", () => {
    const allocations = allocateFuelKgByReasonSegment(
      [
        { reasonSegmentId: "reason-1", runtimeMinutes: 15 },
        { reasonSegmentId: "reason-2", runtimeMinutes: 45 },
      ],
      "B738",
      fuelBurnAssumptionSettings,
    );

    expect(allocations).toEqual([
      expect.objectContaining({ reasonSegmentId: "reason-1", estimatedKg: 28 }),
      expect.objectContaining({ reasonSegmentId: "reason-2", estimatedKg: 84 }),
    ]);
    expect(allocations.reduce((total, row) => total + row.estimatedKg, 0)).toBe(112);
  });
});
