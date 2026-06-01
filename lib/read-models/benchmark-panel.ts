export type BenchmarkMode =
  | "similar_temperature"
  | "weekly_average"
  | "monthly_average"
  | "annual_average";

export type BenchmarkCurrent = {
  runtimeMinutes: number;
  fuelKg: number;
  temperatureC: number;
  apuIntensityPercent: number;
};

export type BenchmarkBaseline = {
  runtimeMinutes: number;
  fuelKg: number;
  apuIntensityPercent?: number;
};

export type BenchmarkBaselines = Record<BenchmarkMode, BenchmarkBaseline>;

export type BenchmarkComparison = {
  mode: BenchmarkMode;
  basisLabel: string;
  temperatureBandLabel?: string;
  fuelDeltaKg: number;
  fuelDeltaPercent: number;
  runtimeDeltaMinutes: number;
  runtimeDeltaPercent: number;
  apuIntensityDeltaPoints?: number;
  apuIntensityComparisonLabel: string;
  dollarDelta?: undefined;
};

export type BenchmarkPanel = {
  activeComparison: BenchmarkComparison;
  modes: Array<{
    mode: BenchmarkMode;
    label: string;
    isActive: boolean;
  }>;
};

const labels: Record<BenchmarkMode, string> = {
  similar_temperature: "Similar temp",
  weekly_average: "Week",
  monthly_average: "Month",
  annual_average: "Year",
};

const basisLabels: Record<BenchmarkMode, string> = {
  similar_temperature: "Similar-temperature days",
  weekly_average: "Weekly average",
  monthly_average: "Monthly average",
  annual_average: "Annual average",
};

const intensityBasisLabels: Record<BenchmarkMode, string> = {
  similar_temperature: "similar temp",
  weekly_average: "last week",
  monthly_average: "last month",
  annual_average: "last year",
};

const defaultBaselines: BenchmarkBaselines = {
  similar_temperature: { runtimeMinutes: 0, fuelKg: 0 },
  weekly_average: { runtimeMinutes: 0, fuelKg: 0 },
  monthly_average: { runtimeMinutes: 0, fuelKg: 0 },
  annual_average: { runtimeMinutes: 0, fuelKg: 0 },
};

const roundOne = (value: number) => Math.round(value * 10) / 10;

const formatCompactNumber = (value: number) =>
  Number.isInteger(value) ? `${value}` : `${value}`;

const formatSignedNumber = (value: number) =>
  value > 0 ? `+${formatCompactNumber(value)}` : formatCompactNumber(value);

const percentDelta = (current: number, baseline: number) =>
  baseline === 0 ? 0 : roundOne(((current - baseline) / baseline) * 100);

const temperatureBandLabel = (temperatureC: number) => {
  const rounded = Math.round(temperatureC);
  return `${rounded - 1}-${rounded + 1}°C`;
};

const intensityComparisonFor = (
  current: BenchmarkCurrent,
  mode: BenchmarkMode,
  baseline: BenchmarkBaseline,
) => {
  if (baseline.apuIntensityPercent === undefined) {
    return {
      apuIntensityDeltaPoints: undefined,
      apuIntensityComparisonLabel: "baseline pending",
    };
  }

  const deltaPoints = roundOne(current.apuIntensityPercent - baseline.apuIntensityPercent);

  return {
    apuIntensityDeltaPoints: deltaPoints,
    apuIntensityComparisonLabel: `vs ${intensityBasisLabels[mode]} ${formatSignedNumber(
      deltaPoints,
    )} pts`,
  };
};

const comparisonFor = (
  current: BenchmarkCurrent,
  activeMode: BenchmarkMode,
  baseline: BenchmarkBaseline,
): BenchmarkComparison => ({
  mode: activeMode,
  basisLabel: basisLabels[activeMode],
  temperatureBandLabel:
    activeMode === "similar_temperature" ? temperatureBandLabel(current.temperatureC) : undefined,
  fuelDeltaKg: roundOne(current.fuelKg - baseline.fuelKg),
  fuelDeltaPercent: percentDelta(current.fuelKg, baseline.fuelKg),
  runtimeDeltaMinutes: roundOne(current.runtimeMinutes - baseline.runtimeMinutes),
  runtimeDeltaPercent: percentDelta(current.runtimeMinutes, baseline.runtimeMinutes),
  ...intensityComparisonFor(current, activeMode, baseline),
  dollarDelta: undefined,
});

export const deriveBenchmarkPanel = (
  current: BenchmarkCurrent,
  activeMode: BenchmarkMode = "similar_temperature",
  baselines: BenchmarkBaselines = defaultBaselines,
): BenchmarkPanel => ({
  activeComparison: comparisonFor(current, activeMode, baselines[activeMode]),
  modes: (Object.keys(labels) as BenchmarkMode[]).map((mode) => ({
    mode,
    label: labels[mode],
    isActive: mode === activeMode,
  })),
});
