import { beforeEach, describe, expect, it } from "vitest";

import type { FuelPriceSnapshot, SettingsChangedEvent } from "@/lib/events";
import { fuelPriceSettings } from "@/lib/fixtures/reference/fuel-assumptions";

import {
  SETTINGS_EVENT_STORAGE_KEY,
  appendSettingsEvent,
  buildSettingsChangedEvent,
  clearSettingsEvents,
  latestSettingsEventFor,
  readSettingsEvents,
} from "./settings-event-store";

describe("settings-event-store", () => {
  beforeEach(() => {
    clearSettingsEvents();
    localStorage.clear();
  });

  it("hydrates settings_changed events from localStorage and ignores unrelated records", () => {
    const savedEvent = buildSettingsChangedEvent({
      family: "fuel_price",
      previousEvent: fuelPriceSettings,
      snapshot: { currency: "AUD", pricePerKg: 1.32, effectivePort: "BNE" },
      changedBy: "hq-admin",
      changedAt: "2026-05-23T04:00:00.000Z",
      summary: "Updated HQ reporting fuel price.",
    });

    localStorage.setItem(
      SETTINGS_EVENT_STORAGE_KEY,
      JSON.stringify([savedEvent, { eventType: "not_settings_changed" }]),
    );

    expect(readSettingsEvents()).toEqual([savedEvent]);
    expect(latestSettingsEventFor("fuel_price")?.payload.snapshot).toEqual({
      currency: "AUD",
      pricePerKg: 1.32,
      effectivePort: "BNE",
    });
  });

  it("appends events to memory and browser storage", () => {
    const event = buildSettingsChangedEvent({
      family: "fuel_price",
      previousEvent: fuelPriceSettings,
      snapshot: { currency: "AUD", pricePerKg: 1.25 },
      changedBy: "hq-admin",
      changedAt: "2026-05-23T05:00:00.000Z",
      summary: "Updated price.",
    });

    appendSettingsEvent(event);

    expect(readSettingsEvents()).toEqual([event]);
    expect(JSON.parse(localStorage.getItem(SETTINGS_EVENT_STORAGE_KEY) ?? "[]")).toEqual([event]);
  });

  it("builds versioned settings snapshot events from the common envelope", () => {
    const event: SettingsChangedEvent<FuelPriceSnapshot> = buildSettingsChangedEvent({
      family: "fuel_price",
      previousEvent: fuelPriceSettings,
      snapshot: { currency: "AUD", pricePerKg: 1.41, effectivePort: "BNE" },
      changedBy: "hq-admin",
      changedAt: "2026-05-23T06:00:00.000Z",
      summary: "Aligned fuel price with current contract.",
    });

    expect(event.eventType).toBe("settings_changed");
    expect(event.eventVersion).toBe(1);
    expect(event.sourceSystem).toBe("ADMIN");
    expect(event.correlation.port).toBe("BNE");
    expect(event.quality.confidence).toBe("high");
    expect(event.payload.settingsFamily).toBe("fuel_price");
    expect(event.payload.settingsVersion).toBe("fuel-price-v2");
    expect(event.payload.snapshot.pricePerKg).toBe(1.41);
  });
});
