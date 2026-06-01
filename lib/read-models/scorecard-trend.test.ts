import { describe, expect, it } from "vitest";

import { fuelBurnAssumptionSettings } from "@/lib/fixtures/reference/fuel-assumptions";
import { reasonTaxonomySettings } from "@/lib/fixtures/reference/reason-taxonomy";
import { standCoordinateReferenceEvents } from "@/lib/fixtures/reference/stand-coordinates";
import { apuStateEvent, flightStateEvent } from "@/lib/fixtures/scenarios/builders";
import { bneBaselineScenario } from "@/lib/fixtures/scenarios";

import { deriveScorecardTrend } from "./scorecard-trend";

const settings = {
  reasonTaxonomy: reasonTaxonomySettings.payload.snapshot,
  fuelBurnAssumptions: fuelBurnAssumptionSettings,
  standCoordinates: standCoordinateReferenceEvents,
};

const nowIso = "2026-05-22T08:55:00.000Z";

describe("deriveScorecardTrend", () => {
  it("samples now plus six hourly lookbacks in chronological order", () => {
    const trend = deriveScorecardTrend(bneBaselineScenario.events, settings, nowIso);

    expect(trend).toHaveLength(7);
    expect(trend.map((point) => point.timestamp)).toEqual([
      "2026-05-22T02:55:00.000Z",
      "2026-05-22T03:55:00.000Z",
      "2026-05-22T04:55:00.000Z",
      "2026-05-22T05:55:00.000Z",
      "2026-05-22T06:55:00.000Z",
      "2026-05-22T07:55:00.000Z",
      nowIso,
    ]);
    expect(trend.at(-1)).toEqual({
      timestamp: nowIso,
      activeApuCount: 16,
      longRunnerCount: 7,
      untaggedRuntimePercent: 51.7,
      apuIntensityPercent: 57.6,
    });
  });

  it("returns zero metrics when no replayable events exist", () => {
    expect(deriveScorecardTrend([], settings, nowIso)).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          activeApuCount: 0,
          longRunnerCount: 0,
          untaggedRuntimePercent: 0,
          apuIntensityPercent: 0,
        }),
      ]),
    );
  });

  it("keeps flat trends stable when one aircraft has been running across the full window", () => {
    const flatEvents = [
      flightStateEvent({
        tail: "VH-FLT",
        flightNumber: "VA001",
        aircraftType: "B738",
        gateState: "on_ground",
        onGroundAt: "2026-05-22T02:00:00.000Z",
        occurredAt: "2026-05-22T02:00:00.000Z",
        receivedAt: "2026-05-22T02:01:00.000Z",
        sourceEventId: "flat-flight",
      }),
      apuStateEvent({
        tail: "VH-FLT",
        state: "on",
        occurredAt: "2026-05-22T02:00:00.000Z",
        receivedAt: "2026-05-22T02:01:00.000Z",
        sourceEventId: "flat-apu-on",
      }),
    ];

    expect(deriveScorecardTrend(flatEvents, settings, nowIso)).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          activeApuCount: 1,
          longRunnerCount: 1,
          untaggedRuntimePercent: 100,
          apuIntensityPercent: 100,
        }),
      ]),
    );
  });
});
