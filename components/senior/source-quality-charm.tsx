import type { SourceCharm, SourceQualityFlag } from "@/lib/read-models";
import { Badge } from "@/components/ui/badge";

type SourceQualityCharmProps = {
  sourceCharms: SourceCharm[];
};

type VisibleSourceQualityFlag = Exclude<SourceQualityFlag, "fallback_assumption">;

const flagLabels: Record<VisibleSourceQualityFlag, { label: string; accessibleLabel: string }> = {
  stale: {
    label: "Stale",
    accessibleLabel: "Stale",
  },
  unknown: {
    label: "Unknown",
    accessibleLabel: "Unknown",
  },
  conflicting: {
    label: "Conflict",
    accessibleLabel: "Conflicting",
  },
  low_confidence: {
    label: "Low",
    accessibleLabel: "Low confidence",
  },
};

const visibleFlag = (flag: SourceQualityFlag): flag is VisibleSourceQualityFlag =>
  flag !== "fallback_assumption";

const flagsForCharm = (source: SourceCharm) => {
  const flags = new Set<SourceQualityFlag>(source.qualityFlags ?? []);

  if (source.isStale) {
    flags.add("stale");
  }

  if (source.confidence === "low") {
    flags.add("low_confidence");
  }

  if (source.sourceSystem === "UNKNOWN") {
    flags.add("unknown");
  }

  return [...flags].filter(visibleFlag);
};

const titleFor = (source: SourceCharm, flag: VisibleSourceQualityFlag) => {
  const latency = source.sourceLatencyMinutes ? `, ${source.sourceLatencyMinutes}m latency` : "";

  return `${flagLabels[flag].accessibleLabel} source. ${source.sourceSystem} received ${source.receivedAt}${latency}. Event ${source.sourceEventId}.`;
};

export function SourceQualityCharm({ sourceCharms }: SourceQualityCharmProps) {
  const markers = sourceCharms.flatMap((source) =>
    flagsForCharm(source).map((flag) => ({
      flag,
      source,
      key: `${source.sourceSystem}:${source.sourceEventId}:${flag}`,
    })),
  );

  if (markers.length === 0) {
    return null;
  }

  return (
    <div aria-label="Source quality markers" className="mt-2 flex flex-wrap gap-1">
      {markers.map(({ flag, key, source }) => (
        <Badge
          aria-label={`${flagLabels[flag].accessibleLabel} ${source.sourceSystem} source`}
          className="border-amber-200 bg-amber-50 text-amber-800"
          key={key}
          title={titleFor(source, flag)}
          variant="outline"
        >
          {flagLabels[flag].label}
        </Badge>
      ))}
    </div>
  );
}
