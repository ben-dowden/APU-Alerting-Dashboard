"use client";

import { useEffect, useState } from "react";

import type {
  AircraftCardReadModel,
  BenchmarkBaselines,
  BenchmarkCurrent,
  DailyScorecard,
} from "@/lib/read-models";
import { WallboardAircraftStage } from "./wallboard-aircraft-stage";
import { WallboardCommandBar } from "./wallboard-command-bar";
import { WallboardScorecardBand } from "./wallboard-scorecard-band";
import {
  activeBenchmarkModeForElapsed,
  wallboardRotationTickMs,
} from "./wallboard-rotation";

type WallboardRotationShellProps = {
  aircraftCards: AircraftCardReadModel[];
  benchmarkBaselines: BenchmarkBaselines;
  benchmarkCurrent: BenchmarkCurrent;
  localTimeLabel: string;
  scorecard: DailyScorecard;
  sourceFreshnessLabel: string;
  temperatureLabel: string;
};

export function WallboardRotationShell({
  aircraftCards,
  benchmarkBaselines,
  benchmarkCurrent,
  localTimeLabel,
  scorecard,
  sourceFreshnessLabel,
  temperatureLabel,
}: WallboardRotationShellProps) {
  const [elapsedMs, setElapsedMs] = useState(0);
  const activeBenchmarkMode = activeBenchmarkModeForElapsed(elapsedMs);

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setElapsedMs((currentElapsedMs) => currentElapsedMs + wallboardRotationTickMs);
    }, wallboardRotationTickMs);

    return () => window.clearInterval(intervalId);
  }, []);

  return (
    <>
      <WallboardCommandBar
        localTimeLabel={localTimeLabel}
        sourceFreshnessLabel={sourceFreshnessLabel}
        temperatureLabel={temperatureLabel}
      />

      <WallboardScorecardBand
        activeBenchmarkMode={activeBenchmarkMode}
        benchmarkBaselines={benchmarkBaselines}
        benchmarkCurrent={benchmarkCurrent}
        scorecard={scorecard}
      />

      <WallboardAircraftStage aircraft={aircraftCards} elapsedMs={elapsedMs} />
    </>
  );
}
