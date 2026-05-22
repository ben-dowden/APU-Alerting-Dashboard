import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { fuelBurnAssumptionSettings } from "@/lib/fixtures/reference/fuel-assumptions";
import { reasonTaxonomySettings } from "@/lib/fixtures/reference/reason-taxonomy";
import { bneBaselineScenario } from "@/lib/fixtures/scenarios";
import {
  deriveAircraftCards,
  deriveBenchmarkPanel,
  deriveCurrentBoard,
  deriveDailyScorecard,
} from "@/lib/read-models";

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
      <header className="border-b border-neutral-200 bg-white">
        <div className="mx-auto flex w-full max-w-[1600px] flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <div className="flex items-center gap-2">
            <Badge variant="red">BNE</Badge>
            <span className="text-sm font-semibold text-neutral-700">Senior Engineer</span>
          </div>
          <nav className="flex items-center gap-1 text-xs font-semibold text-neutral-600" aria-label="Route shortcuts">
            <Link className="rounded-product px-2 py-1 hover:bg-neutral-100 hover:text-neutral-950" href="/hq">
              HQ
            </Link>
            <Link className="rounded-product px-2 py-1 hover:bg-neutral-100 hover:text-neutral-950" href="/admin">
              Admin
            </Link>
          </nav>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-[1600px] flex-col gap-5 px-4 py-4 sm:px-6 lg:py-6">
        <section className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-normal text-virgin-purple">
              Event-derived read model
            </p>
            <h1 className="mt-1 text-3xl font-semibold tracking-normal text-neutral-950">
              BNE APU Command Board
            </h1>
          </div>
          <div className="flex flex-wrap items-center gap-2 text-sm text-neutral-600">
            <Badge variant="neutral">{board.port}</Badge>
            <span>{aircraftCards.length} aircraft on ground</span>
          </div>
        </section>

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
