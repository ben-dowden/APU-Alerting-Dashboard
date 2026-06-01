import type { BenchmarkMode } from "@/lib/read-models";

export const wallboardCardPageSize = 4;
export const wallboardSidebarPageSize = 16;
export const wallboardCardRotationIntervalMs = 5000;
export const wallboardSidebarRotationIntervalMs = 20000;
export const wallboardBenchmarkRotationIntervalMs = 5000;
export const wallboardRotationTickMs = 1000;

export const wallboardBenchmarkModes: BenchmarkMode[] = [
  "similar_temperature",
  "weekly_average",
  "monthly_average",
  "annual_average",
];

export const remainingFor = (elapsedMs: number, intervalMs: number) =>
  intervalMs - (elapsedMs % intervalMs);

export const activeBenchmarkModeForElapsed = (elapsedMs: number) => {
  const activeIndex =
    Math.floor(elapsedMs / wallboardBenchmarkRotationIntervalMs) % wallboardBenchmarkModes.length;

  return wallboardBenchmarkModes[activeIndex];
};
