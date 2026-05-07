import type {
  AircraftApuFeedRecord,
  AircraftApuSnapshot,
  ApuReasonEntry,
  AvailabilityState,
  HistoricalApuRecord,
} from "../types";

export const FUEL_KG_PER_HOUR = 105;
export const COST_AUD_PER_HOUR = 160;
export const WATCH_MINUTES = 15;
export const CRITICAL_MINUTES = 30;

const severityWeight: Record<AircraftApuSnapshot["severity"], number> = {
  critical: 3,
  watch: 2,
  normal: 1,
};

export const reasonLabels: Record<string, string> = {
  none: "No reason captured",
  "operational-requirement": "Operational requirement",
  "pca-unavailable": "PCA unavailable",
  "gpu-unavailable": "GPU unavailable",
  maintenance: "Maintenance troubleshooting",
  "weather-cabin-comfort": "Weather / cabin comfort",
  "turnaround-pressure": "Turnaround pressure",
  "crew-request": "Crew request",
  other: "Other",
};

export function minutesBetween(startIso: string, endIso: string): number {
  return Math.max(0, Math.round((Date.parse(endIso) - Date.parse(startIso)) / 60000));
}

export function formatDuration(minutes: number): string {
  const wholeMinutes = Math.round(minutes);
  if (wholeMinutes < 60) return `${wholeMinutes}m`;
  const hours = Math.floor(wholeMinutes / 60);
  const mins = wholeMinutes % 60;
  return mins === 0 ? `${hours}h` : `${hours}h ${mins}m`;
}

export function estimateFuelKg(runtimeMinutes: number): number {
  return Math.round((runtimeMinutes / 60) * FUEL_KG_PER_HOUR);
}

export function estimateCostAud(runtimeMinutes: number): number {
  return Math.round((runtimeMinutes / 60) * COST_AUD_PER_HOUR);
}

export function isGroundServiceAvailable(
  pcaAvailability: AvailabilityState,
  gpuAvailability: AvailabilityState,
): boolean {
  return pcaAvailability === "available" || gpuAvailability === "available";
}

export function getSeverity(record: AircraftApuFeedRecord, runtimeMinutes: number): AircraftApuSnapshot["severity"] {
  if (!record.apuStartedAt) return "normal";
  if (runtimeMinutes >= CRITICAL_MINUTES && isGroundServiceAvailable(record.pcaAvailability, record.gpuAvailability)) {
    return "critical";
  }
  if (runtimeMinutes >= WATCH_MINUTES || record.nextBayMinutes >= 120) return "watch";
  return "normal";
}

export function toSnapshot(
  record: AircraftApuFeedRecord,
  nowIso: string,
  reason: ApuReasonEntry,
): AircraftApuSnapshot {
  const runtimeMinutes = record.apuStartedAt ? minutesBetween(record.apuStartedAt, nowIso) : 0;
  const fuelBurnKg = estimateFuelKg(runtimeMinutes);
  const estimatedCostAud = estimateCostAud(runtimeMinutes);
  const groundServiceAvailable = isGroundServiceAvailable(record.pcaAvailability, record.gpuAvailability);
  const avoidableCostAud = groundServiceAvailable
    ? estimatedCostAud
    : Math.round(estimatedCostAud * 0.25);
  const burnRateAudPerHour = record.apuStartedAt ? COST_AUD_PER_HOUR : 0;
  const avoidableRateAudPerHour = record.apuStartedAt
    ? groundServiceAvailable
      ? COST_AUD_PER_HOUR
      : Math.round(COST_AUD_PER_HOUR * 0.25)
    : 0;

  return {
    ...record,
    lastSeenAt: nowIso,
    apuRunning: Boolean(record.apuStartedAt),
    runtimeMinutes,
    fuelBurnKg,
    estimatedCostAud,
    avoidableCostAud,
    burnRateAudPerHour,
    avoidableRateAudPerHour,
    severity: getSeverity(record, runtimeMinutes),
    reason,
  };
}

export function summarizeSnapshots(snapshots: AircraftApuSnapshot[]) {
  const active = snapshots.filter((snapshot) => snapshot.apuRunning);
  const critical = snapshots.filter((snapshot) => snapshot.severity === "critical");
  const totalCost = active.reduce((sum, snapshot) => sum + snapshot.estimatedCostAud, 0);
  const avoidableCost = active.reduce((sum, snapshot) => sum + snapshot.avoidableCostAud, 0);
  const fuelKg = active.reduce((sum, snapshot) => sum + snapshot.fuelBurnKg, 0);
  const burnRateAudPerHour = active.reduce((sum, snapshot) => sum + snapshot.burnRateAudPerHour, 0);
  const avoidableRateAudPerHour = active.reduce((sum, snapshot) => sum + snapshot.avoidableRateAudPerHour, 0);
  const reasonCaptureCount = active.filter((snapshot) => snapshot.reason.code !== "none").length;

  return {
    aircraftOnGround: snapshots.length,
    activeCount: active.length,
    criticalCount: critical.length,
    totalCost,
    avoidableCost,
    fuelKg,
    burnRateAudPerHour,
    avoidableRateAudPerHour,
    costPerAircraftOnGround: snapshots.length ? Math.round(burnRateAudPerHour / snapshots.length) : 0,
    costPerActiveApuHour: active.length ? Math.round(burnRateAudPerHour / active.length) : 0,
    reasonCaptureRate: active.length ? Math.round((reasonCaptureCount / active.length) * 100) : 100,
  };
}

export function orderSnapshotsByApuRuntime(snapshots: AircraftApuSnapshot[]) {
  return [...snapshots].sort((a, b) => {
    const activeDelta = Number(b.apuRunning) - Number(a.apuRunning);
    if (activeDelta !== 0) return activeDelta;
    const runtimeDelta = b.runtimeMinutes - a.runtimeMinutes;
    if (runtimeDelta !== 0) return runtimeDelta;
    const severityDelta = severityWeight[b.severity] - severityWeight[a.severity];
    if (severityDelta !== 0) return severityDelta;
    const avoidableDelta = b.avoidableRateAudPerHour - a.avoidableRateAudPerHour;
    if (avoidableDelta !== 0) return avoidableDelta;
    return a.registration.localeCompare(b.registration);
  });
}

export function summarizeHistory(records: HistoricalApuRecord[], selectedPort: string) {
  const filtered = selectedPort === "All ports" ? records : records.filter((record) => record.port === selectedPort);
  const totalMinutes = filtered.reduce(
    (sum, record) => sum + minutesBetween(record.apuStartedAt, record.apuStoppedAt),
    0,
  );
  const avoidableMinutes = filtered
    .filter((record) => isGroundServiceAvailable(record.pcaAvailability, record.gpuAvailability))
    .reduce((sum, record) => sum + minutesBetween(record.apuStartedAt, record.apuStoppedAt), 0);
  const reasonCounts = filtered.reduce<Record<string, number>>((counts, record) => {
    counts[record.reasonCode] = (counts[record.reasonCode] ?? 0) + 1;
    return counts;
  }, {});
  const topReason = Object.entries(reasonCounts).sort((a, b) => b[1] - a[1])[0]?.[0] ?? "none";

  return {
    records: filtered,
    totalHours: Number((totalMinutes / 60).toFixed(1)),
    avoidableHours: Number((avoidableMinutes / 60).toFixed(1)),
    estimatedCostAud: estimateCostAud(totalMinutes),
    avoidableCostAud: estimateCostAud(avoidableMinutes),
    topReason,
  };
}
