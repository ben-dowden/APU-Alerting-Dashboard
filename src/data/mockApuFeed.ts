import type {
  AircraftApuFeedRecord,
  AvailabilityState,
  LiveApuEvent,
  LiveApuFeed,
  PrototypeScenario,
  PrototypeScenarioId,
} from "../types";

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
  {
    id: "VH-8ID",
    registration: "VH-8ID",
    aircraftType: "737-800",
    port: "BNE",
    location: "Brisbane Domestic",
    bay: "Bay 22",
    portTemperatureC: 28,
    pcaAvailability: "available",
    gpuAvailability: "unavailable",
    nextBayMinutes: 95,
    baseRuntimeMinutes: 0,
    startsAtMinute: 18,
  },
  {
    id: "VH-YIJ",
    registration: "VH-YIJ",
    aircraftType: "737-800",
    port: "MEL",
    location: "Melbourne Domestic",
    bay: "Bay 06",
    portTemperatureC: 17,
    pcaAvailability: "available",
    gpuAvailability: "available",
    nextBayMinutes: 110,
    baseRuntimeMinutes: 34,
  },
  {
    id: "VH-YIK",
    registration: "VH-YIK",
    aircraftType: "737-MAX",
    port: "PER",
    location: "Perth Domestic",
    bay: "Bay 48",
    portTemperatureC: 15,
    pcaAvailability: "available",
    gpuAvailability: "available",
    nextBayMinutes: 155,
    baseRuntimeMinutes: 42,
  },
  {
    id: "VH-YIL",
    registration: "VH-YIL",
    aircraftType: "737-800",
    port: "SYD",
    location: "Sydney Domestic",
    bay: "Bay 34",
    portTemperatureC: 23,
    pcaAvailability: "available",
    gpuAvailability: "available",
    nextBayMinutes: 75,
    baseRuntimeMinutes: 0,
  },
  {
    id: "VH-8IE",
    registration: "VH-8IE",
    aircraftType: "737-MAX",
    port: "ADL",
    location: "Adelaide Domestic",
    bay: "Bay 12",
    portTemperatureC: 23,
    pcaAvailability: "unavailable",
    gpuAvailability: "available",
    nextBayMinutes: 130,
    baseRuntimeMinutes: 61,
    pcaAvailableAtMinute: 24,
  },
  {
    id: "VH-YIM",
    registration: "VH-YIM",
    aircraftType: "737-800",
    port: "BNE",
    location: "Brisbane Domestic",
    bay: "Bay 31",
    portTemperatureC: 29,
    pcaAvailability: "available",
    gpuAvailability: "available",
    nextBayMinutes: 35,
    baseRuntimeMinutes: 12,
  },
  {
    id: "VH-YIN",
    registration: "VH-YIN",
    aircraftType: "737-MAX",
    port: "MEL",
    location: "Melbourne Domestic",
    bay: "Bay 21",
    portTemperatureC: 18,
    pcaAvailability: "available",
    gpuAvailability: "available",
    nextBayMinutes: 205,
    baseRuntimeMinutes: 0,
    startsAtMinute: 40,
  },
  {
    id: "VH-YIP",
    registration: "VH-YIP",
    aircraftType: "737-800",
    port: "PER",
    location: "Perth Domestic",
    bay: "Bay 52",
    portTemperatureC: 16,
    pcaAvailability: "unavailable",
    gpuAvailability: "available",
    nextBayMinutes: 50,
    baseRuntimeMinutes: 0,
  },
  {
    id: "VH-8IF",
    registration: "VH-8IF",
    aircraftType: "737-MAX",
    port: "SYD",
    location: "Sydney Domestic",
    bay: "Bay 27",
    portTemperatureC: 24,
    pcaAvailability: "available",
    gpuAvailability: "unavailable",
    nextBayMinutes: 140,
    baseRuntimeMinutes: 23,
    gpuAvailableAtMinute: 32,
  },
  {
    id: "VH-8IG",
    registration: "VH-8IG",
    aircraftType: "737-800",
    port: "ADL",
    location: "Adelaide Domestic",
    bay: "Bay 19",
    portTemperatureC: 22,
    pcaAvailability: "available",
    gpuAvailability: "available",
    nextBayMinutes: 80,
    baseRuntimeMinutes: 0,
  },
  {
    id: "VH-YIQ",
    registration: "VH-YIQ",
    aircraftType: "737-MAX",
    port: "BNE",
    location: "Brisbane Domestic",
    bay: "Bay 17",
    portTemperatureC: 28,
    pcaAvailability: "available",
    gpuAvailability: "available",
    nextBayMinutes: 260,
    baseRuntimeMinutes: 88,
  },
  {
    id: "VH-YIR",
    registration: "VH-YIR",
    aircraftType: "737-800",
    port: "MEL",
    location: "Melbourne Domestic",
    bay: "Bay 13",
    portTemperatureC: 17,
    pcaAvailability: "available",
    gpuAvailability: "available",
    nextBayMinutes: 65,
    baseRuntimeMinutes: 0,
  },
];

const timelineEvents = [
  {
    minute: 0,
    port: "All",
    tone: "info",
    message: "Night shift demo started",
    detail: "Simulating 21:00 to 22:00, with ACMS timestamp updates every 15 seconds.",
  },
  {
    minute: 5,
    port: "BNE",
    registration: "VH-8IA",
    tone: "critical",
    message: "APU burn exceeds threshold",
    detail: "PCA and GPU are available at Bay 43. Reason capture required.",
  },
  {
    minute: 10,
    port: "ADL",
    registration: "VH-8IB",
    tone: "watch",
    message: "APU start detected",
    detail: "Aircraft remains on bay for another hour; monitor if runtime reaches 30 minutes.",
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
    detail: "MEL opportunity is now at the full avoidable burn rate.",
  },
  {
    minute: 45,
    port: "SYD",
    registration: "VH-YIB",
    tone: "watch",
    message: "Long-turn APU run started",
    detail: "Aircraft started its APU while GPU and PCA are available.",
  },
  {
    minute: 55,
    port: "MEL",
    registration: "VH-YIO",
    tone: "critical",
    message: "MEL overnight risk has escalated",
    detail: "Runtime exceeds two hours with ground service now available.",
  },
] satisfies Omit<LiveApuEvent, "id" | "timeLabel">[];

export const prototypeScenarios: PrototypeScenario[] = [
  {
    id: "baseline-night",
    name: "Baseline night",
    description: "Current mixed-port night operations demo.",
  },
  {
    id: "bne-high-burn",
    name: "BNE high burn",
    description: "Concentrated Brisbane APU opportunities for leadership walkthroughs.",
  },
  {
    id: "ground-service-outage",
    name: "Ground-service outage",
    description: "PCA/GPU disruption and recovery across the night shift.",
  },
  {
    id: "quiet-night",
    name: "Quiet night",
    description: "Low-alert view for empty states and mobile layout checks.",
  },
  {
    id: "reporting-heavy",
    name: "Reporting heavy",
    description: "Normal live feed with richer historical reporting data.",
  },
];

function buildBneHighBurnTemplates(): LiveTemplate[] {
  return liveTemplates.map((template, index) =>
    index < 9
      ? {
          ...template,
          id: `BNE-${template.registration}`,
          port: "BNE",
          location: "Brisbane Domestic",
          bay: `Bay ${String(32 + index).padStart(2, "0")}`,
          portTemperatureC: 30,
          pcaAvailability: "available",
          gpuAvailability: "available",
          nextBayMinutes: Math.max(template.nextBayMinutes, 130),
          baseRuntimeMinutes: Math.max(template.baseRuntimeMinutes, 42 + index * 6),
          startsAtMinute: undefined,
          pcaAvailableAtMinute: undefined,
          gpuAvailableAtMinute: undefined,
        }
      : template,
  );
}

function buildGroundServiceOutageTemplates(): LiveTemplate[] {
  return liveTemplates.map((template, index) =>
    index % 3 === 0
      ? {
          ...template,
          pcaAvailability: "unavailable",
          gpuAvailability: "unavailable",
          pcaAvailableAtMinute: 38,
          gpuAvailableAtMinute: 48,
          baseRuntimeMinutes: Math.max(template.baseRuntimeMinutes, 24 + index * 3),
          startsAtMinute: undefined,
        }
      : {
          ...template,
          gpuAvailability: index % 2 === 0 ? "unavailable" : template.gpuAvailability,
          gpuAvailableAtMinute: index % 2 === 0 ? 42 : template.gpuAvailableAtMinute,
        },
  );
}

function buildQuietNightTemplates(): LiveTemplate[] {
  return liveTemplates.slice(0, 10).map((template, index) => ({
    ...template,
    pcaAvailability: "available",
    gpuAvailability: "available",
    pcaAvailableAtMinute: undefined,
    gpuAvailableAtMinute: undefined,
    baseRuntimeMinutes: index < 2 ? 6 + index * 4 : 0,
    startsAtMinute: index === 2 ? 46 : undefined,
    nextBayMinutes: Math.min(template.nextBayMinutes, 95),
  }));
}

const liveTemplateScenarios: Record<PrototypeScenarioId, LiveTemplate[]> = {
  "baseline-night": liveTemplates,
  "bne-high-burn": buildBneHighBurnTemplates(),
  "ground-service-outage": buildGroundServiceOutageTemplates(),
  "quiet-night": buildQuietNightTemplates(),
  "reporting-heavy": liveTemplates,
};

const bneHighBurnEvents: Omit<LiveApuEvent, "id" | "timeLabel">[] = [
  {
    minute: 0,
    port: "BNE",
    tone: "info",
    message: "BNE concentration scenario started",
    detail: "Most active APU opportunities are clustered around Brisbane Domestic.",
  },
  {
    minute: 8,
    port: "BNE",
    registration: "VH-8IA",
    tone: "critical",
    message: "Multiple BNE APUs above threshold",
    detail: "Ground services are available and reason capture should be prioritised.",
  },
  {
    minute: 26,
    port: "BNE",
    registration: "VH-YIK",
    tone: "critical",
    message: "High burn-rate concentration",
    detail: "The live BNE burn rate is well above the historical benchmark.",
  },
];

const groundServiceOutageEvents: Omit<LiveApuEvent, "id" | "timeLabel">[] = [
  {
    minute: 0,
    port: "All",
    tone: "watch",
    message: "Ground-service disruption started",
    detail: "Selected PCA/GPU services are unavailable early in the demo timeline.",
  },
  {
    minute: 38,
    port: "All",
    tone: "success",
    message: "PCA services recovering",
    detail: "Recovered PCA availability changes several alerts into avoidable opportunities.",
  },
  {
    minute: 48,
    port: "All",
    tone: "success",
    message: "GPU services recovering",
    detail: "GPU recovery is reflected in the live aircraft cards.",
  },
];

const quietNightEvents: Omit<LiveApuEvent, "id" | "timeLabel">[] = [
  {
    minute: 0,
    port: "All",
    tone: "success",
    message: "Quiet night scenario started",
    detail: "Only a small number of aircraft have active APU burn.",
  },
  {
    minute: 46,
    port: "BNE",
    registration: "VH-8IC",
    tone: "watch",
    message: "Late APU start detected",
    detail: "This single watch item keeps the low-volume state realistic.",
  },
];

function eventsForScenario(scenarioId: PrototypeScenarioId): Omit<LiveApuEvent, "id" | "timeLabel">[] {
  if (scenarioId === "bne-high-burn") return bneHighBurnEvents;
  if (scenarioId === "ground-service-outage") return groundServiceOutageEvents;
  if (scenarioId === "quiet-night") return quietNightEvents;
  return timelineEvents;
}

function templatesForScenario(scenarioId: PrototypeScenarioId): LiveTemplate[] {
  return liveTemplateScenarios[scenarioId] ?? liveTemplates;
}

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

export async function fetchLiveApuFeed(
  now = new Date(),
  demoMinute = 0,
  scenarioId: PrototypeScenarioId = "baseline-night",
): Promise<LiveApuFeed> {
  const nowMs = now.getTime();
  const records = templatesForScenario(scenarioId).map((template) => {
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

  const events = eventsForScenario(scenarioId)
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
