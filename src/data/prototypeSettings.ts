import type { PrototypeScenarioId, PrototypeSettings } from "../types";

export const DEFAULT_PROTOTYPE_SETTINGS: PrototypeSettings = {
  scenarioId: "baseline-night",
  speedMultiplier: 1,
  isPaused: false,
};

const STORAGE_KEY = "apu-alerting-dashboard:prototype-settings";
export const speedOptions = [0.5, 1, 2, 4] as const;

interface StorageLike {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

function browserStorage(): StorageLike | undefined {
  return typeof window === "undefined" ? undefined : window.localStorage;
}

function isScenarioId(value: unknown): value is PrototypeScenarioId {
  return (
    value === "baseline-night" ||
    value === "bne-high-burn" ||
    value === "ground-service-outage" ||
    value === "quiet-night" ||
    value === "reporting-heavy"
  );
}

function normaliseSettings(value: Partial<PrototypeSettings> | null | undefined): PrototypeSettings {
  const scenarioId = isScenarioId(value?.scenarioId)
    ? value.scenarioId
    : DEFAULT_PROTOTYPE_SETTINGS.scenarioId;
  const speedMultiplier = speedOptions.includes(value?.speedMultiplier as (typeof speedOptions)[number])
    ? Number(value?.speedMultiplier)
    : DEFAULT_PROTOTYPE_SETTINGS.speedMultiplier;

  return {
    scenarioId,
    speedMultiplier,
    isPaused: Boolean(value?.isPaused),
  };
}

export function readPrototypeSettings(storage = browserStorage()): PrototypeSettings {
  if (!storage) return DEFAULT_PROTOTYPE_SETTINGS;

  try {
    return normaliseSettings(JSON.parse(storage.getItem(STORAGE_KEY) ?? "{}") as Partial<PrototypeSettings>);
  } catch {
    return DEFAULT_PROTOTYPE_SETTINGS;
  }
}

export function writePrototypeSettings(settings: PrototypeSettings, storage = browserStorage()): PrototypeSettings {
  const normalised = normaliseSettings(settings);
  storage?.setItem(STORAGE_KEY, JSON.stringify(normalised));
  return normalised;
}

export function resetPrototypeSettings(storage = browserStorage()): PrototypeSettings {
  storage?.removeItem(STORAGE_KEY);
  return DEFAULT_PROTOTYPE_SETTINGS;
}
