import { fuelBurnAssumptionSettings } from "@/lib/fixtures/reference/fuel-assumptions";
import { reasonTaxonomySettings } from "@/lib/fixtures/reference/reason-taxonomy";
import { bneBaselineScenario } from "@/lib/fixtures/scenarios";
import { minutesBetweenIso } from "@/lib/domain/time";
import {
  deriveAircraftCards,
  deriveBenchmarkPanel,
  deriveCurrentBoard,
  deriveDailyScorecard,
} from "@/lib/read-models";

import { CommandBar } from "./command-bar";

const boardNowIso = "2026-05-22T08:55:00.000Z";

const benchmarkBaselines = {
  similar_temperature: { runtimeMinutes: 38, fuelKg: 70 },
  weekly_average: { runtimeMinutes: 44, fuelKg: 81 },
  monthly_average: { runtimeMinutes: 49, fuelKg: 90 },
  annual_average: { runtimeMinutes: 52, fuelKg: 96 },
};

const boardSettings = {
  reasonTaxonomy: reasonTaxonomySettings.payload.snapshot,
  fuelBurnAssumptions: fuelBurnAssumptionSettings,
};

const formatBneLocalTime = (iso: string) =>
  `${new Intl.DateTimeFormat("en-AU", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: "Australia/Brisbane",
  }).format(new Date(iso))} AEST`;

const latestSourceReceivedAt = (board: ReturnType<typeof deriveCurrentBoard>) =>
  board.groundAircraft
    .flatMap((aircraft) => aircraft.sourceCharms.map((source) => source.receivedAt))
    .sort()
    .at(-1);

const sourceFreshnessLabel = (board: ReturnType<typeof deriveCurrentBoard>) => {
  const latestReceivedAt = latestSourceReceivedAt(board);
  return latestReceivedAt
    ? `Feed fresh ${minutesBetweenIso(latestReceivedAt, board.nowIso)}m ago`
    : "Feed pending";
};

export function BneCommandBoard() {
  const board = deriveCurrentBoard(bneBaselineScenario.events, boardSettings, boardNowIso);
  const scorecard = deriveDailyScorecard(board);
  const aircraftCards = deriveAircraftCards(board);
  const benchmarkPanel = deriveBenchmarkPanel(
    {
      runtimeMinutes: scorecard.runtimeMinutesToday,
      fuelKg: scorecard.estimatedFuelKgToday,
      temperatureC: board.weather?.temperatureC ?? 0,
    },
    "similar_temperature",
    benchmarkBaselines,
  );

  return (
    <div className="min-h-screen bg-neutral-100 text-neutral-950">
      <CommandBar
        localTimeLabel={formatBneLocalTime(board.nowIso)}
        port={board.port}
        sourceFreshnessLabel={sourceFreshnessLabel(board)}
        temperatureLabel={`${board.weather?.temperatureC ?? "--"}°C`}
      />

      <main className="mx-auto flex w-full max-w-[1600px] flex-col gap-5 px-4 py-4 sm:px-6 lg:py-6">
        <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4" aria-label="Board adapter preview">
          <div className="rounded-product border border-neutral-200 bg-white p-4">
            <p className="text-xs font-semibold uppercase tracking-normal text-neutral-500">APU on now</p>
            <p className="mt-2 text-2xl font-semibold">{scorecard.activeApuCount}</p>
          </div>
          <div className="rounded-product border border-neutral-200 bg-white p-4">
            <p className="text-xs font-semibold uppercase tracking-normal text-neutral-500">Runtime today</p>
            <p className="mt-2 text-2xl font-semibold">{scorecard.runtimeMinutesToday} min</p>
          </div>
          <div className="rounded-product border border-neutral-200 bg-white p-4">
            <p className="text-xs font-semibold uppercase tracking-normal text-neutral-500">Fuel burned today</p>
            <p className="mt-2 text-2xl font-semibold">{scorecard.estimatedFuelKgToday} kg</p>
          </div>
          <div className="rounded-product border border-neutral-200 bg-white p-4">
            <p className="text-xs font-semibold uppercase tracking-normal text-neutral-500">Active benchmark</p>
            <p className="mt-2 text-2xl font-semibold">
              {benchmarkPanel.activeComparison.temperatureBandLabel}
            </p>
          </div>
        </section>
      </main>
    </div>
  );
}
