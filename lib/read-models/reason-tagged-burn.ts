import type { GroundAircraftState, CurrentBoardState } from "./current-board";
import type { ReasonSegment } from "@/lib/domain/reason-chain-reducer";
import { compareIsoStrings, minutesBetweenIso } from "@/lib/domain/time";

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

type BurnSlice = {
  reasonSegment?: ReasonSegment;
  startedAt: string;
  endedAt: string;
  isUnattributed: boolean;
};

const roundKg = (value: number) => Math.round(value * 10) / 10;

const maxIso = (left: string, right: string) => (left >= right ? left : right);
const minIso = (left: string, right: string) => (left <= right ? left : right);

const createUnattributedSlice = (startedAt: string, endedAt: string): BurnSlice => ({
  startedAt,
  endedAt,
  isUnattributed: true,
});

const buildBurnSlices = (aircraft: GroundAircraftState, runtimeEnd: string): BurnSlice[] => {
  if (!aircraft.apuEvent) {
    return [];
  }

  const runtimeStart = aircraft.apuEvent.startedAt;
  const segments = aircraft.reasonChain.segments
    .map((segment) => ({
      segment,
      startedAt: maxIso(segment.startedAt, runtimeStart),
      endedAt: minIso(segment.endedAt ?? runtimeEnd, runtimeEnd),
    }))
    .filter((entry) => entry.startedAt < entry.endedAt)
    .sort((left, right) => compareIsoStrings(left.startedAt, right.startedAt));

  if (segments.length === 0) {
    return [createUnattributedSlice(runtimeStart, runtimeEnd)];
  }

  const slices: BurnSlice[] = [];
  let cursor = runtimeStart;

  for (const entry of segments) {
    if (cursor < entry.startedAt) {
      slices.push(createUnattributedSlice(cursor, entry.startedAt));
    }

    slices.push({
      reasonSegment: entry.segment,
      startedAt: entry.startedAt,
      endedAt: entry.endedAt,
      isUnattributed: false,
    });
    cursor = entry.endedAt;
  }

  if (cursor < runtimeEnd) {
    slices.push(createUnattributedSlice(cursor, runtimeEnd));
  }

  return slices;
};

const rowForSlice = (aircraft: GroundAircraftState, slice: BurnSlice): ReasonTaggedBurnRow => {
  if (!aircraft.apuEvent || !aircraft.fuelEstimate) {
    throw new Error("Reason-tagged burn rows require APU and fuel estimate state");
  }

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
    sourceEventIds: [
      ...aircraft.sourceEventIds,
      ...(segment?.sourceEventIds ?? []),
    ],
  };
};

const reconcileRowFuelToAircraftTotal = (
  rows: ReasonTaggedBurnRow[],
  aircraft: GroundAircraftState,
) => {
  if (rows.length === 0 || !aircraft.fuelEstimate) {
    return rows;
  }

  const rowTotal = roundKg(rows.reduce((total, row) => total + row.estimatedKg, 0));
  const difference = roundKg(aircraft.fuelEstimate.estimatedKg - rowTotal);

  if (difference !== 0) {
    rows[rows.length - 1] = {
      ...rows[rows.length - 1],
      estimatedKg: roundKg(rows[rows.length - 1].estimatedKg + difference),
    };
  }

  return rows;
};

export const deriveReasonTaggedBurnRows = (boardState: CurrentBoardState): ReasonTaggedBurnRow[] =>
  boardState.groundAircraft.flatMap((aircraft) => {
    if (!aircraft.apuEvent || !aircraft.fuelEstimate || aircraft.apuRuntimeMinutes === 0) {
      return [];
    }

    const runtimeEnd = aircraft.apuEvent.endedAt ?? boardState.nowIso;
    const rows = buildBurnSlices(aircraft, runtimeEnd).map((slice) => rowForSlice(aircraft, slice));
    return reconcileRowFuelToAircraftTotal(rows, aircraft);
  });
