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
import { WallboardAircraftCarousel } from "./wallboard-aircraft-carousel";
import { WallboardCommandBar } from "./wallboard-command-bar";
import { WallboardScorecardBand } from "./wallboard-scorecard-band";
import { WallboardSideIndex } from "./wallboard-side-index";

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

export function SeniorWallboardLayout() {
  const board = deriveCurrentBoard(bneBaselineScenario.events, boardSettings, boardNowIso);
  const scorecard = deriveDailyScorecard(board);
  const aircraftCards = deriveAircraftCards(board);
  const benchmarkCurrent = {
    runtimeMinutes: scorecard.runtimeMinutesToday,
    fuelKg: scorecard.estimatedFuelKgToday,
    temperatureC: board.weather?.temperatureC ?? 0,
  };

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

        <div className="grid min-h-0 flex-1 grid-cols-[minmax(0,1fr)_440px] gap-4 px-6 pb-6">
          <WallboardAircraftCarousel aircraft={aircraftCards} />

          <WallboardSideIndex aircraft={aircraftCards} />
        </div>
      </div>
    </main>
  );
}
