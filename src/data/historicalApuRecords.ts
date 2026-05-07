import type { ApuReasonCode, AvailabilityState, HistoricalApuRecord } from "../types";

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

export function buildHistoricalRecords(baseDate = new Date("2026-05-07T12:00:00+10:00")): HistoricalApuRecord[] {
  const records: HistoricalApuRecord[] = [];

  for (let monthOffset = 0; monthOffset < 12; monthOffset += 1) {
    monthlySeeds.forEach((seed, seedIndex) => {
      const start = addMonths(baseDate, monthOffset);
      start.setUTCDate(Math.max(1, 26 - seedIndex * 2));
      start.setUTCHours(seed.startHour, seedIndex % 2 === 0 ? 10 : 35, 0, 0);
      const durationMinutes = seed.durationMinutes + ((monthOffset + seedIndex) % 4) * 8;
      const stop = new Date(start.getTime() + durationMinutes * 60000);

      records.push({
        id: `hist-${monthOffset}-${seedIndex}`,
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

export const historicalApuRecords = buildHistoricalRecords();
