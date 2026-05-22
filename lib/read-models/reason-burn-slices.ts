import type { DerivedApuEvent } from "@/lib/domain/apu-reducer";
import type { ReasonSegment } from "@/lib/domain/reason-chain-reducer";
import { compareIsoStrings } from "@/lib/domain/time";

export type BurnSlice = {
  reasonSegment?: ReasonSegment;
  startedAt: string;
  endedAt: string;
  isUnattributed: boolean;
};

type ClampedReasonSegment = {
  segment: ReasonSegment;
  startedAt: string;
  endedAt: string;
};

const maxIso = (left: string, right: string) => (left >= right ? left : right);
const minIso = (left: string, right: string) => (left <= right ? left : right);

const createUnattributedSlice = (startedAt: string, endedAt: string): BurnSlice => ({
  startedAt,
  endedAt,
  isUnattributed: true,
});

const createReasonSlice = (entry: ClampedReasonSegment): BurnSlice => ({
  reasonSegment: entry.segment,
  startedAt: entry.startedAt,
  endedAt: entry.endedAt,
  isUnattributed: false,
});

const clampedReasonSegments = (
  segments: readonly ReasonSegment[],
  runtimeStart: string,
  runtimeEnd: string,
): ClampedReasonSegment[] =>
  segments
    .map((segment) => ({
      segment,
      startedAt: maxIso(segment.startedAt, runtimeStart),
      endedAt: minIso(segment.endedAt ?? runtimeEnd, runtimeEnd),
    }))
    .filter((entry) => entry.startedAt < entry.endedAt)
    .sort((left, right) => compareIsoStrings(left.startedAt, right.startedAt));

export const buildBurnSlices = (
  apuEvent: DerivedApuEvent,
  reasonSegments: readonly ReasonSegment[],
  runtimeEnd: string,
): BurnSlice[] => {
  const runtimeStart = apuEvent.startedAt;
  const segments = clampedReasonSegments(reasonSegments, runtimeStart, runtimeEnd);

  if (segments.length === 0) {
    return [createUnattributedSlice(runtimeStart, runtimeEnd)];
  }

  const slices: BurnSlice[] = [];
  let cursor = runtimeStart;

  for (const entry of segments) {
    if (cursor < entry.startedAt) {
      slices.push(createUnattributedSlice(cursor, entry.startedAt));
    }

    slices.push(createReasonSlice(entry));
    cursor = entry.endedAt;
  }

  if (cursor < runtimeEnd) {
    slices.push(createUnattributedSlice(cursor, runtimeEnd));
  }

  return slices;
};
