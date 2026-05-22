"use client";

import { History, Pencil } from "lucide-react";
import { useMemo, useState } from "react";

import type { ReasonSegment } from "@/lib/domain/reason-chain-reducer";
import { cn } from "@/lib/utils/cn";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

type ReasonTimelineStripProps = {
  segments: ReasonSegment[];
  onCorrectSegment?: (segment: ReasonSegment) => void;
};

const formatBneTime = (iso: string) =>
  new Intl.DateTimeFormat("en-AU", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: "Australia/Brisbane",
  }).format(new Date(iso));

export function ReasonTimelineStrip({ segments, onCorrectSegment }: ReasonTimelineStripProps) {
  const [showAll, setShowAll] = useState(false);
  const [activeCorrectionId, setActiveCorrectionId] = useState<string>();
  const visibleSegments = useMemo(
    () => (showAll ? segments : segments.slice(Math.max(segments.length - 3, 0))),
    [segments, showAll],
  );
  const currentSegmentId = segments.at(-1)?.reasonSegmentId;

  if (segments.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs font-semibold uppercase tracking-normal text-neutral-500">Reason chain</p>
        {segments.length > 3 ? (
          <Button
            aria-label={showAll ? "Show fewer reason segments" : "Show all reason segments"}
            onClick={() => setShowAll((current) => !current)}
            size="icon"
            title={showAll ? "Show fewer" : "Show all"}
            type="button"
            variant="ghost"
          >
            <History data-icon="inline-start" />
          </Button>
        ) : null}
      </div>

      <ol
        aria-label="Reason timeline"
        className={cn("flex gap-2", showAll ? "overflow-x-auto pb-1" : "overflow-visible")}
      >
        {visibleSegments.map((segment) => {
          const isCurrent = segment.reasonSegmentId === currentSegmentId;
          const isCorrectionActive = activeCorrectionId === segment.reasonSegmentId;

          return (
            <li
              aria-label={`${segment.categoryLabel} segment`}
              className={cn(
                "relative flex min-w-48 flex-col gap-1 rounded-product border p-3 outline-none",
                isCurrent
                  ? "border-virgin-purple bg-purple-50"
                  : "border-neutral-200 bg-white focus-visible:ring-2 focus-visible:ring-virgin-purple",
              )}
              key={segment.reasonSegmentId}
              onBlur={() => setActiveCorrectionId(undefined)}
              onFocus={() => {
                if (!isCurrent) {
                  setActiveCorrectionId(segment.reasonSegmentId);
                }
              }}
              onMouseEnter={() => {
                if (!isCurrent) {
                  setActiveCorrectionId(segment.reasonSegmentId);
                }
              }}
              onMouseLeave={() => setActiveCorrectionId(undefined)}
              tabIndex={isCurrent ? -1 : 0}
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-sm font-semibold text-neutral-950">{segment.categoryLabel}</p>
                  <p className="text-xs font-medium text-neutral-600">{segment.detailLabel}</p>
                </div>
                {isCurrent ? <Badge variant="purple">Current</Badge> : null}
              </div>
              <p className="text-xs font-semibold text-neutral-500">
                {formatBneTime(segment.startedAt)}
                {segment.endedAt ? `-${formatBneTime(segment.endedAt)}` : ""}
              </p>
              {!isCurrent && isCorrectionActive && onCorrectSegment ? (
                <Button
                  aria-label={`Correct ${segment.categoryLabel}`}
                  className="absolute right-2 top-2"
                  onClick={() => onCorrectSegment(segment)}
                  size="icon"
                  title="Correct reason"
                  type="button"
                  variant="outline"
                >
                  <Pencil data-icon="inline-start" />
                </Button>
              ) : null}
            </li>
          );
        })}
      </ol>
    </div>
  );
}
