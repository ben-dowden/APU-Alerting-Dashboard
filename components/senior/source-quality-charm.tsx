import type { SourceCharm, SourceQualityFlag } from "@/lib/read-models";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils/cn";

type SourceQualityCharmProps = {
  size?: "desktop" | "wallboard";
  sourceCharms: SourceCharm[];
};

type VisibleSourceQualityFlag = Exclude<SourceQualityFlag, "fallback_assumption">;

const flagLabels: Record<
  VisibleSourceQualityFlag,
  { label: string; accessibleLabel: string; severity: "critical" | "warning"; rank: number }
> = {
  conflicting: {
    label: "Conflict",
    accessibleLabel: "Conflict",
    severity: "critical",
    rank: 1,
  },
  stale: {
    label: "Stale",
    accessibleLabel: "Stale",
    severity: "warning",
    rank: 2,
  },
  low_confidence: {
    label: "Low confidence",
    accessibleLabel: "Low confidence",
    severity: "warning",
    rank: 3,
  },
  unknown: {
    label: "Unknown",
    accessibleLabel: "Unknown",
    severity: "warning",
    rank: 4,
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

const titleFor = (markers: Array<{ flag: VisibleSourceQualityFlag; source: SourceCharm }>) =>
  markers
    .map(({ flag, source }) => {
      const latency = source.sourceLatencyMinutes ? `, ${source.sourceLatencyMinutes}m latency` : "";
      return `${flagLabels[flag].accessibleLabel}: ${source.sourceSystem} received ${source.receivedAt}${latency}`;
    })
    .join(" | ");

const sizeClasses = {
  desktop: "px-1.5 py-0 text-[10px] leading-4",
  wallboard: "px-2 py-0.5 text-xs leading-5",
};

export function SourceQualityCharm({ size = "desktop", sourceCharms }: SourceQualityCharmProps) {
  const markers = sourceCharms.flatMap((source) =>
    flagsForCharm(source).map((flag) => ({
      flag,
      source,
    })),
  );
  const strongest = markers.sort(
    (left, right) => flagLabels[left.flag].rank - flagLabels[right.flag].rank,
  )[0];

  if (!strongest) {
    return null;
  }

  const label = flagLabels[strongest.flag];

  return (
    <Badge
      aria-label={`Source issue: ${label.accessibleLabel}`}
      className={cn(
        sizeClasses[size],
        "font-semibold",
        label.severity === "critical"
          ? "border-virgin-red/30 bg-virgin-red/5 text-virgin-red"
          : "border-amber-300 bg-amber-50 text-amber-800",
      )}
      title={titleFor(markers)}
      variant="outline"
    >
      {label.label}
    </Badge>
  );
}
