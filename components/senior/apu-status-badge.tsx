import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils/cn";

export type ApuStatusBadgeState = "on" | "pending" | "off";

type ApuStatusBadgeProps = {
  state: ApuStatusBadgeState;
};

const statusCopy: Record<
  ApuStatusBadgeState,
  { label: string; ledLabel: string; badgeClass: string; ledClass: string }
> = {
  on: {
    label: "APU On",
    ledLabel: "APU on active",
    badgeClass: "border-virgin-red/40 bg-white text-virgin-red",
    ledClass: "bg-virgin-red shadow-[0_0_0_3px_rgba(225,10,10,0.12)] motion-safe:animate-pulse",
  },
  pending: {
    label: "Pending off",
    ledLabel: "APU off confirmation pending",
    badgeClass: "border-amber-400/50 bg-white text-amber-700",
    ledClass: "bg-amber-500 shadow-[0_0_0_3px_rgba(245,158,11,0.14)] motion-safe:animate-pulse",
  },
  off: {
    label: "APU Off",
    ledLabel: "APU off",
    badgeClass: "border-green-500/40 bg-white text-green-700",
    ledClass: "bg-green-600 shadow-[0_0_0_3px_rgba(22,163,74,0.12)]",
  },
};

export function ApuStatusBadge({ state }: ApuStatusBadgeProps) {
  const copy = statusCopy[state];

  return (
    <Badge
      aria-label={copy.label}
      className={cn("gap-1.5 px-2 py-0.5 text-xs font-semibold", copy.badgeClass)}
      role="status"
      variant="outline"
    >
      <span
        aria-label={copy.ledLabel}
        className={cn("inline-block size-2 shrink-0 rounded-full", copy.ledClass)}
        role="img"
      />
      {copy.label}
    </Badge>
  );
}
