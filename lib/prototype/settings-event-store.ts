import {
  buildEventId,
  buildIdempotencyKey,
  type FuelBurnAssumptionsSnapshot,
  type FuelPriceSnapshot,
  type ReasonTaxonomySnapshot,
  type SettingsChangedEvent,
  type SettingsFamily,
  type SettingsSnapshot,
  type StandCoordinatesSnapshot,
  type TailEquipmentReferenceSnapshot,
  type UrgencyRankingSnapshot,
} from "@/lib/events";
import {
  fuelBurnAssumptionSettings,
  fuelPriceSettings,
} from "@/lib/fixtures/reference/fuel-assumptions";
import { reasonTaxonomySettings } from "@/lib/fixtures/reference/reason-taxonomy";
import { standCoordinateReferenceEvents } from "@/lib/fixtures/reference/stand-coordinates";
import { tailEquipmentReferenceEvents } from "@/lib/fixtures/reference/tail-equipment";
import { urgencyRankingSettings } from "@/lib/fixtures/reference/urgency-ranking";

export const SETTINGS_EVENT_STORAGE_KEY = "apu-alerting-dashboard.settings-events";

export type SettingsSnapshotByFamily = {
  reason_taxonomy: ReasonTaxonomySnapshot;
  fuel_price: FuelPriceSnapshot;
  fuel_burn_assumptions: FuelBurnAssumptionsSnapshot;
  urgency_ranking: UrgencyRankingSnapshot;
  tail_equipment_reference: TailEquipmentReferenceSnapshot;
  stand_coordinates: StandCoordinatesSnapshot;
};

export type SettingsEventByFamily<TFamily extends SettingsFamily> = SettingsChangedEvent<
  SettingsSnapshotByFamily[TFamily]
>;

type BuildSettingsEventInput<TFamily extends SettingsFamily> = {
  family: TFamily;
  previousEvent: SettingsEventByFamily<TFamily>;
  snapshot: SettingsSnapshotByFamily[TFamily];
  changedBy: string;
  changedAt: string;
  summary: string;
  port?: string;
};

let memoryEvents: SettingsChangedEvent[] = [];

const settingsFamilies = new Set<SettingsFamily>([
  "reason_taxonomy",
  "fuel_price",
  "fuel_burn_assumptions",
  "urgency_ranking",
  "tail_equipment_reference",
  "stand_coordinates",
]);

const storage = () => {
  try {
    return globalThis.localStorage;
  } catch {
    return undefined;
  }
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

const isSettingsChangedEvent = (value: unknown): value is SettingsChangedEvent => {
  if (!isRecord(value) || value.eventType !== "settings_changed" || !isRecord(value.payload)) {
    return false;
  }

  return (
    typeof value.payload.settingsFamily === "string" &&
    settingsFamilies.has(value.payload.settingsFamily as SettingsFamily)
  );
};

const parseStoredEvents = (storedEvents: string | null): SettingsChangedEvent[] => {
  if (!storedEvents) {
    return [];
  }

  try {
    const parsed = JSON.parse(storedEvents);
    return Array.isArray(parsed) ? parsed.filter(isSettingsChangedEvent) : [];
  } catch {
    return [];
  }
};

const familyVersionPrefix = (family: SettingsFamily) => family.replaceAll("_", "-");

const nextVersionFor = (family: SettingsFamily, previousVersion?: string) => {
  const prefix = familyVersionPrefix(family);
  const versionMatch = previousVersion?.match(/-v(\d+)$/);
  const nextVersionNumber = versionMatch ? Number(versionMatch[1]) + 1 : 1;

  return `${prefix}-v${nextVersionNumber}`;
};

const buildInitialSettingsEvent = <TFamily extends SettingsFamily>(
  family: TFamily,
  snapshot: SettingsSnapshotByFamily[TFamily],
  summary: string,
): SettingsEventByFamily<TFamily> => {
  const occurredAt = "2026-05-22T00:00:00.000Z";
  const sourceEventId = `${familyVersionPrefix(family)}-v1`;
  const idempotencyKey = buildIdempotencyKey("ADMIN", sourceEventId);

  return {
    eventId: buildEventId("settings_changed", "BNE", family, occurredAt),
    eventType: "settings_changed",
    eventVersion: 1,
    sourceSystem: "ADMIN",
    sourceEventId,
    occurredAt,
    receivedAt: occurredAt,
    correlation: {
      port: "BNE",
      idempotencyKey,
    },
    quality: {
      confidence: "high",
      idempotencyKey,
    },
    payload: {
      settingsFamily: family,
      settingsVersion: `${familyVersionPrefix(family)}-v1`,
      effectiveFrom: occurredAt,
      changedBy: "hq-admin",
      changedAt: occurredAt,
      summary,
      snapshot,
    },
  };
};

const tailEquipmentReferenceSettings = buildInitialSettingsEvent(
  "tail_equipment_reference",
  {
    tails: tailEquipmentReferenceEvents.map((event) => ({
      tail: event.payload.tail,
      equipmentType: event.payload.equipmentType,
      effectiveFrom: event.payload.effectiveFrom,
      effectiveTo: event.payload.effectiveTo,
    })),
  },
  "Initial BNE tail and equipment reference settings.",
);

const standCoordinatesSettings = buildInitialSettingsEvent(
  "stand_coordinates",
  {
    stands: standCoordinateReferenceEvents.map((event) => ({
      port: event.payload.port,
      stand: event.payload.stand,
      bay: event.payload.bay,
      latitude: event.payload.latitude,
      longitude: event.payload.longitude,
    })),
  },
  "Initial BNE stand coordinate reference settings.",
);

export const defaultSettingsEvents = {
  reason_taxonomy: reasonTaxonomySettings,
  fuel_price: fuelPriceSettings,
  fuel_burn_assumptions: fuelBurnAssumptionSettings,
  urgency_ranking: urgencyRankingSettings,
  tail_equipment_reference: tailEquipmentReferenceSettings,
  stand_coordinates: standCoordinatesSettings,
} as const satisfies {
  [TFamily in SettingsFamily]: SettingsEventByFamily<TFamily>;
};

export const readSettingsEvents = (): SettingsChangedEvent[] => {
  const browserStorage = storage();
  if (!browserStorage) {
    return [...memoryEvents];
  }

  return parseStoredEvents(browserStorage.getItem(SETTINGS_EVENT_STORAGE_KEY));
};

export const appendSettingsEvent = (event: SettingsChangedEvent) => {
  const nextEvents = [...readSettingsEvents(), event];
  memoryEvents = nextEvents;

  storage()?.setItem(SETTINGS_EVENT_STORAGE_KEY, JSON.stringify(nextEvents));
};

export const clearSettingsEvents = () => {
  memoryEvents = [];
  storage()?.removeItem(SETTINGS_EVENT_STORAGE_KEY);
};

export const latestSettingsEventFor = <TFamily extends SettingsFamily>(
  family: TFamily,
  events: readonly SettingsChangedEvent[] = readSettingsEvents(),
): SettingsEventByFamily<TFamily> | undefined =>
  [...events]
    .reverse()
    .find((event) => event.payload.settingsFamily === family) as
    | SettingsEventByFamily<TFamily>
    | undefined;

export const currentSettingsEventFor = <TFamily extends SettingsFamily>(
  family: TFamily,
): SettingsEventByFamily<TFamily> =>
  latestSettingsEventFor(family) ?? defaultSettingsEvents[family];

export const buildSettingsChangedEvent = <TFamily extends SettingsFamily>({
  family,
  previousEvent,
  snapshot,
  changedBy,
  changedAt,
  summary,
  port = "BNE",
}: BuildSettingsEventInput<TFamily>): SettingsEventByFamily<TFamily> => {
  const settingsVersion = nextVersionFor(family, previousEvent.payload.settingsVersion);
  const sourceEventId = `${settingsVersion}:${changedAt}`;
  const idempotencyKey = buildIdempotencyKey("ADMIN", sourceEventId);

  return {
    eventId: buildEventId("settings_changed", port, family, changedAt),
    eventType: "settings_changed",
    eventVersion: 1,
    sourceSystem: "ADMIN",
    sourceEventId,
    occurredAt: changedAt,
    receivedAt: changedAt,
    correlation: {
      port,
      idempotencyKey,
    },
    quality: {
      confidence: "high",
      idempotencyKey,
    },
    payload: {
      settingsFamily: family,
      settingsVersion,
      effectiveFrom: changedAt,
      changedBy,
      changedAt,
      summary,
      snapshot: snapshot as SettingsSnapshot,
    },
  } as SettingsEventByFamily<TFamily>;
};
