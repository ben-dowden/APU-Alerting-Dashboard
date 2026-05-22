"use client";

import { useEffect, useMemo, useState } from "react";

import type { ReasonSegment } from "@/lib/domain/reason-chain-reducer";
import type { DomainEvent } from "@/lib/events";
import { fuelBurnAssumptionSettings } from "@/lib/fixtures/reference/fuel-assumptions";
import { reasonTaxonomySettings } from "@/lib/fixtures/reference/reason-taxonomy";
import { bneBaselineScenario } from "@/lib/fixtures/scenarios";
import { minutesBetweenIso } from "@/lib/domain/time";
import {
  addReasonNote,
  changeReason,
  correctPreviousReason,
  keepCurrentReason,
  selectReason,
} from "@/lib/prototype/workflow-actions";
import { readWorkflowEvents } from "@/lib/prototype/workflow-event-store";
import {
  deriveAircraftCards,
  deriveBenchmarkPanel,
  deriveCurrentBoard,
  deriveDailyScorecard,
  type GroundAircraftState,
} from "@/lib/read-models";

import { CommandBar } from "./command-bar";
import { ScorecardBenchmarkBand } from "./scorecard-benchmark-band";
import { AircraftBoard } from "./aircraft-board";
import { GroundAircraftTable } from "./ground-aircraft-table";
import type { ReasonPickerSelection } from "./reason-picker";

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

const workflowActorId = "senior-engineer-bne";

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
  const [workflowEvents, setWorkflowEvents] = useState<DomainEvent[]>([]);
  const refreshWorkflowEvents = () => setWorkflowEvents(readWorkflowEvents());
  const boardEvents = useMemo(
    () => [...bneBaselineScenario.events, ...workflowEvents],
    [workflowEvents],
  );
  const board = deriveCurrentBoard(boardEvents, boardSettings, boardNowIso);
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

  useEffect(() => {
    refreshWorkflowEvents();
  }, []);

  const handleSelectReason = (
    aircraft: GroundAircraftState,
    selection: ReasonPickerSelection,
  ) => {
    if (!aircraft.apuEvent) {
      return;
    }

    selectReason({
      port: "BNE",
      tail: aircraft.tail,
      apuEventId: aircraft.apuEvent.apuEventId,
      ...selection,
      selectedBy: workflowActorId,
      selectedAt: board.nowIso,
    });
    refreshWorkflowEvents();
  };

  const handleChangeReason = (
    aircraft: GroundAircraftState,
    currentReason: ReasonSegment,
    selection: ReasonPickerSelection,
  ) => {
    if (!aircraft.apuEvent) {
      return;
    }

    changeReason({
      port: "BNE",
      tail: aircraft.tail,
      apuEventId: aircraft.apuEvent.apuEventId,
      previousReasonSegmentId: currentReason.reasonSegmentId,
      previousCategoryId: currentReason.categoryId,
      previousDetailId: currentReason.detailId,
      ...selection,
      selectedBy: workflowActorId,
      selectedAt: board.nowIso,
    });
    refreshWorkflowEvents();
  };

  const handleKeepCurrentReason = (
    aircraft: GroundAircraftState,
    currentReason: ReasonSegment,
  ) => {
    if (!aircraft.apuEvent || !aircraft.reasonChain.reviewDueAt) {
      return;
    }

    keepCurrentReason({
      port: "BNE",
      tail: aircraft.tail,
      apuEventId: aircraft.apuEvent.apuEventId,
      reasonSegmentId: currentReason.reasonSegmentId,
      categoryId: currentReason.categoryId,
      detailId: currentReason.detailId,
      keptBy: workflowActorId,
      keptAt: board.nowIso,
      reviewDueAt: aircraft.reasonChain.reviewDueAt,
    });
    refreshWorkflowEvents();
  };

  const handleAddReasonNote = (
    aircraft: GroundAircraftState,
    currentReason: ReasonSegment,
    note: string,
  ) => {
    if (!aircraft.apuEvent) {
      return;
    }

    addReasonNote({
      port: "BNE",
      tail: aircraft.tail,
      apuEventId: aircraft.apuEvent.apuEventId,
      reasonSegmentId: currentReason.reasonSegmentId,
      note,
      addedBy: workflowActorId,
      addedAt: board.nowIso,
    });
    refreshWorkflowEvents();
  };

  const handleCorrectReason = (
    aircraft: GroundAircraftState,
    previousReason: ReasonSegment,
    selection: ReasonPickerSelection,
  ) => {
    if (!aircraft.apuEvent) {
      return;
    }

    correctPreviousReason({
      port: "BNE",
      tail: aircraft.tail,
      apuEventId: aircraft.apuEvent.apuEventId,
      previousReasonSegmentId: previousReason.reasonSegmentId,
      previousCategoryId: previousReason.categoryId,
      previousDetailId: previousReason.detailId,
      ...selection,
      selectedBy: workflowActorId,
      selectedAt: board.nowIso,
    });
    refreshWorkflowEvents();
  };

  return (
    <div className="min-h-screen bg-neutral-100 text-neutral-950">
      <CommandBar
        localTimeLabel={formatBneLocalTime(board.nowIso)}
        port={board.port}
        sourceFreshnessLabel={sourceFreshnessLabel(board)}
        temperatureLabel={`${board.weather?.temperatureC ?? "--"}°C`}
      />

      <main className="mx-auto flex w-full max-w-[1600px] flex-col gap-5 px-4 py-4 sm:px-6 lg:py-6">
        <ScorecardBenchmarkBand benchmark={benchmarkPanel} scorecard={scorecard} />
        <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_420px]">
          <AircraftBoard
            aircraft={aircraftCards}
            groundAircraft={board.groundAircraft}
            onAddReasonNote={handleAddReasonNote}
            onChangeReason={handleChangeReason}
            onCorrectReason={handleCorrectReason}
            onKeepCurrentReason={handleKeepCurrentReason}
            onSelectReason={handleSelectReason}
            taxonomy={boardSettings.reasonTaxonomy}
          />
          <GroundAircraftTable aircraft={board.groundAircraft} />
        </div>
      </main>
    </div>
  );
}
