import { Badge } from "@/components/ui/badge";
import { minutesBetweenIso } from "@/lib/domain/time";
import { fuelBurnAssumptionSettings } from "@/lib/fixtures/reference/fuel-assumptions";
import { reasonTaxonomySettings } from "@/lib/fixtures/reference/reason-taxonomy";
import { standCoordinateReferenceEvents } from "@/lib/fixtures/reference/stand-coordinates";
import { bneBaselineScenario } from "@/lib/fixtures/scenarios";
import {
  deriveAircraftCards,
  deriveCurrentBoard,
  deriveDailyScorecard,
} from "@/lib/read-models";
import { WallboardCommandBar } from "./wallboard-command-bar";
import { WallboardScorecardBand } from "./wallboard-scorecard-band";

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
  standCoordinates: standCoordinateReferenceEvents,
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

const formatDuration = (minutes: number) => {
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  return `${String(hours).padStart(2, "0")}:${String(remainingMinutes).padStart(2, "0")}`;
};

export function SeniorWallboardLayout() {
  const board = deriveCurrentBoard(bneBaselineScenario.events, boardSettings, boardNowIso);
  const scorecard = deriveDailyScorecard(board);
  const aircraftCards = deriveAircraftCards(board);
  const benchmarkCurrent = {
    runtimeMinutes: scorecard.runtimeMinutesToday,
    fuelKg: scorecard.estimatedFuelKgToday,
    temperatureC: board.weather?.temperatureC ?? 0,
  };
  const stagedAircraft = aircraftCards.slice(0, 2);

  return (
    <main className="min-h-screen bg-neutral-950 p-4 text-white">
      <div className="mx-auto flex aspect-video max-h-[calc(100vh-2rem)] min-h-[720px] w-full max-w-[1600px] flex-col overflow-hidden rounded-product border border-neutral-800 bg-neutral-100 text-neutral-950 shadow-2xl">
        <WallboardCommandBar
          localTimeLabel={formatBneLocalTime(board.nowIso)}
          port={board.port}
          sourceFreshnessLabel={sourceFreshnessLabel(board)}
          temperatureLabel={`${board.weather?.temperatureC ?? "--"}°C`}
        />

        <WallboardScorecardBand
          benchmarkBaselines={benchmarkBaselines}
          benchmarkCurrent={benchmarkCurrent}
          scorecard={scorecard}
        />

        <div className="grid min-h-0 flex-1 grid-cols-[minmax(0,1fr)_360px] gap-4 px-6 pb-6">
          <section
            aria-label="Wallboard carousel stage"
            className="grid min-h-0 grid-cols-2 gap-4"
          >
            {stagedAircraft.map((aircraft) => (
              <article
                aria-label={`${aircraft.tail} wallboard aircraft card`}
                className="rounded-product border border-neutral-200 bg-white p-5"
                key={aircraft.tail}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-4xl font-semibold tracking-normal">{aircraft.tail}</p>
                    <p className="mt-2 text-lg font-semibold text-neutral-500">
                      {[aircraft.aircraftType, aircraft.bay].filter(Boolean).join(" / ")}
                    </p>
                  </div>
                  <Badge
                    variant={aircraft.apuState === "on" ? "red" : "outline"}
                    className={
                      aircraft.apuState === "off"
                        ? "border-green-200 bg-green-50 text-green-700"
                        : undefined
                    }
                  >
                    {aircraft.apuState === "on" ? "APU On" : "APU Off"}
                  </Badge>
                </div>

                <dl className="mt-5 grid grid-cols-3 gap-3">
                  <div className="rounded-product bg-neutral-50 p-3">
                    <dt className="text-sm font-semibold text-neutral-500">APU runtime</dt>
                    <dd className="mt-2 text-2xl font-semibold">
                      {formatDuration(aircraft.apuRuntimeMinutes)}
                    </dd>
                  </div>
                  <div className="rounded-product bg-neutral-50 p-3">
                    <dt className="text-sm font-semibold text-neutral-500">Ground time</dt>
                    <dd className="mt-2 text-2xl font-semibold">
                      {formatDuration(aircraft.groundMinutes)}
                    </dd>
                  </div>
                  <div className="rounded-product bg-neutral-50 p-3">
                    <dt className="text-sm font-semibold text-neutral-500">Fuel</dt>
                    <dd className="mt-2 text-2xl font-semibold">{aircraft.estimatedFuelKg} kg</dd>
                  </div>
                </dl>
              </article>
            ))}
          </section>

          <section
            aria-label="Wallboard side index"
            className="min-h-0 rounded-product border border-neutral-200 bg-white"
          >
            <div className="border-b border-neutral-200 px-4 py-3">
              <p className="text-lg font-semibold tracking-normal">Ground aircraft</p>
              <p className="text-sm font-medium text-neutral-500">Current BNE APU signal</p>
            </div>
            <div className="divide-y divide-neutral-100">
              {aircraftCards.map((aircraft) => (
                <div className="flex items-center justify-between gap-3 px-4 py-3" key={aircraft.tail}>
                  <div>
                    <p className="text-xl font-semibold tracking-normal">{aircraft.tail}</p>
                    <p className="text-sm font-medium text-neutral-500">
                      {aircraft.currentReason?.categoryLabel ?? aircraft.statusLabel}
                    </p>
                  </div>
                  <Badge
                    variant={aircraft.apuState === "on" ? "red" : "outline"}
                    className={
                      aircraft.apuState === "off"
                        ? "border-green-200 bg-green-50 text-green-700"
                        : undefined
                    }
                  >
                    {aircraft.apuState === "on" ? "On" : "Off"}
                  </Badge>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
