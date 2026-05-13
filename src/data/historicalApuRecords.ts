import type { ApuReasonCode, AvailabilityState, HistoricalApuRecord, PrototypeScenarioId } from "../types";

interface HistoricalSeed {
  registration: string;
  aircraftType: string;
  port: string;
  bay: string;
  startHour: number;
  durationMinutes: number;
  pcaAvailability: AvailabilityState;
  gpuAvailability: AvailabilityState;
  reasonCode: ApuReasonCode;
}

const monthlySeeds: HistoricalSeed[] = [
  {
    registration: "VH-8IA",
    aircraftType: "737-MAX",
    port: "BNE",
    bay: "Bay 43",
    startHour: 21,
    durationMinutes: 86,
    pcaAvailability: "available",
    gpuAvailability: "available",
    reasonCode: "turnaround-pressure",
  },
  {
    registration: "VH-YIO",
    aircraftType: "737-MAX",
    port: "MEL",
    bay: "Bay 02",
    startHour: 22,
    durationMinutes: 217,
    pcaAvailability: "unavailable",
    gpuAvailability: "available",
    reasonCode: "pca-unavailable",
  },
  {
    registration: "VH-YIB",
    aircraftType: "737-MAX",
    port: "SYD",
    bay: "Bay 39",
    startHour: 20,
    durationMinutes: 93,
    pcaAvailability: "available",
    gpuAvailability: "available",
    reasonCode: "crew-request",
  },
  {
    registration: "VH-8IB",
    aircraftType: "737-800",
    port: "ADL",
    bay: "Bay 15",
    startHour: 19,
    durationMinutes: 69,
    pcaAvailability: "available",
    gpuAvailability: "available",
    reasonCode: "operational-requirement",
  },
  {
    registration: "VH-YIA",
    aircraftType: "737-800",
    port: "PER",
    bay: "Bay 43",
    startHour: 23,
    durationMinutes: 52,
    pcaAvailability: "unavailable",
    gpuAvailability: "available",
    reasonCode: "gpu-unavailable",
  },
  {
    registration: "VH-8IC",
    aircraftType: "737-800",
    port: "BNE",
    bay: "Bay 46",
    startHour: 18,
    durationMinutes: 55,
    pcaAvailability: "available",
    gpuAvailability: "available",
    reasonCode: "maintenance",
  },
  {
    registration: "VH-YIF",
    aircraftType: "737-800",
    port: "MEL",
    bay: "Bay 11",
    startHour: 21,
    durationMinutes: 74,
    pcaAvailability: "available",
    gpuAvailability: "available",
    reasonCode: "weather-cabin-comfort",
  },
  {
    registration: "VH-YIG",
    aircraftType: "737-MAX",
    port: "SYD",
    bay: "Bay 51",
    startHour: 22,
    durationMinutes: 47,
    pcaAvailability: "available",
    gpuAvailability: "unavailable",
    reasonCode: "other",
  },
  {
    registration: "VH-YIH",
    aircraftType: "737-800",
    port: "ADL",
    bay: "Bay 18",
    startHour: 20,
    durationMinutes: 41,
    pcaAvailability: "available",
    gpuAvailability: "available",
    reasonCode: "none",
  },
];

function addMonths(date: Date, monthsBack: number) {
  const copy = new Date(date);
  copy.setUTCMonth(copy.getUTCMonth() - monthsBack);
  return copy;
}

interface HistoricalBuildOptions {
  idPrefix?: string;
  monthCount?: number;
  durationScale?: number;
}

export function buildHistoricalRecords(
  baseDate = new Date("2026-05-07T12:00:00+10:00"),
  seeds = monthlySeeds,
  options: HistoricalBuildOptions = {},
): HistoricalApuRecord[] {
  const records: HistoricalApuRecord[] = [];
  const monthCount = options.monthCount ?? 12;
  const idPrefix = options.idPrefix ?? "hist";
  const durationScale = options.durationScale ?? 1;

  for (let monthOffset = 0; monthOffset < monthCount; monthOffset += 1) {
    seeds.forEach((seed, seedIndex) => {
      const start = addMonths(baseDate, monthOffset);
      start.setUTCDate(Math.max(1, 26 - seedIndex * 2));
      start.setUTCHours(seed.startHour, seedIndex % 2 === 0 ? 10 : 35, 0, 0);
      const durationMinutes = Math.round((seed.durationMinutes + ((monthOffset + seedIndex) % 4) * 8) * durationScale);
      const stop = new Date(start.getTime() + durationMinutes * 60000);

      records.push({
        id: `${idPrefix}-${monthOffset}-${seedIndex}`,
        registration: seed.registration,
        aircraftType: seed.aircraftType,
        port: seed.port,
        bay: seed.bay,
        apuStartedAt: start.toISOString(),
        apuStoppedAt: stop.toISOString(),
        pcaAvailability: seed.pcaAvailability,
        gpuAvailability: seed.gpuAvailability,
        reasonCode: seed.reasonCode,
      });
    });
  }

  return records;
}

const bneHighBurnSeeds: HistoricalSeed[] = [
  ...monthlySeeds.map((seed) => ({
    ...seed,
    port: "BNE",
    bay: seed.port === "BNE" ? seed.bay : `Bay ${seed.bay.replace(/\D/g, "").padStart(2, "0")}`,
    pcaAvailability: "available" as AvailabilityState,
    gpuAvailability: "available" as AvailabilityState,
    durationMinutes: Math.round(seed.durationMinutes * 1.35),
    reasonCode: seed.reasonCode === "none" ? "turnaround-pressure" : seed.reasonCode,
  })),
  {
    registration: "VH-BNE",
    aircraftType: "737-MAX",
    port: "BNE",
    bay: "Bay 54",
    startHour: 23,
    durationMinutes: 185,
    pcaAvailability: "available",
    gpuAvailability: "available",
    reasonCode: "turnaround-pressure",
  },
];

const groundServiceOutageSeeds: HistoricalSeed[] = monthlySeeds.map((seed, index) => ({
  ...seed,
  pcaAvailability: index % 2 === 0 ? "unavailable" : seed.pcaAvailability,
  gpuAvailability: index % 3 === 0 ? "unavailable" : seed.gpuAvailability,
  reasonCode: index % 2 === 0 ? "pca-unavailable" : index % 3 === 0 ? "gpu-unavailable" : seed.reasonCode,
  durationMinutes: Math.round(seed.durationMinutes * 1.15),
}));

const quietNightSeeds: HistoricalSeed[] = monthlySeeds.slice(0, 5).map((seed, index) => ({
  ...seed,
  durationMinutes: Math.max(12, Math.round(seed.durationMinutes * 0.35)),
  reasonCode: index === 0 ? "crew-request" : "none",
}));

const reportingHeavySeeds: HistoricalSeed[] = [
  ...monthlySeeds,
  ...monthlySeeds.map((seed, index) => ({
    ...seed,
    registration: `VH-R${String(index + 1).padStart(2, "0")}`,
    bay: `Bay ${60 + index}`,
    durationMinutes: seed.durationMinutes + 42,
    reasonCode: index % 2 === 0 ? "turnaround-pressure" : seed.reasonCode,
  })),
];

const scenarioHistoricalRecords: Record<PrototypeScenarioId, HistoricalApuRecord[]> = {
  "baseline-night": buildHistoricalRecords(),
  "bne-high-burn": buildHistoricalRecords(new Date("2026-05-07T12:00:00+10:00"), bneHighBurnSeeds, {
    idPrefix: "bne",
  }),
  "ground-service-outage": buildHistoricalRecords(new Date("2026-05-07T12:00:00+10:00"), groundServiceOutageSeeds, {
    idPrefix: "outage",
  }),
  "quiet-night": buildHistoricalRecords(new Date("2026-05-07T12:00:00+10:00"), quietNightSeeds, {
    idPrefix: "quiet",
    durationScale: 0.85,
  }),
  "reporting-heavy": buildHistoricalRecords(new Date("2026-05-07T12:00:00+10:00"), reportingHeavySeeds, {
    idPrefix: "reporting",
  }),
};

export function getHistoricalApuRecords(scenarioId: PrototypeScenarioId): HistoricalApuRecord[] {
  return [...(scenarioHistoricalRecords[scenarioId] ?? scenarioHistoricalRecords["baseline-night"])];
}

export const historicalApuRecords = scenarioHistoricalRecords["baseline-night"];
