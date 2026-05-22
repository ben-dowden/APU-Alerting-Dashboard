import { buildEventId, buildIdempotencyKey } from "@/lib/events";
import type {
  FuelBurnAssumptionsSnapshot,
  FuelPriceSnapshot,
  SettingsChangedEvent,
} from "@/lib/events";

const occurredAt = "2026-05-22T00:00:00.000Z";

export const fuelPriceSettings: SettingsChangedEvent<FuelPriceSnapshot> = {
  eventId: buildEventId("settings_changed", "BNE", "fuel_price", occurredAt),
  eventType: "settings_changed",
  eventVersion: 1,
  sourceSystem: "ADMIN",
  sourceEventId: "fuel-price-v1",
  occurredAt,
  receivedAt: occurredAt,
  correlation: {
    port: "BNE",
    idempotencyKey: buildIdempotencyKey("ADMIN", "fuel-price-v1"),
  },
  quality: {
    confidence: "high",
    idempotencyKey: buildIdempotencyKey("ADMIN", "fuel-price-v1"),
  },
  payload: {
    settingsFamily: "fuel_price",
    settingsVersion: "fuel-price-v1",
    effectiveFrom: occurredAt,
    changedBy: "hq-admin",
    changedAt: occurredAt,
    summary: "Initial HQ-only AUD fuel price assumption for reporting contexts.",
    snapshot: {
      currency: "AUD",
      pricePerKg: 1.18,
      effectivePort: "BNE",
    },
  },
};

export const fuelBurnAssumptionSettings: SettingsChangedEvent<FuelBurnAssumptionsSnapshot> = {
  eventId: buildEventId("settings_changed", "BNE", "fuel_burn_assumptions", occurredAt),
  eventType: "settings_changed",
  eventVersion: 1,
  sourceSystem: "ADMIN",
  sourceEventId: "fuel-burn-assumptions-v1",
  occurredAt,
  receivedAt: occurredAt,
  correlation: {
    port: "BNE",
    idempotencyKey: buildIdempotencyKey("ADMIN", "fuel-burn-assumptions-v1"),
  },
  quality: {
    confidence: "high",
    idempotencyKey: buildIdempotencyKey("ADMIN", "fuel-burn-assumptions-v1"),
  },
  payload: {
    settingsFamily: "fuel_burn_assumptions",
    settingsVersion: "fuel-burn-assumptions-v1",
    effectiveFrom: occurredAt,
    changedBy: "hq-admin",
    changedAt: occurredAt,
    summary: "Initial B738, B38M, B39M and fallback APU fuel burn assumptions.",
    snapshot: {
      assumptions: [
        { equipmentType: "B738", kgPerHour: 112 },
        { equipmentType: "B38M", kgPerHour: 98 },
        { equipmentType: "B39M", kgPerHour: 104 },
        {
          equipmentType: "UNKNOWN",
          kgPerHour: 110,
          isFallback: true,
          fallbackReason: "Configured fallback when equipment type is missing or unmatched.",
        },
      ],
    },
  },
};
