import type { EventQuality } from "@/lib/events";

import type { ScenarioEvent, ScenarioFixture } from "./builders";
import {
  apuStateEvent,
  flightStateEvent,
  manualApuOffObservedEvent,
  reasonSelectedEvent,
  standAssignmentEvent,
  weatherObservationEvent,
} from "./builders";

type BaselineReasonSeed = {
  reasonSegmentId: string;
  categoryId: string;
  categoryLabel: string;
  detailId: string;
  detailLabel: string;
  selectedAt: string;
};

type BaselineStandSeed = {
  bay: string;
  stand: string;
  assignmentState?: "planned" | "current" | "stale" | "released";
  validFrom?: string;
  occurredAt?: string;
  receivedAt?: string;
  sourceUpdatedAt?: string;
  quality?: Partial<EventQuality>;
};

type BaselineAircraftSeed = {
  tail: string;
  aircraftType: string;
  flightNumber: string;
  arrivalFlightNumber: string;
  departureFlightNumber: string;
  origin: string;
  destination: string;
  gateState: "on_ground" | "turnaround";
  onGroundAt: string;
  flightStateAt: string;
  flightReceivedAt: string;
  stand?: BaselineStandSeed;
  apuOnAt?: string;
  apuOnReceivedAt?: string;
  apuOffAt?: string;
  apuOffReceivedAt?: string;
  sourceLatencyMinutes?: number;
  reason?: BaselineReasonSeed;
  manualOffObservedAt?: string;
  manualOffReceivedAt?: string;
};

const actorId = "senior-engineer-bne";

const reasons = {
  cleaningCleanerOnboard: {
    categoryId: "cleaning-in-progress",
    categoryLabel: "Cleaning in progress",
    detailId: "cleaner-onboard",
    detailLabel: "Cleaner onboard",
  },
  cleaningCabinPrep: {
    categoryId: "cleaning-in-progress",
    categoryLabel: "Cleaning in progress",
    detailId: "cabin-preparation-in-progress",
    detailLabel: "Cabin preparation in progress",
  },
  pcaUnavailable: {
    categoryId: "infrastructure-unavailable",
    categoryLabel: "Infrastructure unavailable",
    detailId: "pca-unavailable",
    detailLabel: "PCA unavailable",
  },
  gpuUnavailable: {
    categoryId: "infrastructure-unavailable",
    categoryLabel: "Infrastructure unavailable",
    detailId: "gpu-unavailable",
    detailLabel: "GPU unavailable",
  },
  maintenanceTask: {
    categoryId: "engineering-requirement",
    categoryLabel: "Engineering requirement",
    detailId: "maintenance-task-in-progress",
    detailLabel: "Maintenance task in progress",
  },
  defectInvestigation: {
    categoryId: "engineering-requirement",
    categoryLabel: "Engineering requirement",
    detailId: "defect-investigation",
    detailLabel: "Defect investigation",
  },
  pilotDiscretion: {
    categoryId: "flight-operations-pilot-discretion",
    categoryLabel: "Flight operations / pilot discretion",
    detailId: "pilot-discretion",
    detailLabel: "Pilot discretion",
  },
  crewComfort: {
    categoryId: "flight-operations-pilot-discretion",
    categoryLabel: "Flight operations / pilot discretion",
    detailId: "crew-comfort-request",
    detailLabel: "Crew comfort request",
  },
  agentOnWay: {
    categoryId: "logistics-agent-on-the-way",
    categoryLabel: "Logistics / agent on the way",
    detailId: "agent-on-the-way",
    detailLabel: "Agent on the way",
  },
  equipmentOnWay: {
    categoryId: "logistics-agent-on-the-way",
    categoryLabel: "Logistics / agent on the way",
    detailId: "equipment-on-the-way",
    detailLabel: "Equipment on the way",
  },
} as const;

const reasonSeed = (
  reason: Omit<BaselineReasonSeed, "reasonSegmentId" | "selectedAt">,
  reasonSegmentId: string,
  selectedAt: string,
): BaselineReasonSeed => ({
  ...reason,
  reasonSegmentId,
  selectedAt,
});

const baselineAircraft: BaselineAircraftSeed[] = [
  {
    tail: "VH-8IA",
    aircraftType: "B738",
    flightNumber: "VA938",
    arrivalFlightNumber: "VA938",
    departureFlightNumber: "VA327",
    origin: "SYD",
    destination: "MEL",
    gateState: "on_ground",
    onGroundAt: "2026-05-22T08:00:00.000Z",
    flightStateAt: "2026-05-22T08:00:00.000Z",
    flightReceivedAt: "2026-05-22T08:00:15.000Z",
    stand: { bay: "Bay 20", stand: "20" },
    apuOnAt: "2026-05-22T08:09:00.000Z",
    apuOnReceivedAt: "2026-05-22T08:10:00.000Z",
    sourceLatencyMinutes: 1,
    reason: reasonSeed(reasons.cleaningCleanerOnboard, "reason:VH-8IA:001", "2026-05-22T08:20:00.000Z"),
  },
  {
    tail: "VH-YFX",
    aircraftType: "B738",
    flightNumber: "VA120",
    arrivalFlightNumber: "VA120",
    departureFlightNumber: "VA412",
    origin: "MEL",
    destination: "SYD",
    gateState: "turnaround",
    onGroundAt: "2026-05-22T08:05:00.000Z",
    flightStateAt: "2026-05-22T08:21:00.000Z",
    flightReceivedAt: "2026-05-22T08:21:05.000Z",
    stand: { bay: "Bay 21", stand: "21" },
    apuOffAt: "2026-05-22T08:24:00.000Z",
    apuOffReceivedAt: "2026-05-22T08:24:30.000Z",
  },
  {
    tail: "VH-VUK",
    aircraftType: "B738",
    flightNumber: "VA950",
    arrivalFlightNumber: "VA950",
    departureFlightNumber: "VA346",
    origin: "SYD",
    destination: "CNS",
    gateState: "on_ground",
    onGroundAt: "2026-05-22T07:35:00.000Z",
    flightStateAt: "2026-05-22T07:35:00.000Z",
    flightReceivedAt: "2026-05-22T07:35:30.000Z",
    stand: { bay: "Bay 22", stand: "22" },
    apuOnAt: "2026-05-22T07:58:00.000Z",
    apuOnReceivedAt: "2026-05-22T07:58:45.000Z",
  },
  {
    tail: "VH-YQO",
    aircraftType: "B738",
    flightNumber: "VA324",
    arrivalFlightNumber: "VA324",
    departureFlightNumber: "VA771",
    origin: "ADL",
    destination: "MEL",
    gateState: "turnaround",
    onGroundAt: "2026-05-22T07:52:00.000Z",
    flightStateAt: "2026-05-22T07:52:00.000Z",
    flightReceivedAt: "2026-05-22T07:52:30.000Z",
    stand: { bay: "Bay 23", stand: "23" },
    apuOnAt: "2026-05-22T08:12:00.000Z",
    apuOnReceivedAt: "2026-05-22T08:12:45.000Z",
  },
  {
    tail: "VH-8NJ",
    aircraftType: "B38M",
    flightNumber: "VA721",
    arrivalFlightNumber: "VA721",
    departureFlightNumber: "VA951",
    origin: "HBA",
    destination: "SYD",
    gateState: "on_ground",
    onGroundAt: "2026-05-22T07:55:00.000Z",
    flightStateAt: "2026-05-22T07:55:00.000Z",
    flightReceivedAt: "2026-05-22T07:55:20.000Z",
    stand: { bay: "Bay 24", stand: "24" },
    apuOnAt: "2026-05-22T08:22:00.000Z",
    apuOnReceivedAt: "2026-05-22T08:22:30.000Z",
    reason: reasonSeed(reasons.gpuUnavailable, "reason:VH-8NJ:001", "2026-05-22T08:28:00.000Z"),
    manualOffObservedAt: "2026-05-22T08:43:00.000Z",
    manualOffReceivedAt: "2026-05-22T08:43:05.000Z",
  },
  {
    tail: "VH-VUY",
    aircraftType: "B738",
    flightNumber: "VA614",
    arrivalFlightNumber: "VA614",
    departureFlightNumber: "VA617",
    origin: "PER",
    destination: "MKY",
    gateState: "on_ground",
    onGroundAt: "2026-05-22T07:15:00.000Z",
    flightStateAt: "2026-05-22T07:15:00.000Z",
    flightReceivedAt: "2026-05-22T07:15:45.000Z",
    stand: { bay: "Bay 17", stand: "17" },
    apuOnAt: "2026-05-22T07:42:00.000Z",
    apuOnReceivedAt: "2026-05-22T07:43:00.000Z",
  },
  {
    tail: "VH-YIT",
    aircraftType: "B738",
    flightNumber: "VA908",
    arrivalFlightNumber: "VA908",
    departureFlightNumber: "VA1245",
    origin: "CBR",
    destination: "ROK",
    gateState: "turnaround",
    onGroundAt: "2026-05-22T08:08:00.000Z",
    flightStateAt: "2026-05-22T08:08:00.000Z",
    flightReceivedAt: "2026-05-22T08:08:30.000Z",
    stand: { bay: "Bay 18", stand: "18" },
    apuOnAt: "2026-05-22T08:33:00.000Z",
    apuOnReceivedAt: "2026-05-22T08:40:00.000Z",
    sourceLatencyMinutes: 7,
    reason: reasonSeed(reasons.crewComfort, "reason:VH-YIT:001", "2026-05-22T08:35:00.000Z"),
  },
  {
    tail: "VH-YFW",
    aircraftType: "B738",
    flightNumber: "VA734",
    arrivalFlightNumber: "VA734",
    departureFlightNumber: "VA1388",
    origin: "CNS",
    destination: "MEL",
    gateState: "turnaround",
    onGroundAt: "2026-05-22T08:18:00.000Z",
    flightStateAt: "2026-05-22T08:18:00.000Z",
    flightReceivedAt: "2026-05-22T08:18:20.000Z",
    stand: { bay: "Bay 19", stand: "19" },
    apuOnAt: "2026-05-22T08:30:00.000Z",
    apuOnReceivedAt: "2026-05-22T08:30:50.000Z",
  },
  {
    tail: "VH-VOP",
    aircraftType: "B738",
    flightNumber: "VA742",
    arrivalFlightNumber: "VA742",
    departureFlightNumber: "VA1491",
    origin: "TSV",
    destination: "DRW",
    gateState: "on_ground",
    onGroundAt: "2026-05-22T07:05:00.000Z",
    flightStateAt: "2026-05-22T07:05:00.000Z",
    flightReceivedAt: "2026-05-22T07:05:50.000Z",
    stand: {
      bay: "Bay 25",
      stand: "25",
      assignmentState: "stale",
      sourceUpdatedAt: "2026-05-22T06:35:00.000Z",
      occurredAt: "2026-05-22T06:35:00.000Z",
      receivedAt: "2026-05-22T08:16:00.000Z",
      quality: {
        confidence: "low",
        isStale: true,
      },
    },
    apuOnAt: "2026-05-22T07:38:00.000Z",
    apuOnReceivedAt: "2026-05-22T07:39:00.000Z",
    reason: reasonSeed(reasons.pcaUnavailable, "reason:VH-VOP:001", "2026-05-22T08:10:00.000Z"),
  },
  {
    tail: "VH-VUL",
    aircraftType: "B738",
    flightNumber: "VA511",
    arrivalFlightNumber: "VA511",
    departureFlightNumber: "VA522",
    origin: "OOL",
    destination: "SYD",
    gateState: "turnaround",
    onGroundAt: "2026-05-22T08:20:00.000Z",
    flightStateAt: "2026-05-22T08:20:00.000Z",
    flightReceivedAt: "2026-05-22T08:20:30.000Z",
    stand: { bay: "Bay 21", stand: "21" },
    apuOnAt: "2026-05-22T08:42:00.000Z",
    apuOnReceivedAt: "2026-05-22T08:42:30.000Z",
    reason: reasonSeed(reasons.agentOnWay, "reason:VH-VUL:001", "2026-05-22T08:45:00.000Z"),
  },
  {
    tail: "VH-8FE",
    aircraftType: "B38M",
    flightNumber: "VA1402",
    arrivalFlightNumber: "VA1402",
    departureFlightNumber: "VA962",
    origin: "MCY",
    destination: "SYD",
    gateState: "on_ground",
    onGroundAt: "2026-05-22T08:22:00.000Z",
    flightStateAt: "2026-05-22T08:22:00.000Z",
    flightReceivedAt: "2026-05-22T08:22:20.000Z",
    stand: { bay: "Bay 22", stand: "22" },
    apuOnAt: "2026-05-22T08:40:00.000Z",
    apuOnReceivedAt: "2026-05-22T08:41:00.000Z",
  },
  {
    tail: "VH-YVA",
    aircraftType: "B738",
    flightNumber: "VA376",
    arrivalFlightNumber: "VA376",
    departureFlightNumber: "VA983",
    origin: "MEL",
    destination: "CNS",
    gateState: "turnaround",
    onGroundAt: "2026-05-22T08:04:00.000Z",
    flightStateAt: "2026-05-22T08:04:00.000Z",
    flightReceivedAt: "2026-05-22T08:04:35.000Z",
    stand: { bay: "Bay 23", stand: "23" },
    apuOnAt: "2026-05-22T08:26:00.000Z",
    apuOnReceivedAt: "2026-05-22T08:26:50.000Z",
    reason: reasonSeed(reasons.cleaningCabinPrep, "reason:VH-YVA:001", "2026-05-22T08:33:00.000Z"),
  },
  {
    tail: "VH-VUT",
    aircraftType: "B738",
    flightNumber: "VA701",
    arrivalFlightNumber: "VA701",
    departureFlightNumber: "VA712",
    origin: "HBA",
    destination: "ADL",
    gateState: "on_ground",
    onGroundAt: "2026-05-22T07:25:00.000Z",
    flightStateAt: "2026-05-22T07:25:00.000Z",
    flightReceivedAt: "2026-05-22T07:25:45.000Z",
    stand: { bay: "Bay 24", stand: "24" },
    apuOnAt: "2026-05-22T07:50:00.000Z",
    apuOnReceivedAt: "2026-05-22T07:50:45.000Z",
    reason: reasonSeed(reasons.maintenanceTask, "reason:VH-VUT:001", "2026-05-22T08:18:00.000Z"),
  },
  {
    tail: "VH-VUF",
    aircraftType: "B738",
    flightNumber: "VA1349",
    arrivalFlightNumber: "VA1349",
    departureFlightNumber: "VA932",
    origin: "LST",
    destination: "SYD",
    gateState: "on_ground",
    onGroundAt: "2026-05-22T08:12:00.000Z",
    flightStateAt: "2026-05-22T08:12:00.000Z",
    flightReceivedAt: "2026-05-22T08:12:25.000Z",
    apuOffAt: "2026-05-22T08:18:00.000Z",
    apuOffReceivedAt: "2026-05-22T08:18:30.000Z",
  },
  {
    tail: "VH-YIR",
    aircraftType: "B738",
    flightNumber: "VA336",
    arrivalFlightNumber: "VA336",
    departureFlightNumber: "VA341",
    origin: "MEL",
    destination: "SYD",
    gateState: "turnaround",
    onGroundAt: "2026-05-22T07:40:00.000Z",
    flightStateAt: "2026-05-22T07:40:00.000Z",
    flightReceivedAt: "2026-05-22T07:40:25.000Z",
    stand: { bay: "Bay 17", stand: "17" },
    apuOnAt: "2026-05-22T07:48:00.000Z",
    apuOnReceivedAt: "2026-05-22T07:48:55.000Z",
    reason: reasonSeed(reasons.pilotDiscretion, "reason:VH-YIR:001", "2026-05-22T08:05:00.000Z"),
  },
  {
    tail: "VH-8XB",
    aircraftType: "B38M",
    flightNumber: "VA1041",
    arrivalFlightNumber: "VA1041",
    departureFlightNumber: "VA1044",
    origin: "SYD",
    destination: "MEL",
    gateState: "turnaround",
    onGroundAt: "2026-05-22T08:16:00.000Z",
    flightStateAt: "2026-05-22T08:16:00.000Z",
    flightReceivedAt: "2026-05-22T08:16:30.000Z",
    stand: { bay: "Bay 18", stand: "18" },
    apuOnAt: "2026-05-22T08:36:00.000Z",
    apuOnReceivedAt: "2026-05-22T08:36:40.000Z",
    reason: reasonSeed(reasons.defectInvestigation, "reason:VH-8XB:001", "2026-05-22T08:40:00.000Z"),
  },
  {
    tail: "VH-VUZ",
    aircraftType: "B738",
    flightNumber: "VA1112",
    arrivalFlightNumber: "VA1112",
    departureFlightNumber: "VA1117",
    origin: "PPP",
    destination: "MEL",
    gateState: "on_ground",
    onGroundAt: "2026-05-22T07:48:00.000Z",
    flightStateAt: "2026-05-22T07:48:00.000Z",
    flightReceivedAt: "2026-05-22T07:48:25.000Z",
    stand: { bay: "Bay 19", stand: "19" },
    apuOnAt: "2026-05-22T08:01:00.000Z",
    apuOnReceivedAt: "2026-05-22T08:01:55.000Z",
    reason: reasonSeed(reasons.equipmentOnWay, "reason:VH-VUZ:001", "2026-05-22T08:22:00.000Z"),
  },
  {
    tail: "VH-YWE",
    aircraftType: "B738",
    flightNumber: "VA612",
    arrivalFlightNumber: "VA612",
    departureFlightNumber: "VA605",
    origin: "PER",
    destination: "PER",
    gateState: "on_ground",
    onGroundAt: "2026-05-22T07:30:00.000Z",
    flightStateAt: "2026-05-22T07:30:00.000Z",
    flightReceivedAt: "2026-05-22T07:30:30.000Z",
    stand: { bay: "Bay 26", stand: "26" },
    apuOnAt: "2026-05-22T08:14:00.000Z",
    apuOnReceivedAt: "2026-05-22T08:14:40.000Z",
    reason: reasonSeed(reasons.pcaUnavailable, "reason:VH-YWE:001", "2026-05-22T08:21:00.000Z"),
    manualOffObservedAt: "2026-05-22T08:47:00.000Z",
    manualOffReceivedAt: "2026-05-22T08:47:05.000Z",
  },
  {
    tail: "VH-8FP",
    aircraftType: "B38M",
    flightNumber: "VA1478",
    arrivalFlightNumber: "VA1478",
    departureFlightNumber: "VA1481",
    origin: "MKY",
    destination: "SYD",
    gateState: "turnaround",
    onGroundAt: "2026-05-22T08:28:00.000Z",
    flightStateAt: "2026-05-22T08:28:00.000Z",
    flightReceivedAt: "2026-05-22T08:28:30.000Z",
    stand: { bay: "Bay 27", stand: "27" },
    apuOffAt: "2026-05-22T08:32:00.000Z",
    apuOffReceivedAt: "2026-05-22T08:32:20.000Z",
  },
  {
    tail: "VH-VUQ",
    aircraftType: "B738",
    flightNumber: "VA1252",
    arrivalFlightNumber: "VA1252",
    departureFlightNumber: "VA1261",
    origin: "ROK",
    destination: "CNS",
    gateState: "on_ground",
    onGroundAt: "2026-05-22T08:36:00.000Z",
    flightStateAt: "2026-05-22T08:36:00.000Z",
    flightReceivedAt: "2026-05-22T08:36:25.000Z",
    stand: { bay: "Bay 28", stand: "28" },
    apuOffAt: "2026-05-22T08:39:00.000Z",
    apuOffReceivedAt: "2026-05-22T08:39:30.000Z",
  },
  {
    tail: "VH-YFR",
    aircraftType: "B738",
    flightNumber: "VA1393",
    arrivalFlightNumber: "VA1393",
    departureFlightNumber: "VA1396",
    origin: "NTL",
    destination: "MEL",
    gateState: "turnaround",
    onGroundAt: "2026-05-22T08:42:00.000Z",
    flightStateAt: "2026-05-22T08:42:00.000Z",
    flightReceivedAt: "2026-05-22T08:42:20.000Z",
    stand: { bay: "Bay 29", stand: "29" },
    apuOffAt: "2026-05-22T08:44:00.000Z",
    apuOffReceivedAt: "2026-05-22T08:44:25.000Z",
  },
];

const sourceTokenFor = (tail: string) => tail.replace(/[^A-Z0-9]/g, "");

const timeTokenFor = (iso: string) => iso.slice(11, 16).replace(":", "");

const apuEventIdFor = (aircraft: BaselineAircraftSeed) =>
  aircraft.apuOnAt ? `BNE:${aircraft.tail}:apu:${aircraft.apuOnAt}` : undefined;

const createFlightStateEvent = (aircraft: BaselineAircraftSeed) =>
  flightStateEvent({
    tail: aircraft.tail,
    aircraftType: aircraft.aircraftType,
    flightNumber: aircraft.flightNumber,
    arrivalFlightNumber: aircraft.arrivalFlightNumber,
    departureFlightNumber: aircraft.departureFlightNumber,
    origin: aircraft.origin,
    destination: aircraft.destination,
    gateState: aircraft.gateState,
    onGroundAt: aircraft.onGroundAt,
    occurredAt: aircraft.flightStateAt,
    receivedAt: aircraft.flightReceivedAt,
    sourceEventId: `AIMS-${sourceTokenFor(aircraft.tail)}-${timeTokenFor(aircraft.flightStateAt)}`,
  });

const createStandAssignmentEvent = (aircraft: BaselineAircraftSeed) =>
  aircraft.stand
    ? standAssignmentEvent({
        tail: aircraft.tail,
        bay: aircraft.stand.bay,
        stand: aircraft.stand.stand,
        assignmentState: aircraft.stand.assignmentState ?? "current",
        validFrom: aircraft.stand.validFrom ?? aircraft.onGroundAt,
        occurredAt: aircraft.stand.occurredAt ?? aircraft.flightStateAt,
        receivedAt: aircraft.stand.receivedAt ?? aircraft.flightReceivedAt,
        sourceUpdatedAt: aircraft.stand.sourceUpdatedAt,
        sourceEventId: `BNE-STAND-${sourceTokenFor(aircraft.tail)}-${aircraft.stand.stand}`,
        quality: aircraft.stand.quality,
      })
    : undefined;

const createApuEvents = (aircraft: BaselineAircraftSeed) => {
  const tailToken = sourceTokenFor(aircraft.tail);
  const events: ScenarioEvent[] = [];

  if (aircraft.apuOnAt && aircraft.apuOnReceivedAt) {
    events.push(
      apuStateEvent({
        tail: aircraft.tail,
        state: "on",
        occurredAt: aircraft.apuOnAt,
        receivedAt: aircraft.apuOnReceivedAt,
        sourceEventId: `ACMS-${tailToken}-APUON-${timeTokenFor(aircraft.apuOnAt)}`,
        sourceLatencyMinutes: aircraft.sourceLatencyMinutes,
      }),
    );
  }

  if (aircraft.apuOffAt && aircraft.apuOffReceivedAt) {
    events.push(
      apuStateEvent({
        tail: aircraft.tail,
        state: "off",
        occurredAt: aircraft.apuOffAt,
        receivedAt: aircraft.apuOffReceivedAt,
        sourceEventId: `ACMS-${tailToken}-APUOFF-${timeTokenFor(aircraft.apuOffAt)}`,
        sourceLatencyMinutes: aircraft.sourceLatencyMinutes,
      }),
    );
  }

  return events;
};

const createReasonEvent = (aircraft: BaselineAircraftSeed) => {
  const apuEventId = apuEventIdFor(aircraft);

  return aircraft.reason && apuEventId
    ? reasonSelectedEvent({
        tail: aircraft.tail,
        apuEventId,
        reasonSegmentId: aircraft.reason.reasonSegmentId,
        categoryId: aircraft.reason.categoryId,
        categoryLabel: aircraft.reason.categoryLabel,
        detailId: aircraft.reason.detailId,
        detailLabel: aircraft.reason.detailLabel,
        selectedBy: actorId,
        occurredAt: aircraft.reason.selectedAt,
        receivedAt: aircraft.reason.selectedAt.replace(".000Z", ".005Z"),
        sourceEventId: `APP-${sourceTokenFor(aircraft.tail)}-REASON-${timeTokenFor(aircraft.reason.selectedAt)}`,
      })
    : undefined;
};

const createManualOffEvent = (aircraft: BaselineAircraftSeed) => {
  const apuEventId = apuEventIdFor(aircraft);

  return aircraft.manualOffObservedAt && aircraft.manualOffReceivedAt && apuEventId
    ? manualApuOffObservedEvent({
        tail: aircraft.tail,
        apuEventId,
        observedBy: actorId,
        occurredAt: aircraft.manualOffObservedAt,
        receivedAt: aircraft.manualOffReceivedAt,
        sourceEventId: `APP-${sourceTokenFor(aircraft.tail)}-MANUALOFF-${timeTokenFor(aircraft.manualOffObservedAt)}`,
        observationNote: "Engineer observed the aircraft connected and APU not audibly running.",
      })
    : undefined;
};

const compactEvents = (events: Array<ScenarioEvent | undefined>) =>
  events.filter((event): event is ScenarioEvent => Boolean(event));

const createAircraftEvents = (aircraft: BaselineAircraftSeed): ScenarioEvent[] =>
  compactEvents([
    createFlightStateEvent(aircraft),
    createStandAssignmentEvent(aircraft),
    ...createApuEvents(aircraft),
    createReasonEvent(aircraft),
    createManualOffEvent(aircraft),
  ]);

const sortScenarioEvents = (events: ScenarioEvent[]) =>
  [...events].sort(
    (left, right) =>
      left.receivedAt.localeCompare(right.receivedAt) ||
      left.occurredAt.localeCompare(right.occurredAt) ||
      left.eventId.localeCompare(right.eventId),
  );

export const bneBaselineScenario: ScenarioFixture = {
  id: "bne-baseline",
  name: "BNE baseline",
  description:
    "A realistic BNE overnight ground load with 21 aircraft across missing reasons, review-overdue reasons, manual-off pending states, source-quality issues and calm APU-off rows.",
  events: sortScenarioEvents([
    weatherObservationEvent({
      temperatureC: 24,
      temperatureBandC: "24-26",
      occurredAt: "2026-05-22T07:55:00.000Z",
      receivedAt: "2026-05-22T07:55:10.000Z",
      sourceEventId: "BOM-BNE-0755",
    }),
    ...baselineAircraft.flatMap(createAircraftEvents),
  ]),
};
