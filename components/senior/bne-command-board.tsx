"use client";

import { useEffect, useMemo, useRef, useState } from "react";

import type { ReasonSegment } from "@/lib/domain/reason-chain-reducer";
import type { DomainEvent } from "@/lib/events";
import { fuelBurnAssumptionSettings } from "@/lib/fixtures/reference/fuel-assumptions";
import { reasonTaxonomySettings } from "@/lib/fixtures/reference/reason-taxonomy";
import { standCoordinateReferenceEvents } from "@/lib/fixtures/reference/stand-coordinates";
import { bneBaselineScenario } from "@/lib/fixtures/scenarios";
import { minutesBetweenIso } from "@/lib/domain/time";
import {
  addReasonNote,
  changeReason,
  correctPreviousReason,
  createDataQualityFlag,
  keepCurrentReason,
  markManualApuOff,
  selectReason,
} from "@/lib/prototype/workflow-actions";
import { readWorkflowEvents } from "@/lib/prototype/workflow-event-store";
import {
  deriveAircraftCards,
  deriveBenchmarkPanel,
  deriveCurrentBoard,
  deriveDailyScorecard,
  type AircraftCardReadModel,
  type GroundAircraftState,
} from "@/lib/read-models";

import { aircraftCardDomId, aircraftFocusHighlightMs } from "./aircraft-card-focus";
import { CommandBar } from "./command-bar";
import { ScorecardBenchmarkBand } from "./scorecard-benchmark-band";
import { AircraftBoard } from "./aircraft-board";
import { GroundAircraftTable } from "./ground-aircraft-table";
import type { DataQualityFlagActionInput } from "./data-quality-flag-action";
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
  standCoordinates: standCoordinateReferenceEvents,
};

const workflowActorId = "senior-engineer-bne";

type WorkflowActionContext = {
  port: "BNE";
  tail: string;
  apuEventId: string;
  occurredAt: string;
};

const workflowContextFor = (
  aircraft: GroundAircraftState,
  occurredAt: string,
): WorkflowActionContext | undefined =>
  aircraft.apuEvent
    ? {
        port: "BNE",
        tail: aircraft.tail,
        apuEventId: aircraft.apuEvent.apuEventId,
        occurredAt,
      }
    : undefined;

const workflowIdentity = (context: WorkflowActionContext) => ({
  port: context.port,
  tail: context.tail,
  apuEventId: context.apuEventId,
});

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

const sourceFreshnessForAircraft = (aircraft: GroundAircraftState, nowIso: string) => {
  const latestReceivedAt = aircraft.sourceCharms
    .map((source) => source.receivedAt)
    .sort()
    .at(-1);

  return {
    latestReceivedAt,
    latencyMinutes: latestReceivedAt ? minutesBetweenIso(latestReceivedAt, nowIso) : undefined,
    sourceSystems: [...new Set(aircraft.sourceCharms.map((source) => source.sourceSystem))],
  };
};

export function BneCommandBoard() {
  const [workflowEvents, setWorkflowEvents] = useState<DomainEvent[]>([]);
  const [focusedTail, setFocusedTail] = useState<string>();
  const focusTimeoutRef = useRef<number | undefined>(undefined);
  const refreshWorkflowEvents = () => setWorkflowEvents(readWorkflowEvents());
  const boardEvents = useMemo(
    () => [...bneBaselineScenario.events, ...workflowEvents],
    [workflowEvents],
  );
  const board = deriveCurrentBoard(boardEvents, boardSettings, boardNowIso);
  const scorecard = deriveDailyScorecard(board);
  const aircraftCards = deriveAircraftCards(board);
  const groundAircraftByTail = new Map(
    board.groundAircraft.map((aircraft) => [aircraft.tail, aircraft]),
  );
  const prioritizedGroundAircraft = aircraftCards
    .map((aircraft) => groundAircraftByTail.get(aircraft.tail))
    .filter((aircraft): aircraft is GroundAircraftState => Boolean(aircraft));
  const benchmarkPanel = deriveBenchmarkPanel(
    {
      runtimeMinutes: scorecard.runtimeMinutesToday,
      fuelKg: scorecard.estimatedFuelKgToday,
      temperatureC: board.weather?.temperatureC ?? 0,
    },
    "similar_temperature",
    benchmarkBaselines,
  );
  const runWorkflowAction = (
    aircraft: GroundAircraftState,
    action: (context: WorkflowActionContext) => void,
  ) => {
    const context = workflowContextFor(aircraft, board.nowIso);
    if (!context) {
      return;
    }

    action(context);
    refreshWorkflowEvents();
  };

  useEffect(() => {
    refreshWorkflowEvents();
  }, []);

  useEffect(() => {
    return () => {
      if (focusTimeoutRef.current) {
        window.clearTimeout(focusTimeoutRef.current);
      }
    };
  }, []);

  const handleSelectReason = (
    aircraft: GroundAircraftState,
    selection: ReasonPickerSelection,
  ) => {
    runWorkflowAction(aircraft, (context) => selectReason({
      ...workflowIdentity(context),
      ...selection,
      selectedBy: workflowActorId,
      selectedAt: context.occurredAt,
    }));
  };

  const handleChangeReason = (
    aircraft: GroundAircraftState,
    currentReason: ReasonSegment,
    selection: ReasonPickerSelection,
  ) => {
    runWorkflowAction(aircraft, (context) => changeReason({
      ...workflowIdentity(context),
      previousReasonSegmentId: currentReason.reasonSegmentId,
      previousCategoryId: currentReason.categoryId,
      previousDetailId: currentReason.detailId,
      ...selection,
      selectedBy: workflowActorId,
      selectedAt: context.occurredAt,
    }));
  };

  const handleKeepCurrentReason = (
    aircraft: GroundAircraftState,
    currentReason: ReasonSegment,
  ) => {
    const reviewDueAt = aircraft.reasonChain.reviewDueAt;
    if (!reviewDueAt) {
      return;
    }

    runWorkflowAction(aircraft, (context) => keepCurrentReason({
      ...workflowIdentity(context),
      reasonSegmentId: currentReason.reasonSegmentId,
      categoryId: currentReason.categoryId,
      detailId: currentReason.detailId,
      keptBy: workflowActorId,
      keptAt: context.occurredAt,
      reviewDueAt,
    }));
  };

  const handleAddReasonNote = (
    aircraft: GroundAircraftState,
    currentReason: ReasonSegment,
    note: string,
  ) => {
    runWorkflowAction(aircraft, (context) => addReasonNote({
      ...workflowIdentity(context),
      reasonSegmentId: currentReason.reasonSegmentId,
      note,
      addedBy: workflowActorId,
      addedAt: context.occurredAt,
    }));
  };

  const handleCorrectReason = (
    aircraft: GroundAircraftState,
    previousReason: ReasonSegment,
    selection: ReasonPickerSelection,
  ) => {
    runWorkflowAction(aircraft, (context) => correctPreviousReason({
      ...workflowIdentity(context),
      previousReasonSegmentId: previousReason.reasonSegmentId,
      previousCategoryId: previousReason.categoryId,
      previousDetailId: previousReason.detailId,
      ...selection,
      selectedBy: workflowActorId,
      selectedAt: context.occurredAt,
    }));
  };

  const handleCreateDataQualityFlag = (
    aircraft: GroundAircraftState,
    card: AircraftCardReadModel,
    input: DataQualityFlagActionInput,
  ) => {
    createDataQualityFlag({
      port: "BNE",
      tail: aircraft.tail,
      apuEventId: aircraft.apuEvent?.apuEventId,
      aircraftGroundEventId: aircraft.sourceEventIds[0],
      bay: aircraft.bay,
      issueType: input.issueType,
      note: input.note,
      summary: input.note ?? `Data quality flag for ${aircraft.tail}`,
      createdBy: workflowActorId,
      persona: "senior-engineer-bne",
      createdAt: board.nowIso,
      relatedEventIds: aircraft.sourceEventIds,
      derivedState: {
        apuState: card.apuState,
        urgencyBucket: card.urgencyBucket,
        statusLabel: card.statusLabel,
        manualOffPending: card.manualOffPending,
      },
      sourceFreshness: sourceFreshnessForAircraft(aircraft, board.nowIso),
    });
    refreshWorkflowEvents();
  };

  const handleMarkManualApuOff = (aircraft: GroundAircraftState) => {
    runWorkflowAction(aircraft, (context) => markManualApuOff({
      ...workflowIdentity(context),
      observedBy: workflowActorId,
      observedAt: context.occurredAt,
    }));
  };

  const handleFocusTail = (tail: string) => {
    const cardElement = document.getElementById(aircraftCardDomId(tail));

    setFocusedTail(tail);
    cardElement?.scrollIntoView({ behavior: "smooth", block: "nearest" });
    cardElement?.focus({ preventScroll: true });

    if (focusTimeoutRef.current) {
      window.clearTimeout(focusTimeoutRef.current);
    }

    focusTimeoutRef.current = window.setTimeout(() => {
      setFocusedTail((currentTail) => (currentTail === tail ? undefined : currentTail));
      focusTimeoutRef.current = undefined;
    }, aircraftFocusHighlightMs);
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
            focusedTail={focusedTail}
            groundAircraft={board.groundAircraft}
            onAddReasonNote={handleAddReasonNote}
            onChangeReason={handleChangeReason}
            onCorrectReason={handleCorrectReason}
            onCreateDataQualityFlag={handleCreateDataQualityFlag}
            onKeepCurrentReason={handleKeepCurrentReason}
            onMarkManualApuOff={handleMarkManualApuOff}
            onSelectReason={handleSelectReason}
            taxonomy={boardSettings.reasonTaxonomy}
          />
          <GroundAircraftTable aircraft={prioritizedGroundAircraft} onFocusTail={handleFocusTail} />
        </div>
      </main>
    </div>
  );
}
