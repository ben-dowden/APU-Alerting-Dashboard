import { describe, expect, it } from "vitest";

import { fuelBurnAssumptionSettings, fuelPriceSettings } from "@/lib/fixtures/reference/fuel-assumptions";
import { reasonTaxonomySettings } from "@/lib/fixtures/reference/reason-taxonomy";
import { standCoordinateReferenceEvents } from "@/lib/fixtures/reference/stand-coordinates";
import {
  bneBaselineScenario,
  bneManualOffConfirmedScenario,
  bneManualOffContradictedScenario,
  bneMissingBurnAssumptionScenario,
} from "@/lib/fixtures/scenarios";

import { deriveHqReport, type HqReportSettings } from "./hq-report";

const settings: HqReportSettings = {
  reasonTaxonomy: reasonTaxonomySettings,
  fuelBurnAssumptions: fuelBurnAssumptionSettings,
  fuelPrice: fuelPriceSettings,
  standCoordinates: standCoordinateReferenceEvents,
};

const baseFilters = {
  startIso: "2026-05-22T00:00:00.000Z",
  endIso: "2026-05-22T08:55:00.000Z",
  ports: ["BNE"],
};

describe("deriveHqReport", () => {
  it("summarizes runtime, fuel, dollars, attribution, locations, and reasons", () => {
    const report = deriveHqReport(bneBaselineScenario.events, settings, baseFilters);

    expect(report.filters).toEqual(baseFilters);
    expect(report.generatedAt).toBe(baseFilters.endIso);
    expect(report.totalRuntimeMinutes).toBe(46);
    expect(report.totalFuelKg).toBe(85.9);
    expect(report.totalDollarImpact).toBe(101.36);
    expect(report.attributedRuntimePercent).toBe(76.1);
    expect(report.locationRows).toEqual([
      expect.objectContaining({
        port: "BNE",
        runtimeMinutes: 46,
        fuelKg: 85.9,
        dollarImpact: 101.36,
        attributedRuntimePercent: 76.1,
      }),
    ]);
    expect(report.reasonRows).toEqual([
      expect.objectContaining({
        reasonCategoryId: "cleaning-in-progress",
        reasonCategoryLabel: "Cleaning in progress",
        runtimeMinutes: 35,
        fuelKg: 65.4,
        dollarImpact: 77.17,
      }),
      expect.objectContaining({
        reasonCategoryId: "unattributed",
        reasonCategoryLabel: "Unattributed",
        runtimeMinutes: 11,
        fuelKg: 20.5,
        dollarImpact: 24.19,
      }),
    ]);
  });

  it("filters report rows by date range and port", () => {
    const dateFiltered = deriveHqReport(bneBaselineScenario.events, settings, {
      startIso: "2026-05-22T08:20:00.000Z",
      endIso: "2026-05-22T08:40:00.000Z",
      ports: ["BNE"],
    });
    const portFiltered = deriveHqReport(bneBaselineScenario.events, settings, {
      ...baseFilters,
      ports: ["MEL"],
    });

    expect(dateFiltered.totalRuntimeMinutes).toBe(20);
    expect(dateFiltered.totalFuelKg).toBe(37.4);
    expect(dateFiltered.exportRows).toHaveLength(1);
    expect(dateFiltered.exportRows[0]).toEqual(
      expect.objectContaining({
        startedAt: "2026-05-22T08:20:00.000Z",
        endedAt: "2026-05-22T08:40:00.000Z",
      }),
    );
    expect(portFiltered.totalRuntimeMinutes).toBe(0);
    expect(portFiltered.exportRows).toEqual([]);
  });

  it("keeps unattributed burn as its own report bucket", () => {
    const report = deriveHqReport(bneBaselineScenario.events, settings, baseFilters);

    expect(report.unattributedRows).toEqual([
      expect.objectContaining({
        reasonCategoryId: "unattributed",
        runtimeMinutes: 11,
        fuelKg: 20.5,
      }),
    ]);
  });

  it("excludes manual-off observations from official closure until trusted source confirmation", () => {
    const pending = deriveHqReport(bneManualOffContradictedScenario.events, settings, {
      ...baseFilters,
      endIso: "2026-05-22T11:30:00.000Z",
    });
    const confirmed = deriveHqReport(bneManualOffConfirmedScenario.events, settings, {
      ...baseFilters,
      endIso: "2026-05-22T11:00:00.000Z",
    });

    expect(pending.exportRows).toEqual(expect.arrayContaining([
      expect.objectContaining({
        tail: "VH-8XA",
        closureType: "open",
        manualOffStatus: "contradicted_by_source",
        endedAt: "2026-05-22T11:30:00.000Z",
      }),
    ]));
    expect(confirmed.exportRows).toEqual(expect.arrayContaining([
      expect.objectContaining({
        tail: "VH-8NJ",
        closureType: "source_off",
        manualOffStatus: "confirmed_by_source",
        endedAt: "2026-05-22T10:37:00.000Z",
      }),
    ]));
  });

  it("carries fuel, price, reason taxonomy, settings, source, and fallback metadata", () => {
    const report = deriveHqReport(bneMissingBurnAssumptionScenario.events, settings, {
      ...baseFilters,
      endIso: "2026-05-22T12:55:00.000Z",
    });

    expect(report.assumptionMetadata).toEqual(
      expect.objectContaining({
        fuelPriceVersion: "fuel-price-v1",
        fuelPriceSourceEventId: fuelPriceSettings.eventId,
        fuelPriceCurrency: "AUD",
        fuelPricePerKg: 1.18,
        fuelBurnAssumptionVersion: "fuel-burn-assumptions-v1",
        fuelBurnAssumptionSourceEventId: fuelBurnAssumptionSettings.eventId,
        reasonTaxonomyVersion: "reason-taxonomy-v1",
        reasonTaxonomySourceEventId: reasonTaxonomySettings.eventId,
        settingsVersion: "reason-taxonomy-v1/fuel-burn-assumptions-v1/fuel-price-v1",
      }),
    );
    expect(report.exportRows).toEqual(expect.arrayContaining([
      expect.objectContaining({
        tail: "VH-ZHA",
        fuelPriceVersion: "fuel-price-v1",
        fuelBurnAssumptionVersion: "fuel-burn-assumptions-v1",
        reasonTaxonomyVersion: "reason-taxonomy-v1",
        settingsVersion: "reason-taxonomy-v1/fuel-burn-assumptions-v1/fuel-price-v1",
        isFallbackFuelAssumption: true,
        sourceEventIds: expect.arrayContaining(["ACMS-VHZHA-APUON-1233"]),
      }),
    ]));
  });
});
