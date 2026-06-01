import { cn } from "@/lib/utils/cn";

type ScorecardSparklineProps = {
  className?: string;
  label: string;
  values: readonly number[];
};

const horizontalLine = "0,24 120,24";

const pointsFor = (values: readonly number[]) => {
  if (values.length < 2) {
    return horizontalLine;
  }

  const minValue = Math.min(...values);
  const maxValue = Math.max(...values);
  const valueRange = maxValue - minValue;
  const xStep = 120 / (values.length - 1);

  return values
    .map((value, index) => {
      const x = index * xStep;
      const y = valueRange === 0 ? 24 : 40 - ((value - minValue) / valueRange) * 32;

      return `${Number(x.toFixed(1))},${Number(y.toFixed(1))}`;
    })
    .join(" ");
};

export function ScorecardSparkline({
  className,
  label,
  values,
}: ScorecardSparklineProps) {
  const points = pointsFor(values);

  return (
    <svg
      aria-label={label}
      className={cn("h-10 w-full text-neutral-300", className)}
      preserveAspectRatio="none"
      role="img"
      viewBox="0 0 120 48"
    >
      <title>{label}</title>
      <polyline
        fill="none"
        points={points}
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="3"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}
