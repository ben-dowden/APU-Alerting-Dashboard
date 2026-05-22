import type { DerivedApuEvent } from "@/lib/domain/apu-reducer";
import type { FuelEstimate } from "@/lib/domain/fuel";
import { minutesBetweenIso } from "@/lib/domain/time";

import type { GroundAircraftState, CurrentBoardState } from "./current-board";
import { buildBurnSlices, type BurnSlice } from "./reason-burn-slices";

export type ReasonTaggedBurnRow = {
  apuEventId: string;
  tail: string;
  aircraftType?: string;
  reasonSegmentId?: string;
  reasonCategoryId: string;
  reasonCategoryLabel: string;
  reasonDetailId: string;
  reasonDetailLabel: string;
  startedAt: string;
  endedAt: string;
  runtimeMinutes: number;
  estimatedKg: number;
  assumptionVersion?: string;
  assumptionSourceEventId?: string;
  isFallbackFuelAssumption: boolean;
  fallbackReason?: string;
  isUnattributed: boolean;
  sourceEventIds: string[];
};

type AircraftWithBurnInputs = GroundAircraftState & {
  apuEvent: DerivedApuEvent;
  fuelEstimate: FuelEstimate;
};

const roundKg = (value: number) => Math.round(value * 10) / 10;

const hasBurnInputs = (aircraft: GroundAircraftState): aircraft is AircraftWithBurnInputs =>
  Boolean(aircraft.apuEvent && aircraft.fuelEstimate && aircraft.apuRuntimeMinutes > 0);

const sourceEventIdsForSlice = (aircraft: AircraftWithBurnInputs, slice: BurnSlice) => [
  ...aircraft.sourceEventIds,
  ...(slice.reasonSegment?.sourceEventIds ?? []),
];

const rowForSlice = (aircraft: AircraftWithBurnInputs, slice: BurnSlice): ReasonTaggedBurnRow => {
  const runtimeMinutes = minutesBetweenIso(slice.startedAt, slice.endedAt);
  const estimatedKg = roundKg((runtimeMinutes / 60) * aircraft.fuelEstimate.kgPerHour);
  const segment = slice.reasonSegment;

  return {
    apuEventId: aircraft.apuEvent.apuEventId,
    tail: aircraft.tail,
    aircraftType: aircraft.aircraftType,
    reasonSegmentId: segment?.reasonSegmentId,
    reasonCategoryId: segment?.categoryId ?? "unattributed",
    reasonCategoryLabel: segment?.categoryLabel ?? "Unattributed",
    reasonDetailId: segment?.detailId ?? "unattributed",
    reasonDetailLabel: segment?.detailLabel ?? "Unattributed runtime",
    startedAt: slice.startedAt,
    endedAt: slice.endedAt,
    runtimeMinutes,
    estimatedKg,
    assumptionVersion: aircraft.fuelEstimate.assumptionVersion,
    assumptionSourceEventId: aircraft.fuelEstimate.assumptionSourceEventId,
    isFallbackFuelAssumption: aircraft.fuelEstimate.isFallback,
    fallbackReason: aircraft.fuelEstimate.fallbackReason,
    isUnattributed: slice.isUnattributed,
    sourceEventIds: sourceEventIdsForSlice(aircraft, slice),
  };
};

const reconcileRowFuelToAircraftTotal = (
  rows: readonly ReasonTaggedBurnRow[],
  fuelEstimate: FuelEstimate,
) => {
  if (rows.length === 0) {
    return rows;
  }

  const rowTotal = roundKg(rows.reduce((total, row) => total + row.estimatedKg, 0));
  const difference = roundKg(fuelEstimate.estimatedKg - rowTotal);

  if (difference === 0) {
    return rows;
  }

  const finalRow = rows[rows.length - 1];

  return [
    ...rows.slice(0, -1),
    {
      ...finalRow,
      estimatedKg: roundKg(finalRow.estimatedKg + difference),
    },
  ];
};

export const deriveReasonTaggedBurnRows = (boardState: CurrentBoardState): ReasonTaggedBurnRow[] =>
  boardState.groundAircraft.flatMap((aircraft) => {
    if (!hasBurnInputs(aircraft)) {
      return [];
    }

    const runtimeEnd = aircraft.apuEvent.endedAt ?? boardState.nowIso;
    const rows = buildBurnSlices(
      aircraft.apuEvent,
      aircraft.reasonChain.segments,
      runtimeEnd,
    ).map((slice) => rowForSlice(aircraft, slice));

    return reconcileRowFuelToAircraftTotal(rows, aircraft.fuelEstimate);
  });
