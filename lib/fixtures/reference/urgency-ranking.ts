import { buildEventId, buildIdempotencyKey } from "@/lib/events";
import type { SettingsChangedEvent, UrgencyRankingSnapshot } from "@/lib/events";

const occurredAt = "2026-05-22T00:00:00.000Z";
const sourceEventId = "urgency-ranking-v1";

export const urgencyRankingSettings: SettingsChangedEvent<UrgencyRankingSnapshot> = {
  eventId: buildEventId("settings_changed", "BNE", "urgency_ranking", occurredAt),
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
    settingsFamily: "urgency_ranking",
    settingsVersion: "urgency-ranking-v1",
    effectiveFrom: occurredAt,
    changedBy: "hq-admin",
    changedAt: occurredAt,
    summary: "Initial fixed urgency buckets and editable weighted tiebreakers.",
    snapshot: {
      bucketOrder: [
        "missing_reason",
        "review_overdue",
        "active_valid_reason",
        "manual_off_pending",
        "apu_off",
      ],
      tiebreakerWeights: {
        runtimeMinutes: 0.42,
        overdueMinutes: 0.32,
        proximityCount: 0.18,
        sourceStalenessMinutes: 0.08,
      },
    },
  },
};
