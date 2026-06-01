import { describe, expect, it } from "vitest";
import { deriveBenchmarkPanel } from "./benchmark-panel";

const current = {
  runtimeMinutes: 60,
  fuelKg: 100,
  temperatureC: 24,
  apuIntensityPercent: 57.6,
};

const baselines = {
  similar_temperature: { runtimeMinutes: 50, fuelKg: 80, apuIntensityPercent: 45.6 },
  weekly_average: { runtimeMinutes: 55, fuelKg: 90, apuIntensityPercent: 48.6 },
  monthly_average: { runtimeMinutes: 65, fuelKg: 110, apuIntensityPercent: 42.6 },
  annual_average: { runtimeMinutes: 70, fuelKg: 120, apuIntensityPercent: 39.6 },
};

describe("deriveBenchmarkPanel", () => {
  it("returns exactly one active comparison plus selectable modes", () => {
    const panel = deriveBenchmarkPanel(current, "weekly_average", baselines);

    expect(panel.activeComparison.mode).toBe("weekly_average");
    expect(panel.modes.map((mode) => mode.mode)).toEqual([
      "similar_temperature",
      "weekly_average",
      "monthly_average",
      "annual_average",
    ]);
  });

  it("calculates exact absolute and percentage deltas without dollars", () => {
    expect(deriveBenchmarkPanel(current, "similar_temperature", baselines).activeComparison).toEqual(
      expect.objectContaining({
        fuelDeltaKg: 20,
        fuelDeltaPercent: 25,
        runtimeDeltaMinutes: 10,
        runtimeDeltaPercent: 20,
        dollarDelta: undefined,
      }),
    );
  });

  it("uses a 3 degree similar-temperature band label", () => {
    expect(deriveBenchmarkPanel(current, "similar_temperature", baselines).activeComparison).toEqual(
      expect.objectContaining({
        basisLabel: "Similar-temperature days",
        temperatureBandLabel: "23-25°C",
      }),
    );
  });

  it("calculates APU intensity percentage-point deltas with short rotating copy", () => {
    expect(deriveBenchmarkPanel(current, "similar_temperature", baselines).activeComparison).toEqual(
      expect.objectContaining({
        apuIntensityDeltaPoints: 12,
        apuIntensityComparisonLabel: "vs similar temp +12 pts",
      }),
    );

    expect(deriveBenchmarkPanel(current, "weekly_average", baselines).activeComparison).toEqual(
      expect.objectContaining({
        apuIntensityDeltaPoints: 9,
        apuIntensityComparisonLabel: "vs last week +9 pts",
      }),
    );
  });

  it("shows a calm fallback when the active intensity baseline is missing", () => {
    const panel = deriveBenchmarkPanel(current, "monthly_average", {
      ...baselines,
      monthly_average: { runtimeMinutes: 65, fuelKg: 110 },
    });

    expect(panel.activeComparison.apuIntensityDeltaPoints).toBeUndefined();
    expect(panel.activeComparison.apuIntensityComparisonLabel).toBe("baseline pending");
  });
});
