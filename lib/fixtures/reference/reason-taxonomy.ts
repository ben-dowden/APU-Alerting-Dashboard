import { buildEventId, buildIdempotencyKey } from "@/lib/events";
import type { ReasonTaxonomySnapshot, SettingsChangedEvent } from "@/lib/events";

const occurredAt = "2026-05-22T00:00:00.000Z";
const sourceEventId = "reason-taxonomy-v1";

const snapshot: ReasonTaxonomySnapshot = {
  defaultReviewIntervalMinutes: 30,
  categories: [
    {
      id: "infrastructure-unavailable",
      label: "Infrastructure unavailable",
      active: true,
      sortOrder: 10,
      details: [
        { id: "pca-unavailable", label: "PCA unavailable", active: true, reviewIntervalMinutes: 30, sortOrder: 10 },
        { id: "gpu-unavailable", label: "GPU unavailable", active: true, reviewIntervalMinutes: 30, sortOrder: 20 },
        { id: "bay-service-unavailable", label: "Bay service unavailable", active: true, reviewIntervalMinutes: 30, sortOrder: 30 },
        { id: "remote-stand-no-support", label: "Remote stand / no support", active: true, reviewIntervalMinutes: 30, sortOrder: 40 },
      ],
    },
    {
      id: "cleaning-in-progress",
      label: "Cleaning in progress",
      active: true,
      sortOrder: 20,
      details: [
        { id: "cleaner-onboard", label: "Cleaner onboard", active: true, reviewIntervalMinutes: 30, sortOrder: 10 },
        { id: "cleaning-not-yet-attended", label: "Cleaning not yet attended", active: true, reviewIntervalMinutes: 30, sortOrder: 20 },
        { id: "cabin-preparation-in-progress", label: "Cabin preparation in progress", active: true, reviewIntervalMinutes: 30, sortOrder: 30 },
        { id: "cleaning-complete-awaiting-follow-up", label: "Cleaning complete / awaiting follow-up", active: true, reviewIntervalMinutes: 30, sortOrder: 40 },
      ],
    },
    {
      id: "engineering-requirement",
      label: "Engineering requirement",
      active: true,
      sortOrder: 30,
      details: [
        { id: "maintenance-task-in-progress", label: "Maintenance task in progress", active: true, reviewIntervalMinutes: 30, sortOrder: 10 },
        { id: "defect-investigation", label: "Defect investigation", active: true, reviewIntervalMinutes: 30, sortOrder: 20 },
        { id: "engineer-not-available-at-aircraft", label: "Engineer not available at aircraft", active: true, reviewIntervalMinutes: 30, sortOrder: 30 },
        { id: "return-to-aircraft-not-practical", label: "Return to aircraft not practical", active: true, reviewIntervalMinutes: 30, sortOrder: 40 },
      ],
    },
    {
      id: "flight-operations-pilot-discretion",
      label: "Flight operations / pilot discretion",
      active: true,
      sortOrder: 40,
      details: [
        { id: "pilot-discretion", label: "Pilot discretion", active: true, reviewIntervalMinutes: 30, sortOrder: 10 },
        { id: "crew-comfort-request", label: "Crew comfort request", active: true, reviewIntervalMinutes: 30, sortOrder: 20 },
        { id: "pre-departure-operational-requirement", label: "Pre-departure operational requirement", active: true, reviewIntervalMinutes: 30, sortOrder: 30 },
        { id: "operational-instruction", label: "Operational instruction", active: true, reviewIntervalMinutes: 30, sortOrder: 40 },
      ],
    },
    {
      id: "logistics-agent-on-the-way",
      label: "Logistics / agent on the way",
      active: true,
      sortOrder: 50,
      details: [
        { id: "agent-on-the-way", label: "Agent on the way", active: true, reviewIntervalMinutes: 30, sortOrder: 10 },
        { id: "equipment-on-the-way", label: "Equipment on the way", active: true, reviewIntervalMinutes: 30, sortOrder: 20 },
        { id: "awaiting-tow-stand-move", label: "Awaiting tow / stand move", active: true, reviewIntervalMinutes: 30, sortOrder: 30 },
        { id: "turnaround-sequencing", label: "Turnaround sequencing", active: true, reviewIntervalMinutes: 30, sortOrder: 40 },
      ],
    },
  ],
};

export const reasonTaxonomySettings: SettingsChangedEvent<ReasonTaxonomySnapshot> = {
  eventId: buildEventId("settings_changed", "BNE", "reason_taxonomy", occurredAt),
  eventType: "settings_changed",
  eventVersion: 1,
  sourceSystem: "ADMIN",
  sourceEventId,
  occurredAt,
  receivedAt: occurredAt,
  correlation: {
    port: "BNE",
    idempotencyKey: buildIdempotencyKey("ADMIN", sourceEventId),
  },
  quality: {
    confidence: "high",
    idempotencyKey: buildIdempotencyKey("ADMIN", sourceEventId),
  },
  payload: {
    settingsFamily: "reason_taxonomy",
    settingsVersion: "reason-taxonomy-v1",
    effectiveFrom: occurredAt,
    changedBy: "hq-admin",
    changedAt: occurredAt,
    summary: "Initial BNE reason taxonomy with five categories and four fast-capture details each.",
    snapshot,
  },
};
