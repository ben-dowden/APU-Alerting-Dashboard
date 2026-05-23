import { describe, expect, it } from "vitest";
import { fuelBurnAssumptionSettings } from "@/lib/fixtures/reference/fuel-assumptions";
import { reasonTaxonomySettings } from "@/lib/fixtures/reference/reason-taxonomy";
import { standCoordinateReferenceEvents } from "@/lib/fixtures/reference/stand-coordinates";
import {
  bneBaselineScenario,
  bneManualOffConfirmedScenario,
  bneManualOffContradictedScenario,
} from "@/lib/fixtures/scenarios";
import { flightStateEvent } from "@/lib/fixtures/scenarios/builders";
import type { FlightStateEvent } from "@/lib/events";
import { deriveAircraftCards } from "./aircraft-card";
import { deriveCurrentBoard } from "./current-board";

const settings = {
  reasonTaxonomy: reasonTaxonomySettings.payload.snapshot,
  fuelBurnAssumptions: fuelBurnAssumptionSettings,
  standCoordinates: standCoordinateReferenceEvents,
};

describe("deriveCurrentBoard", () => {
  it("includes all BNE ground aircraft from the baseline scenario", () => {
    const board = deriveCurrentBoard(
      bneBaselineScenario.events,
      settings,
      "2026-05-22T08:55:00.000Z",
    );

    expect(board.groundAircraft.map((aircraft) => aircraft.tail)).toEqual(["VH-8IA", "VH-YFX"]);
  });

  it("ignores ground aircraft outside the current board port", () => {
    const bneFlight = flightStateEvent({
      tail: "VH-MEL",
      flightNumber: "VA771",
      aircraftType: "B737-800",
      arrivalFlightNumber: "VA771",
      departureFlightNumber: "VA772",
      origin: "BNE",
      destination: "MEL",
      gateState: "on_ground",
      onGroundAt: "2026-05-22T08:40:00.000Z",
      occurredAt: "2026-05-22T08:40:00.000Z",
      receivedAt: "2026-05-22T08:41:00.000Z",
      sourceEventId: "MEL-FLIGHT-VHMEL-0840",
    });
    const melFlight: FlightStateEvent = {
      ...bneFlight,
      eventId: bneFlight.eventId.replace(":BNE:", ":MEL:"),
      correlation: { ...bneFlight.correlation, port: "MEL" },
      payload: { ...bneFlight.payload, port: "MEL" },
    };

    const board = deriveCurrentBoard(
      [...bneBaselineScenario.events, melFlight],
      settings,
      "2026-05-22T08:55:00.000Z",
    );

    expect(board.groundAircraft.map((aircraft) => aircraft.tail)).not.toContain("VH-MEL");
  });

  it("does not replay source events after now", () => {
    const futureFlight = flightStateEvent({
      tail: "VH-FUT",
      flightNumber: "VA999",
      aircraftType: "B737-800",
      arrivalFlightNumber: "VA999",
      departureFlightNumber: "VA1000",
      origin: "SYD",
      destination: "BNE",
      gateState: "on_ground",
      onGroundAt: "2026-05-22T09:30:00.000Z",
      occurredAt: "2026-05-22T09:30:00.000Z",
      receivedAt: "2026-05-22T09:31:00.000Z",
      sourceEventId: "BNE-FLIGHT-VHFUT-0930",
    });

    const board = deriveCurrentBoard(
      [...bneBaselineScenario.events, futureFlight],
      settings,
      "2026-05-22T08:55:00.000Z",
    );

    expect(board.groundAircraft.map((aircraft) => aircraft.tail)).not.toContain("VH-FUT");
  });

  it("uses the latest flight state by event time instead of input order", () => {
    const laterFlight = flightStateEvent({
      tail: "VH-ORD",
      flightNumber: "VA102",
      aircraftType: "B737-800",
      arrivalFlightNumber: "VA101",
      departureFlightNumber: "VA102",
      origin: "SYD",
      destination: "BNE",
      gateState: "turnaround",
      onGroundAt: "2026-05-22T08:20:00.000Z",
      occurredAt: "2026-05-22T08:50:00.000Z",
      receivedAt: "2026-05-22T08:50:30.000Z",
      sourceEventId: "BNE-FLIGHT-VHORD-0850",
    });
    const earlierFlight = flightStateEvent({
      tail: "VH-ORD",
      flightNumber: "VA101",
      aircraftType: "B737-800",
      arrivalFlightNumber: "VA101",
      departureFlightNumber: "VA102",
      origin: "SYD",
      destination: "BNE",
      gateState: "arrived",
      onGroundAt: "2026-05-22T08:20:00.000Z",
      occurredAt: "2026-05-22T08:20:00.000Z",
      receivedAt: "2026-05-22T08:20:30.000Z",
      sourceEventId: "BNE-FLIGHT-VHORD-0820",
    });

    const board = deriveCurrentBoard(
      [laterFlight, earlierFlight],
      settings,
      "2026-05-22T08:55:00.000Z",
    );

    expect(board.groundAircraft).toEqual([
      expect.objectContaining({
        tail: "VH-ORD",
        flightNumber: "VA102",
        gateState: "turnaround",
      }),
    ]);
  });

  it("keeps APU-off aircraft calm and visible", () => {
    const board = deriveCurrentBoard(
      bneBaselineScenario.events,
      settings,
      "2026-05-22T08:55:00.000Z",
    );
    const cards = deriveAircraftCards(board);

    expect(cards.find((card) => card.tail === "VH-YFX")).toEqual(
      expect.objectContaining({
        apuState: "off",
        urgencyBucket: "apu_off",
        statusLabel: "APU off",
      }),
    );
  });

  it("builds active APU card facts from runtime, fuel, reason, review state, and source charms", () => {
    const board = deriveCurrentBoard(
      bneBaselineScenario.events,
      settings,
      "2026-05-22T08:55:00.000Z",
    );
    const cards = deriveAircraftCards(board);

    expect(cards.find((card) => card.tail === "VH-8IA")).toEqual(
      expect.objectContaining({
        apuState: "on",
        apuRuntimeMinutes: 46,
        estimatedFuelKg: 85.9,
        currentReason: expect.objectContaining({
          categoryLabel: "Cleaning in progress",
          detailLabel: "Cleaner onboard",
        }),
        reviewState: expect.objectContaining({
          isReviewDue: true,
          reviewDueAt: "2026-05-22T08:50:00.000Z",
        }),
        sourceCharms: expect.arrayContaining([
          expect.objectContaining({ sourceSystem: "ACMS", confidence: "high" }),
        ]),
      }),
    );
  });

  it("keeps manual APU-off observations pending before trusted ACMS confirmation arrives", () => {
    const board = deriveCurrentBoard(
      bneManualOffConfirmedScenario.events,
      settings,
      "2026-05-22T10:36:00.000Z",
    );
    const cards = deriveAircraftCards(board);

    expect(cards.find((card) => card.tail === "VH-8NJ")).toEqual(
      expect.objectContaining({
        apuState: "on",
        manualOffPending: true,
        urgencyBucket: "manual_off_pending",
        statusLabel: "Manual off pending",
      }),
    );
    expect(board.groundAircraft.find((aircraft) => aircraft.tail === "VH-8NJ")).toEqual(
      expect.objectContaining({
        apuRuntimeMinutes: 33,
        apuEvent: expect.objectContaining({
          state: "open",
        }),
        reasonChain: expect.objectContaining({
          currentReason: expect.objectContaining({
            endedAt: undefined,
          }),
        }),
      }),
    );
  });

  it("uses trusted ACMS off confirmation to close manual pending state officially", () => {
    const board = deriveCurrentBoard(
      bneManualOffConfirmedScenario.events,
      settings,
      "2026-05-22T10:56:00.000Z",
    );
    const cards = deriveAircraftCards(board);

    expect(cards.find((card) => card.tail === "VH-8NJ")).toEqual(
      expect.objectContaining({
        apuState: "off",
        manualOffPending: false,
        urgencyBucket: "apu_off",
        statusLabel: "APU off",
      }),
    );
    expect(board.groundAircraft.find((aircraft) => aircraft.tail === "VH-8NJ")?.apuEvent).toEqual(
      expect.objectContaining({
        endedAt: "2026-05-22T10:37:00.000Z",
        state: "closed",
        closureType: "source_off",
      }),
    );
  });

  it("clears manual pending state when trusted running telemetry contradicts the observation", () => {
    const board = deriveCurrentBoard(
      bneManualOffContradictedScenario.events,
      settings,
      "2026-05-22T11:30:00.000Z",
    );
    const cards = deriveAircraftCards(board);

    expect(cards.find((card) => card.tail === "VH-8XA")).toEqual(
      expect.objectContaining({
        apuState: "on",
        manualOffPending: false,
        urgencyBucket: "active_valid_reason",
        statusLabel: "Current reason",
      }),
    );
    expect(board.groundAircraft.find((aircraft) => aircraft.tail === "VH-8XA")).toEqual(
      expect.objectContaining({
        reasonChain: expect.objectContaining({
          currentReason: expect.objectContaining({
            endedAt: undefined,
          }),
        }),
      }),
    );
  });
});
