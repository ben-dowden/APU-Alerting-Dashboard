import type { AvailabilityState } from "../types";

interface StatusDotProps {
  value: AvailabilityState;
}

export function StatusDot({ value }: StatusDotProps) {
  return <span className={`status-dot status-dot--${value}`} aria-label={value} />;
}
