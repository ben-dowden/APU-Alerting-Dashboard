import type { DerivedApuEvent } from "@/lib/domain/apu-reducer";
import type { FuelBurnSettingsInput } from "@/lib/domain/fuel";
import { matchesApuEventId } from "@/lib/domain/ids";
import { minutesBetweenIso } from "@/lib/domain/time";
import type { StandCoordinatesInput } from "@/lib/domain/proximity";
import type {
  ApuStateEvent,
  FuelPriceSnapshot,
  ReasonTaxonomySnapshot,
  SettingsChangedEvent,
} from "@/lib/events";
import { isDomainEvent, isSourceEvent } from "@/lib/events";

import { deriveCurrentBoard, type CurrentBoardSettings, type GroundAircraftState } from "./current-board";
import { deriveReasonTaggedBurnRows, type ReasonTaggedBurnRow } from "./reason-tagged-burn";

export type HqReportFilters = {
  startIso: string;
  endIso: string;
  ports?: string[];
  generatedAt?: string;
};

export type HqReportSettings = {
  reasonTaxonomy: ReasonTaxonomySnapshot | SettingsChangedEvent<ReasonTaxonomySnapshot>;
  fuelBurnAssumptions: FuelBurnSettingsInput;
  fuelPrice: FuelPriceSnapshot | SettingsChangedEvent<FuelPriceSnapshot>;
  standCoordinates?: StandCoordinatesInput;
  settingsVersion?: string;
};

export type HqReportAssumptionMetadata = {
  fuelPriceVersion?: string;
  fuelPriceSourceEventId?: string;
  fuelPriceCurrency: FuelPriceSnapshot["currency"];
  fuelPricePerKg: number;
  fuelBurnAssumptionVersion?: string;
  fuelBurnAssumptionSourceEventId?: string;
  reasonTaxonomyVersion?: string;
  reasonTaxonomySourceEventId?: string;
  settingsVersion: string;
};

export type HqLocationPerformanceRow = {
  port: string;
  aircraftCount: number;
  apuEventCount: number;
  runtimeMinutes: number;
  fuelKg: number;
  dollarImpact: number;
  attributedRuntimePercent: number;
  fallbackFuelRowCount: number;
};

export type HqReasonBreakdownRow = {
  reasonCategoryId: string;
  reasonCategoryLabel: string;
  reasonDetailId?: string;
  reasonDetailLabel?: string;
  runtimeMinutes: number;
  fuelKg: number;
  dollarImpact: number;
  runtimePercentOfReport: number;
  rowCount: number;
  isUnattributed: boolean;
};

export type ManualOffExportStatus =
  | "not_observed"
  | "pending_source_confirmation"
  | "confirmed_by_source"
  | "contradicted_by_source";

export type HqReportExportRow = {
  rowId: string;
  port: string;
  tail: string;
  aircraftType?: string;
  aircraftGroundEventId?: string;
  apuEventId: string;
  closureType: DerivedApuEvent["closureType"];
  closureConfidence?: DerivedApuEvent["closureConfidence"];
  manualOffStatus: ManualOffExportStatus;
  reasonSegmentId?: string;
  reasonCategoryId: string;
  reasonCategoryLabel: string;
  reasonDetailId: string;
  reasonDetailLabel: string;
  startedAt: string;
  endedAt: string;
  runtimeMinutes: number;
  fuelKg: number;
  dollarImpact: number;
  currency: FuelPriceSnapshot["currency"];
  fuelPricePerKg: number;
  fuelPriceVersion?: string;
  fuelPriceSourceEventId?: string;
  fuelBurnAssumptionVersion?: string;
  fuelBurnAssumptionSourceEventId?: string;
  reasonTaxonomyVersion?: string;
  reasonTaxonomySourceEventId?: string;
  settingsVersion: string;
  isFallbackFuelAssumption: boolean;
  fallbackReason?: string;
  eventIds: string[];
  sourceEventIds: string[];
};

export type HqReport = {
  filters: HqReportFilters;
  generatedAt: string;
  totalRuntimeMinutes: number;
  totalFuelKg: number;
  totalDollarImpact: number;
  attributedRuntimePercent: number;
  locationRows: HqLocationPerformanceRow[];
  reasonRows: HqReasonBreakdownRow[];
  unattributedRows: HqReportExportRow[];
  assumptionMetadata: HqReportAssumptionMetadata;
  exportRows: HqReportExportRow[];
};

type EventWithLineage = {
  eventId: string;
  sourceEventId: string;
};

const roundOne = (value: number) => Math.round(value * 10) / 10;
const roundTwo = (value: number) => Math.round(value * 100) / 100;
const maxIso = (left: string, right: string) => (left >= right ? left : right);
const minIso = (left: string, right: string) => (left <= right ? left : right);

const groupBy = <TValue, TKey extends string>(
  values: readonly TValue[],
  keyFor: (value: TValue) => TKey,
) =>
  values.reduce((groups, value) => {
    const key = keyFor(value);
    const existing = groups.get(key) ?? [];

    groups.set(key, [...existing, value]);

    return groups;
  }, new Map<TKey, TValue[]>());

const isSettingsEvent = <TSnapshot,>(
  value: TSnapshot | SettingsChangedEvent<TSnapshot>,
): value is SettingsChangedEvent<TSnapshot> =>
  typeof value === "object" && value !== null && "payload" in value;

const snapshotFromSettings = <TSnapshot,>(
  value: TSnapshot | SettingsChangedEvent<TSnapshot>,
) => (isSettingsEvent(value) ? value.payload.snapshot : value);

const settingsVersionFrom = <TSnapshot,>(
  value: TSnapshot | SettingsChangedEvent<TSnapshot>,
) => (isSettingsEvent(value) ? value.payload.settingsVersion : undefined);

const settingsSourceEventIdFrom = <TSnapshot,>(
  value: TSnapshot | SettingsChangedEvent<TSnapshot>,
) => (isSettingsEvent(value) ? value.eventId : undefined);

const createSettingsVersion = (
  settings: HqReportSettings,
  metadata: Omit<HqReportAssumptionMetadata, "settingsVersion">,
) =>
  settings.settingsVersion ??
  [
    metadata.reasonTaxonomyVersion,
    metadata.fuelBurnAssumptionVersion,
    metadata.fuelPriceVersion,
  ].filter(Boolean).join("/");

const createAssumptionMetadata = (settings: HqReportSettings): HqReportAssumptionMetadata => {
  const fuelPrice = snapshotFromSettings(settings.fuelPrice);
  const metadata = {
    fuelPriceVersion: settingsVersionFrom(settings.fuelPrice),
    fuelPriceSourceEventId: settingsSourceEventIdFrom(settings.fuelPrice),
    fuelPriceCurrency: fuelPrice.currency,
    fuelPricePerKg: fuelPrice.pricePerKg,
    fuelBurnAssumptionVersion: settingsVersionFrom(settings.fuelBurnAssumptions),
    fuelBurnAssumptionSourceEventId: settingsSourceEventIdFrom(settings.fuelBurnAssumptions),
    reasonTaxonomyVersion: settingsVersionFrom(settings.reasonTaxonomy),
    reasonTaxonomySourceEventId: settingsSourceEventIdFrom(settings.reasonTaxonomy),
  };

  return {
    ...metadata,
    settingsVersion: createSettingsVersion(settings, metadata),
  };
};

const boardSettingsFrom = (settings: HqReportSettings): CurrentBoardSettings => ({
  reasonTaxonomy: snapshotFromSettings(settings.reasonTaxonomy),
  fuelBurnAssumptions: settings.fuelBurnAssumptions,
  standCoordinates: settings.standCoordinates,
});

const hasEventLineage = (event: unknown): event is EventWithLineage =>
  typeof event === "object" &&
  event !== null &&
  "eventId" in event &&
  "sourceEventId" in event &&
  typeof event.eventId === "string" &&
  typeof event.sourceEventId === "string";

const sourceEventIdsByEventId = (events: readonly unknown[]) =>
  new Map(
    events
      .filter(hasEventLineage)
      .map((event) => [event.eventId, event.sourceEventId] as const),
  );

const externalSourceIdsFor = (
  eventIds: readonly string[],
  sourceIdsByEventId: ReadonlyMap<string, string>,
) => eventIds.map((eventId) => sourceIdsByEventId.get(eventId) ?? eventId);

const isManualOffObservedEvent = (
  event: unknown,
) => isDomainEvent(event) && event.eventType === "manual_apu_off_observed";

const isApuSourceEvent = (event: unknown): event is ApuStateEvent =>
  isSourceEvent(event) && event.eventType === "apu_state_event";

const latestManualOffFor = (apuEvent: DerivedApuEvent, events: readonly unknown[]) =>
  events
    .filter(isManualOffObservedEvent)
    .filter((event) => matchesApuEventId(event.payload.apuEventId, apuEvent))
    .sort((left, right) => left.occurredAt.localeCompare(right.occurredAt))
    .at(-1);

const hasTrustedApuOnAfterManualOff = (
  apuEvent: DerivedApuEvent,
  manualObservedAt: string,
  events: readonly unknown[],
) =>
  events
    .filter(isApuSourceEvent)
    .some((event) =>
      event.payload.tail === apuEvent.tail &&
      event.payload.port === apuEvent.port &&
      event.payload.state === "on" &&
      event.occurredAt > manualObservedAt,
    );

const manualOffStatusFor = (
  apuEvent: DerivedApuEvent,
  events: readonly unknown[],
): ManualOffExportStatus => {
  const latestManualOff = latestManualOffFor(apuEvent, events);

  if (!latestManualOff) {
    return "not_observed";
  }

  if (apuEvent.closureType === "source_off" && apuEvent.endedAt >= latestManualOff.payload.observedAt) {
    return "confirmed_by_source";
  }

  if (hasTrustedApuOnAfterManualOff(apuEvent, latestManualOff.payload.observedAt, events)) {
    return "contradicted_by_source";
  }

  return "pending_source_confirmation";
};

const rowsOverlapFilters = (row: ReasonTaggedBurnRow, filters: HqReportFilters) =>
  row.endedAt > filters.startIso && row.startedAt < filters.endIso;

const clampRowToFilters = (
  row: ReasonTaggedBurnRow,
  filters: HqReportFilters,
): ReasonTaggedBurnRow | undefined => {
  const startedAt = maxIso(row.startedAt, filters.startIso);
  const endedAt = minIso(row.endedAt, filters.endIso);
  const runtimeMinutes = minutesBetweenIso(startedAt, endedAt);

  if (runtimeMinutes <= 0) {
    return undefined;
  }

  const fuelRatio = row.runtimeMinutes === 0 ? 0 : runtimeMinutes / row.runtimeMinutes;

  return {
    ...row,
    startedAt,
    endedAt,
    runtimeMinutes,
    estimatedKg: roundOne(row.estimatedKg * fuelRatio),
  };
};

const includePort = (ports: readonly string[] | undefined, port: string) =>
  !ports || ports.length === 0 || ports.includes(port);

const aircraftByApuEventId = (aircraft: readonly GroundAircraftState[]) =>
  new Map(
    aircraft
      .filter((state) => state.apuEvent)
      .map((state) => [state.apuEvent?.apuEventId, state] as const),
  );

const createExportRow = (
  row: ReasonTaggedBurnRow,
  aircraft: GroundAircraftState,
  settings: HqReportAssumptionMetadata,
  sourceIdsByEventId: ReadonlyMap<string, string>,
  events: readonly unknown[],
): HqReportExportRow => {
  const apuEvent = aircraft.apuEvent;

  if (!apuEvent) {
    throw new Error("HQ export rows require an APU event");
  }

  const sourceEventIds = externalSourceIdsFor(row.sourceEventIds, sourceIdsByEventId);

  return {
    rowId: `${row.apuEventId}:${row.reasonSegmentId ?? "unattributed"}:${row.startedAt}`,
    port: aircraft.port,
    tail: row.tail,
    aircraftType: row.aircraftType,
    aircraftGroundEventId: sourceEventIds[0],
    apuEventId: row.apuEventId,
    closureType: apuEvent.closureType,
    closureConfidence: apuEvent.closureConfidence,
    manualOffStatus: manualOffStatusFor(apuEvent, events),
    reasonSegmentId: row.reasonSegmentId,
    reasonCategoryId: row.reasonCategoryId,
    reasonCategoryLabel: row.reasonCategoryLabel,
    reasonDetailId: row.reasonDetailId,
    reasonDetailLabel: row.reasonDetailLabel,
    startedAt: row.startedAt,
    endedAt: row.endedAt,
    runtimeMinutes: row.runtimeMinutes,
    fuelKg: row.estimatedKg,
    dollarImpact: roundTwo(row.estimatedKg * settings.fuelPricePerKg),
    currency: settings.fuelPriceCurrency,
    fuelPricePerKg: settings.fuelPricePerKg,
    fuelPriceVersion: settings.fuelPriceVersion,
    fuelPriceSourceEventId: settings.fuelPriceSourceEventId,
    fuelBurnAssumptionVersion: settings.fuelBurnAssumptionVersion ?? row.assumptionVersion,
    fuelBurnAssumptionSourceEventId: settings.fuelBurnAssumptionSourceEventId ?? row.assumptionSourceEventId,
    reasonTaxonomyVersion: settings.reasonTaxonomyVersion,
    reasonTaxonomySourceEventId: settings.reasonTaxonomySourceEventId,
    settingsVersion: settings.settingsVersion,
    isFallbackFuelAssumption: row.isFallbackFuelAssumption,
    fallbackReason: row.fallbackReason,
    eventIds: row.sourceEventIds,
    sourceEventIds,
  };
};

const createExportRows = (
  rows: readonly ReasonTaggedBurnRow[],
  aircraftByApuId: ReadonlyMap<string | undefined, GroundAircraftState>,
  settings: HqReportAssumptionMetadata,
  sourceIdsByEventId: ReadonlyMap<string, string>,
  filters: HqReportFilters,
  events: readonly unknown[],
) =>
  rows
    .filter((row) => rowsOverlapFilters(row, filters))
    .map((row) => clampRowToFilters(row, filters))
    .filter((row): row is ReasonTaggedBurnRow => Boolean(row))
    .map((row) => {
      const aircraft = aircraftByApuId.get(row.apuEventId);

      return aircraft && includePort(filters.ports, aircraft.port)
        ? createExportRow(row, aircraft, settings, sourceIdsByEventId, events)
        : undefined;
    })
    .filter((row): row is HqReportExportRow => Boolean(row));

const attributedRuntimePercent = (rows: readonly Pick<HqReportExportRow, "runtimeMinutes" | "reasonCategoryId">[]) => {
  const runtimeMinutes = rows.reduce((total, row) => total + row.runtimeMinutes, 0);
  const attributedRuntimeMinutes = rows
    .filter((row) => row.reasonCategoryId !== "unattributed")
    .reduce((total, row) => total + row.runtimeMinutes, 0);

  return runtimeMinutes === 0 ? 0 : roundOne((attributedRuntimeMinutes / runtimeMinutes) * 100);
};

const uniqueCount = (values: readonly string[]) => new Set(values).size;

const createLocationRows = (rows: readonly HqReportExportRow[]): HqLocationPerformanceRow[] =>
  [...groupBy(rows, (row) => row.port).entries()]
    .map(([port, portRows]) => ({
      port,
      aircraftCount: uniqueCount(portRows.map((row) => row.tail)),
      apuEventCount: uniqueCount(portRows.map((row) => row.apuEventId)),
      runtimeMinutes: portRows.reduce((total, row) => total + row.runtimeMinutes, 0),
      fuelKg: roundOne(portRows.reduce((total, row) => total + row.fuelKg, 0)),
      dollarImpact: roundTwo(portRows.reduce((total, row) => total + row.dollarImpact, 0)),
      attributedRuntimePercent: attributedRuntimePercent(portRows),
      fallbackFuelRowCount: portRows.filter((row) => row.isFallbackFuelAssumption).length,
    }))
    .sort((left, right) => left.port.localeCompare(right.port));

const createReasonRows = (rows: readonly HqReportExportRow[]): HqReasonBreakdownRow[] =>
  [...groupBy(rows, (row) => `${row.reasonCategoryId}:${row.reasonDetailId}`).values()]
    .map((reasonRows) => {
      const first = reasonRows[0];
      const runtimeMinutes = reasonRows.reduce((total, row) => total + row.runtimeMinutes, 0);

      return {
        reasonCategoryId: first.reasonCategoryId,
        reasonCategoryLabel: first.reasonCategoryLabel,
        reasonDetailId: first.reasonDetailId,
        reasonDetailLabel: first.reasonDetailLabel,
        runtimeMinutes,
        fuelKg: roundOne(reasonRows.reduce((total, row) => total + row.fuelKg, 0)),
        dollarImpact: roundTwo(reasonRows.reduce((total, row) => total + row.dollarImpact, 0)),
        runtimePercentOfReport:
          rows.length === 0
            ? 0
            : roundOne((runtimeMinutes / rows.reduce((total, row) => total + row.runtimeMinutes, 0)) * 100),
        rowCount: reasonRows.length,
        isUnattributed: first.reasonCategoryId === "unattributed",
      };
    })
    .sort((left, right) => {
      if (left.isUnattributed !== right.isUnattributed) {
        return left.isUnattributed ? 1 : -1;
      }

      return right.runtimeMinutes - left.runtimeMinutes;
    });

export const deriveHqReport = (
  events: readonly unknown[],
  settings: HqReportSettings,
  filters: HqReportFilters,
): HqReport => {
  const board = deriveCurrentBoard(events, boardSettingsFrom(settings), filters.endIso);
  const assumptionMetadata = createAssumptionMetadata(settings);
  const sourceIdsByEventId = sourceEventIdsByEventId(events);
  const exportRows = createExportRows(
    deriveReasonTaggedBurnRows(board),
    aircraftByApuEventId(board.groundAircraft),
    assumptionMetadata,
    sourceIdsByEventId,
    filters,
    events,
  );

  const totalRuntimeMinutes = exportRows.reduce((total, row) => total + row.runtimeMinutes, 0);

  return {
    filters,
    generatedAt: filters.generatedAt ?? filters.endIso,
    totalRuntimeMinutes,
    totalFuelKg: roundOne(exportRows.reduce((total, row) => total + row.fuelKg, 0)),
    totalDollarImpact: roundTwo(exportRows.reduce((total, row) => total + row.dollarImpact, 0)),
    attributedRuntimePercent: attributedRuntimePercent(exportRows),
    locationRows: createLocationRows(exportRows),
    reasonRows: createReasonRows(exportRows),
    unattributedRows: exportRows.filter((row) => row.reasonCategoryId === "unattributed"),
    assumptionMetadata,
    exportRows,
  };
};
