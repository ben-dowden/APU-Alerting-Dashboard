import type { AircraftApuFeedRecord, AvailabilityState, LiveApuEvent, LiveApuFeed } from "../types";

interface LiveTemplate {
  id: string;
  registration: string;
  aircraftType: string;
  port: string;
  location: string;
  bay: string;
  portTemperatureC: number;
  pcaAvailability: AvailabilityState;
  gpuAvailability: AvailabilityState;
  nextBayMinutes: number;
  baseRuntimeMinutes: number;
  startsAtMinute?: number;
  pcaAvailableAtMinute?: number;
  gpuAvailableAtMinute?: number;
}

const liveTemplates: LiveTemplate[] = [
  {
    id: "VH-8IA",
    registration: "VH-8IA",
    aircraftType: "737-MAX",
    port: "BNE",
    location: "Brisbane Domestic",
    bay: "Bay 43",
    portTemperatureC: 29,
    pcaAvailability: "available",
    gpuAvailability: "available",
    nextBayMinutes: 180,
    baseRuntimeMinutes: 54,
  },
  {
    id: "VH-8IB",
    registration: "VH-8IB",
    aircraftType: "737-800",
    port: "ADL",
    location: "Adelaide Domestic",
    bay: "Bay 15",
    portTemperatureC: 24,
    pcaAvailability: "available",
    gpuAvailability: "available",
    nextBayMinutes: 62,
    baseRuntimeMinutes: 0,
    startsAtMinute: 8,
  },
  {
    id: "VH-8IC",
    registration: "VH-8IC",
    aircraftType: "737-800",
    port: "BNE",
    location: "Brisbane Domestic",
    bay: "Bay 46",
    portTemperatureC: 29,
    pcaAvailability: "available",
    gpuAvailability: "available",
    nextBayMinutes: 45,
    baseRuntimeMinutes: 29,
  },
  {
    id: "VH-YIA",
    registration: "VH-YIA",
    aircraftType: "737-800",
    port: "PER",
    location: "Perth Domestic",
    bay: "Bay 43",
    portTemperatureC: 16,
    pcaAvailability: "unavailable",
    gpuAvailability: "available",
    nextBayMinutes: 15,
    baseRuntimeMinutes: 18,
  },
  {
    id: "VH-YIB",
    registration: "VH-YIB",
    aircraftType: "737-MAX",
    port: "SYD",
    location: "Sydney Domestic",
    bay: "Bay 39",
    portTemperatureC: 24,
    pcaAvailability: "available",
    gpuAvailability: "available",
    nextBayMinutes: 20,
    baseRuntimeMinutes: 0,
    startsAtMinute: 28,
  },
  {
    id: "VH-YIO",
    registration: "VH-YIO",
    aircraftType: "737-MAX",
    port: "MEL",
    location: "Melbourne Domestic",
    bay: "Bay 02",
    portTemperatureC: 18,
    pcaAvailability: "unavailable",
    gpuAvailability: "available",
    nextBayMinutes: 240,
    baseRuntimeMinutes: 76,
    pcaAvailableAtMinute: 35,
  },
];

const timelineEvents = [
  {
    minute: 0,
    port: "All",
    tone: "info",
    message: "Night shift demo started",
    detail: "Simulating 21:00-22:00 with ACMS timestamp updates every 15 seconds.",
  },
  {
    minute: 5,
    port: "BNE",
    registration: "VH-8IA",
    tone: "critical",
    message: "APU burn already exceeds threshold",
    detail: "PCA and GPU are available at Bay 43. Reason capture required.",
  },
  {
    minute: 10,
    port: "ADL",
    registration: "VH-8IB",
    tone: "watch",
    message: "APU start detected",
    detail: "Aircraft is on bay for another hour; monitor if burn reaches 30 minutes.",
  },
  {
    minute: 20,
    port: "PER",
    registration: "VH-YIA",
    tone: "watch",
    message: "PCA unavailable",
    detail: "GPU remains available, so avoidable burn estimate is reduced but still tracked.",
  },
  {
    minute: 30,
    port: "BNE",
    registration: "VH-8IC",
    tone: "critical",
    message: "APU crossed 30 minutes",
    detail: "Both ground services are available. This is now a priority opportunity.",
  },
  {
    minute: 35,
    port: "MEL",
    registration: "VH-YIO",
    tone: "success",
    message: "PCA restored at Bay 02",
    detail: "MEL opportunity now moves to full avoidable burn rate.",
  },
  {
    minute: 45,
    port: "SYD",
    registration: "VH-YIB",
    tone: "watch",
    message: "New long-turn APU run",
    detail: "Aircraft started APU while GPU and PCA are available.",
  },
  {
    minute: 55,
    port: "MEL",
    registration: "VH-YIO",
    tone: "critical",
    message: "MEL overnight risk escalated",
    detail: "Runtime exceeds two hours with ground service now available.",
  },
] satisfies Omit<LiveApuEvent, "id" | "timeLabel">[];

function demoClockLabel(demoMinute: number) {
  const elapsedSeconds = Math.round(demoMinute * 60);
  const hour = 21 + Math.floor(elapsedSeconds / 3600);
  const minute = Math.floor((elapsedSeconds % 3600) / 60);
  const second = elapsedSeconds % 60;
  return `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}:${String(second).padStart(2, "0")}`;
}

function runtimeForTemplate(template: LiveTemplate, demoMinute: number) {
  if (template.baseRuntimeMinutes > 0) return template.baseRuntimeMinutes + demoMinute;
  if (template.startsAtMinute === undefined || demoMinute < template.startsAtMinute) return 0;
  return demoMinute - template.startsAtMinute;
}

function availabilityAtMinute(
  base: AvailabilityState,
  availableAtMinute: number | undefined,
  demoMinute: number,
): AvailabilityState {
  if (availableAtMinute === undefined) return base;
  return demoMinute >= availableAtMinute ? "available" : base;
}

export async function fetchLiveApuFeed(now = new Date(), demoMinute = 0): Promise<LiveApuFeed> {
  const nowMs = now.getTime();
  const records = liveTemplates.map((template) => {
    const runtimeMinutes = runtimeForTemplate(template, demoMinute);
    const apuStartedAt = runtimeMinutes > 0 ? new Date(nowMs - runtimeMinutes * 60000).toISOString() : null;
    const scheduledDepartureAt = new Date(nowMs + Math.max(0, template.nextBayMinutes - demoMinute) * 60000).toISOString();
    const pcaAvailability = availabilityAtMinute(template.pcaAvailability, template.pcaAvailableAtMinute, demoMinute);
    const gpuAvailability = availabilityAtMinute(template.gpuAvailability, template.gpuAvailableAtMinute, demoMinute);

    return {
      ...template,
      nextBayMinutes: Math.max(0, template.nextBayMinutes - demoMinute),
      pcaAvailability,
      gpuAvailability,
      apuStartedAt,
      scheduledDepartureAt,
      lastSeenAt: now.toISOString(),
    };
  });

  const events = timelineEvents
    .filter((event) => event.minute <= demoMinute)
    .map((event, index) => ({
      ...event,
      id: `${event.minute}-${event.port}-${event.registration ?? index}`,
      timeLabel: demoClockLabel(event.minute),
    }))
    .sort((a, b) => b.minute - a.minute);

  return {
    records,
    events,
    demoMinute,
    demoClockLabel: demoClockLabel(demoMinute),
  };
}
