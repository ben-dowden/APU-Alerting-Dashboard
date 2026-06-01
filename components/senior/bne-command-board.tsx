"use client";

import { useEffect, useMemo, useRef, useState } from "react";

import type { ReasonSegment } from "@/lib/domain/reason-chain-reducer";
import {
  addReasonNote,
  changeReason,
  correctPreviousReason,
  createDataQualityFlag,
  keepCurrentReason,
  markManualApuOff,
  selectReason,
} from "@/lib/prototype/workflow-actions";
import {
  useRecentlyActionedWorkflowTail,
  useWorkflowEvents,
} from "@/lib/prototype/use-workflow-events";
import {
  bneBoardProjectionSettings,
  deriveBneBoardProjection,
  sourceFreshnessForAircraft,
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

export function BneCommandBoard() {
  const [focusedTail, setFocusedTail] = useState<string>();
  const focusTimeoutRef = useRef<number | undefined>(undefined);
  const workflowEvents = useWorkflowEvents();
  const recentlyActionedTail = useRecentlyActionedWorkflowTail(workflowEvents);
  const projection = useMemo(
    () => deriveBneBoardProjection(workflowEvents),
    [workflowEvents],
  );
  const {
    aircraftCards,
    benchmarkBaselines,
    benchmarkCurrent,
    board,
    localTimeLabel,
    scorecard,
    scorecardTrend,
    sourceFreshnessLabel,
    temperatureLabel,
  } = projection;
  const groundAircraftByTail = new Map(
    board.groundAircraft.map((aircraft) => [aircraft.tail, aircraft]),
  );
  const prioritizedGroundAircraft = aircraftCards
    .map((aircraft) => groundAircraftByTail.get(aircraft.tail))
    .filter((aircraft): aircraft is GroundAircraftState => Boolean(aircraft));
  const runWorkflowAction = (
    aircraft: GroundAircraftState,
    action: (context: WorkflowActionContext) => void,
  ) => {
    const context = workflowContextFor(aircraft, board.nowIso);
    if (!context) {
      return;
    }

    action(context);
  };

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
        localTimeLabel={localTimeLabel}
        sourceFreshnessLabel={sourceFreshnessLabel}
        temperatureLabel={temperatureLabel}
      />

      <main className="mx-auto flex w-full max-w-[1600px] flex-col gap-5 px-4 py-4 sm:px-6 lg:py-6">
        <ScorecardBenchmarkBand
          benchmarkBaselines={benchmarkBaselines}
          benchmarkCurrent={benchmarkCurrent}
          scorecard={scorecard}
          trend={scorecardTrend}
        />
        <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
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
            recentlyActionedTail={recentlyActionedTail}
            taxonomy={bneBoardProjectionSettings.reasonTaxonomy}
          />
          <GroundAircraftTable
            aircraft={prioritizedGroundAircraft}
            onFocusTail={handleFocusTail}
            recentlyActionedTail={recentlyActionedTail}
          />
        </div>
      </main>
    </div>
  );
}
