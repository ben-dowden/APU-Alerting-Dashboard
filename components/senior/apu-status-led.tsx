import { cn } from "@/lib/utils/cn";

export type ApuStatusLedState = "on" | "off" | "pending";

type ApuStatusLedProps = {
  status: ApuStatusLedState;
  size?: "desktop" | "wallboard";
};

const ledLabels: Record<ApuStatusLedState, string> = {
  on: "APU on",
  off: "APU off",
  pending: "Pending manual off confirmation",
};

const ledClasses: Record<ApuStatusLedState, string> = {
  on: "bg-virgin-red shadow-[0_0_0_3px_rgba(225,10,10,0.12)] motion-safe:animate-pulse",
  off: "bg-green-600 shadow-[0_0_0_3px_rgba(22,163,74,0.12)]",
  pending: "bg-amber-500 shadow-[0_0_0_3px_rgba(245,158,11,0.14)]",
};

const ledSizes: Record<NonNullable<ApuStatusLedProps["size"]>, string> = {
  desktop: "size-2.5",
  wallboard: "size-3.5",
};

export function ApuStatusLed({ status, size = "desktop" }: ApuStatusLedProps) {
  const label = ledLabels[status];

  return (
    <span
      aria-label={label}
      className={cn("inline-block shrink-0 rounded-full", ledSizes[size], ledClasses[status])}
      role="img"
      title={label}
    />
  );
}
