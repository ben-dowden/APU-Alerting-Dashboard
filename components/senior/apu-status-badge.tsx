import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils/cn";

export type ApuStatusBadgeState = "on" | "pending" | "off";
type ApuStatusBadgeSize = "desktop" | "wallboard";

type ApuStatusBadgeProps = {
  size?: ApuStatusBadgeSize;
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

const sizeClasses: Record<ApuStatusBadgeSize, { badge: string; led: string }> = {
  desktop: {
    badge: "gap-1.5 px-2 py-0.5 text-xs",
    led: "size-2",
  },
  wallboard: {
    badge: "gap-2 px-3 py-1 text-base",
    led: "size-3",
  },
};

export function ApuStatusBadge({ size = "desktop", state }: ApuStatusBadgeProps) {
  const copy = statusCopy[state];
  const scale = sizeClasses[size];

  return (
    <Badge
      aria-label={copy.label}
      className={cn(scale.badge, "font-semibold", copy.badgeClass)}
      role="status"
      variant="outline"
    >
      <span
        aria-label={copy.ledLabel}
        className={cn("inline-block shrink-0 rounded-full", scale.led, copy.ledClass)}
        role="img"
      />
      {copy.label}
    </Badge>
  );
}
