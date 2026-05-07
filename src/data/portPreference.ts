const STORAGE_KEY = "apu-alerting-dashboard:selected-port";

export const portOptions = ["All", "BNE", "SYD", "MEL", "ADL", "PER"] as const;

export type PortOption = (typeof portOptions)[number];

export function readPortPreference(): PortOption {
  const stored = window.localStorage.getItem(STORAGE_KEY);
  return portOptions.includes(stored as PortOption) ? (stored as PortOption) : "All";
}

export function writePortPreference(port: PortOption) {
  window.localStorage.setItem(STORAGE_KEY, port);
}
