import type { ApuReasonCode, ApuReasonEntry, PrototypeScenarioId } from "../types";

const STORAGE_KEY = "apu-alerting-dashboard:reasons";

type StoredReasons = Record<string, ApuReasonEntry>;

interface ReasonScope {
  date?: Date;
  scenarioId?: PrototypeScenarioId;
}

export const defaultReason: ApuReasonEntry = {
  code: "none",
  note: "",
  updatedAt: "",
};

function todayKey(date = new Date()): string {
  return date.toISOString().slice(0, 10);
}

function storageId(registration: string, scope: ReasonScope = {}): string {
  return `${scope.scenarioId ?? "baseline-night"}:${todayKey(scope.date)}:${registration}`;
}

export function readReason(registration: string, scope: ReasonScope = {}): ApuReasonEntry {
  const stored = window.localStorage.getItem(STORAGE_KEY);
  if (!stored) return defaultReason;
  const reasons = JSON.parse(stored) as StoredReasons;
  return reasons[storageId(registration, scope)] ?? defaultReason;
}

export function writeReason(
  registration: string,
  code: ApuReasonCode,
  note: string,
  scope: ReasonScope = {},
): ApuReasonEntry {
  const stored = window.localStorage.getItem(STORAGE_KEY);
  const reasons = stored ? (JSON.parse(stored) as StoredReasons) : {};
  const entry = { code, note, updatedAt: new Date().toISOString() };
  reasons[storageId(registration, scope)] = entry;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(reasons));
  return entry;
}

export function clearStoredReasons() {
  window.localStorage.removeItem(STORAGE_KEY);
}
