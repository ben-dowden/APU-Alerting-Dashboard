import type {
  FuelBurnAssumption,
  FuelBurnAssumptionsSnapshot,
  SettingsChangedEvent,
} from "@/lib/events";

export type FuelBurnSettingsInput =
  | FuelBurnAssumptionsSnapshot
  | SettingsChangedEvent<FuelBurnAssumptionsSnapshot>;

export type FuelEstimate = {
  runtimeMinutes: number;
  estimatedKg: number;
  kgPerHour: number;
  equipmentType: string;
  requestedEquipmentType: string;
  assumptionVersion?: string;
  assumptionSourceEventId?: string;
  isFallback: boolean;
  fallbackReason?: string;
};

export type ReasonFuelAllocationInput = {
  reasonSegmentId: string;
  runtimeMinutes: number;
};

export type ReasonFuelAllocation = ReasonFuelAllocationInput & FuelEstimate;

const isSettingsEvent = (
  settings: FuelBurnSettingsInput,
): settings is SettingsChangedEvent<FuelBurnAssumptionsSnapshot> => "payload" in settings;

const snapshotFromSettings = (settings: FuelBurnSettingsInput) =>
  isSettingsEvent(settings) ? settings.payload.snapshot : settings;

const versionFromSettings = (settings: FuelBurnSettingsInput) =>
  isSettingsEvent(settings) ? settings.payload.settingsVersion : undefined;

const sourceEventIdFromSettings = (settings: FuelBurnSettingsInput) =>
  isSettingsEvent(settings) ? settings.eventId : undefined;

const roundKg = (value: number) => Math.round(value * 10) / 10;

const normalizeEquipmentType = (equipmentTypeCode: string | undefined) =>
  equipmentTypeCode?.trim().toUpperCase() || "UNKNOWN";

const findAssumption = (
  equipmentTypeCode: string | undefined,
  assumptions: FuelBurnAssumption[],
) => {
  const requestedEquipmentType = normalizeEquipmentType(equipmentTypeCode);
  const direct = assumptions.find((assumption) => assumption.equipmentType === requestedEquipmentType);
  const fallback = assumptions.find((assumption) => assumption.isFallback) ?? assumptions[0];

  return {
    requestedEquipmentType,
    assumption: direct ?? fallback,
    isFallback: !direct || Boolean(direct.isFallback),
  };
};

export const estimateFuelKgForEquipment = (
  runtimeMinutes: number,
  equipmentTypeCode: string | undefined,
  settings: FuelBurnSettingsInput,
): FuelEstimate => {
  const snapshot = snapshotFromSettings(settings);
  const { requestedEquipmentType, assumption, isFallback } = findAssumption(
    equipmentTypeCode,
    snapshot.assumptions,
  );

  if (!assumption) {
    throw new Error("Fuel burn assumptions must include at least one configured rate");
  }

  return {
    runtimeMinutes,
    estimatedKg: roundKg((runtimeMinutes / 60) * assumption.kgPerHour),
    kgPerHour: assumption.kgPerHour,
    equipmentType: assumption.equipmentType,
    requestedEquipmentType,
    assumptionVersion: versionFromSettings(settings),
    assumptionSourceEventId: sourceEventIdFromSettings(settings),
    isFallback,
    fallbackReason: isFallback ? assumption.fallbackReason : undefined,
  };
};

export const allocateFuelKgByReasonSegment = (
  segments: readonly ReasonFuelAllocationInput[],
  equipmentTypeCode: string | undefined,
  settings: FuelBurnSettingsInput,
): ReasonFuelAllocation[] =>
  segments.map((segment) => ({
    ...segment,
    ...estimateFuelKgForEquipment(segment.runtimeMinutes, equipmentTypeCode, settings),
  }));
