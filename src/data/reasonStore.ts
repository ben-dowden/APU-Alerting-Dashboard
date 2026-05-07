import type { ApuReasonCode, ApuReasonEntry } from "../types";

const STORAGE_KEY = "apu-alerting-dashboard:reasons";

type StoredReasons = Record<string, ApuReasonEntry>;

export const defaultReason: ApuReasonEntry = {
  code: "none",
  note: "",
  updatedAt: "",
};

function todayKey(date = new Date()): string {
  return date.toISOString().slice(0, 10);
}

function storageId(registration: string, dateKey = todayKey()): string {
  return `${dateKey}:${registration}`;
}

export function readReason(registration: string): ApuReasonEntry {
  const stored = window.localStorage.getItem(STORAGE_KEY);
  if (!stored) return defaultReason;
  const reasons = JSON.parse(stored) as StoredReasons;
  return reasons[storageId(registration)] ?? defaultReason;
}

export function writeReason(registration: string, code: ApuReasonCode, note: string): ApuReasonEntry {
  const stored = window.localStorage.getItem(STORAGE_KEY);
  const reasons = stored ? (JSON.parse(stored) as StoredReasons) : {};
  const entry = { code, note, updatedAt: new Date().toISOString() };
  reasons[storageId(registration)] = entry;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(reasons));
  return entry;
}
