import type { EventEnvelope } from "./envelope";

export type SettingsFamily =
  | "reason_taxonomy"
  | "fuel_price"
  | "fuel_burn_assumptions"
  | "urgency_ranking"
  | "tail_equipment_reference"
  | "stand_coordinates";

export type ReasonDetailSetting = {
  id: string;
  label: string;
  active: boolean;
  reviewIntervalMinutes: number;
  sortOrder: number;
};

export type ReasonCategorySetting = {
  id: string;
  label: string;
  active: boolean;
  sortOrder: number;
  details: ReasonDetailSetting[];
};

export type ReasonTaxonomySnapshot = {
  defaultReviewIntervalMinutes: number;
  categories: ReasonCategorySetting[];
};

export type FuelPriceSnapshot = {
  currency: "AUD";
  pricePerKg: number;
  effectivePort?: string;
};

export type FuelBurnAssumption = {
  equipmentType: string;
  kgPerHour: number;
  isFallback?: boolean;
  fallbackReason?: string;
};

export type FuelBurnAssumptionsSnapshot = {
  assumptions: FuelBurnAssumption[];
};

export type UrgencyBucket =
  | "missing_reason"
  | "review_overdue"
  | "active_valid_reason"
  | "manual_off_pending"
  | "apu_off";

export type UrgencyRankingSnapshot = {
  bucketOrder: UrgencyBucket[];
  tiebreakerWeights: {
    runtimeMinutes: number;
    overdueMinutes: number;
    proximityCount: number;
    sourceStalenessMinutes: number;
  };
};

export type TailEquipmentReferenceSnapshot = {
  tails: Array<{
    tail: string;
    equipmentType: string;
    effectiveFrom: string;
    effectiveTo?: string;
  }>;
};

export type StandCoordinatesSnapshot = {
  stands: Array<{
    port: string;
    stand: string;
    bay: string;
    latitude: number;
    longitude: number;
  }>;
};

export type SettingsSnapshot =
  | ReasonTaxonomySnapshot
  | FuelPriceSnapshot
  | FuelBurnAssumptionsSnapshot
  | UrgencyRankingSnapshot
  | TailEquipmentReferenceSnapshot
  | StandCoordinatesSnapshot;

export type SettingsChangedPayload<TSnapshot extends SettingsSnapshot = SettingsSnapshot> = {
  settingsFamily: SettingsFamily;
  settingsVersion: string;
  effectiveFrom: string;
  changedBy: string;
  changedAt: string;
  summary: string;
  snapshot: TSnapshot;
};

export type SettingsChangedEvent<TSnapshot extends SettingsSnapshot = SettingsSnapshot> =
  EventEnvelope<SettingsChangedPayload<TSnapshot>> & {
    eventType: "settings_changed";
  };
