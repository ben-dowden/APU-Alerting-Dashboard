import {
  CircleHelp,
  Clock,
  Plane,
  PlugZap,
  PowerOff,
  Route,
  Sparkles,
  Wrench,
  type LucideIcon,
} from "lucide-react";

import { cn } from "@/lib/utils/cn";

type ReasonCharmSize = "desktop" | "wallboard";

type ReasonCharmProps = {
  label: string;
  size?: ReasonCharmSize;
};

type ReasonCharmConfig = {
  Icon: LucideIcon;
  className: string;
};

const reasonCharmSizes: Record<ReasonCharmSize, { charm: string; icon: number }> = {
  desktop: { charm: "size-5", icon: 12 },
  wallboard: { charm: "size-6", icon: 14 },
};

const reasonCharmDefaults: ReasonCharmConfig = {
  Icon: CircleHelp,
  className: "border-neutral-300 bg-neutral-50 text-neutral-700",
};

const reasonCharmConfig: Record<string, ReasonCharmConfig> = {
  "infrastructure unavailable": {
    Icon: PlugZap,
    className: "border-sky-200 bg-sky-50 text-sky-700",
  },
  "cleaning in progress": {
    Icon: Sparkles,
    className: "border-teal-200 bg-teal-50 text-teal-700",
  },
  "engineering requirement": {
    Icon: Wrench,
    className: "border-amber-200 bg-amber-50 text-amber-700",
  },
  "flight operations / pilot discretion": {
    Icon: Plane,
    className: "border-violet-200 bg-violet-50 text-violet-700",
  },
  "logistics / agent on the way": {
    Icon: Route,
    className: "border-indigo-200 bg-indigo-50 text-indigo-700",
  },
  "reason pending": reasonCharmDefaults,
  "reason missing": reasonCharmDefaults,
  "apu off": {
    Icon: PowerOff,
    className: "border-green-200 bg-green-50 text-green-700",
  },
  "pending off": {
    Icon: Clock,
    className: "border-amber-200 bg-amber-50 text-amber-700",
  },
};

const getReasonCharmConfig = (label: string) =>
  reasonCharmConfig[label.toLowerCase()] ?? reasonCharmDefaults;

export function ReasonCharm({ label, size = "desktop" }: ReasonCharmProps) {
  const { Icon, className } = getReasonCharmConfig(label);
  const sizes = reasonCharmSizes[size];

  return (
    <span
      aria-label={`Reason: ${label}`}
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded border",
        sizes.charm,
        className,
      )}
      data-reason-label={label}
      role="img"
      title={label}
    >
      <Icon aria-hidden="true" size={sizes.icon} strokeWidth={2.25} />
    </span>
  );
}
