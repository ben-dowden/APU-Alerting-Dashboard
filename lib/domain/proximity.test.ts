import { describe, expect, it } from "vitest";
import { standCoordinateReferenceEvents } from "@/lib/fixtures/reference/stand-coordinates";
import {
  calculateAircraftProximityContext,
  calculateClosestAircraft,
  calculateNearbyApuAircraft,
} from "./proximity";

const aircraft = [
  { tail: "VH-8IA", stand: "20", bay: "Bay 20", apuState: "on" as const },
  { tail: "VH-YFX", stand: "21", bay: "Bay 21", apuState: "off" as const },
  { tail: "VH-8NB", stand: "23", bay: "Bay 23", apuState: "on" as const },
  { tail: "VH-8NJ", stand: "24", bay: "Bay 24", apuState: "on" as const },
];

describe("proximity helpers", () => {
  it("calculates the closest aircraft by stand coordinates", () => {
    expect(calculateClosestAircraft(aircraft[0], aircraft.slice(1), standCoordinateReferenceEvents)).toEqual(
      expect.objectContaining({
        tail: "VH-YFX",
        stand: "21",
        bay: "Bay 21",
      }),
    );
  });

  it("returns nearby APU-running aircraft within 100 metres", () => {
    const nearby = calculateNearbyApuAircraft(
      aircraft[0],
      aircraft.slice(1),
      standCoordinateReferenceEvents,
      100,
    );

    expect(nearby.map((entry) => entry.tail)).toEqual(["VH-8NB"]);
    expect(nearby[0].distanceMeters).toBeLessThanOrEqual(100);
  });

  it("builds the card-ready closest tail and APU-running proximity context", () => {
    const context = calculateAircraftProximityContext(
      aircraft[0],
      aircraft.slice(1),
      standCoordinateReferenceEvents,
    );

    expect(context.closestAircraft).toEqual(
      expect.objectContaining({
        tail: "VH-YFX",
        stand: "21",
        distanceMeters: expect.any(Number),
      }),
    );
    expect(context.nearbyApuAircraft).toEqual([
      expect.objectContaining({
        tail: "VH-8NB",
        bay: "Bay 23",
      }),
    ]);
  });
});
