"use client";

import { History, RefreshCw } from "lucide-react";
import { useState, type ReactNode } from "react";

import type { ReasonSegment } from "@/lib/domain/reason-chain-reducer";
import type { ReasonTaxonomySnapshot } from "@/lib/events";
import type { AircraftCardReadModel, GroundAircraftState } from "@/lib/read-models";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils/cn";

import { aircraftCardDomId } from "./aircraft-card-focus";
import { ApuStatusBadge, type ApuStatusBadgeState } from "./apu-status-badge";
import { CardReasonDrawer, type ReasonDrawerPlacement } from "./card-reason-drawer";
import {
  DataQualityFlagAction,
  type DataQualityFlagActionInput,
} from "./data-quality-flag-action";
import { ManualApuOffAction } from "./manual-apu-off-action";
import { ProximityHoverCard } from "./proximity-hover-card";
import { ReasonPicker, type ReasonPickerSelection } from "./reason-picker";
import { SourceQualityCharm } from "./source-quality-charm";

export type ReasonWorkflowHandlers = {
  onSelectReason: (aircraft: GroundAircraftState, selection: ReasonPickerSelection) => void;
  onChangeReason: (
    aircraft: GroundAircraftState,
    currentReason: ReasonSegment,
    selection: ReasonPickerSelection,
  ) => void;
  onKeepCurrentReason: (aircraft: GroundAircraftState, currentReason: ReasonSegment) => void;
  onAddReasonNote: (aircraft: GroundAircraftState, currentReason: ReasonSegment, note: string) => void;
  onCorrectReason: (
    aircraft: GroundAircraftState,
    previousReason: ReasonSegment,
    selection: ReasonPickerSelection,
  ) => void;
  onCreateDataQualityFlag: (
    aircraft: GroundAircraftState,
    card: AircraftCardReadModel,
    input: DataQualityFlagActionInput,
  ) => void;
  onMarkManualApuOff: (aircraft: GroundAircraftState) => void;
};

type ReasonCaptureHandlers = Pick<
  ReasonWorkflowHandlers,
  "onSelectReason" | "onChangeReason" | "onKeepCurrentReason"
>;

type DesktopAircraftCardProps = {
  aircraft: AircraftCardReadModel;
  drawerPlacement?: ReasonDrawerPlacement;
  groundAircraft: GroundAircraftState;
  isFocusHighlighted?: boolean;
  isRecentlyActioned?: boolean;
  motionRef?: (node: HTMLDivElement | null) => void;
  taxonomy: ReasonTaxonomySnapshot;
} & ReasonWorkflowHandlers;

const formatDuration = (minutes: number) => {
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  return `${String(hours).padStart(2, "0")}:${String(remainingMinutes).padStart(2, "0")}`;
};

const apuBadgeState = (aircraft: AircraftCardReadModel): ApuStatusBadgeState => {
  if (aircraft.manualOffPending) {
    return "pending";
  }

  return aircraft.apuState === "off" ? "off" : "on";
};

export function DesktopAircraftCard({
  aircraft,
  drawerPlacement,
  groundAircraft,
  isFocusHighlighted = false,
  isRecentlyActioned = false,
  motionRef,
  taxonomy,
  onSelectReason,
  onChangeReason,
  onKeepCurrentReason,
  onAddReasonNote,
  onCorrectReason,
  onCreateDataQualityFlag,
  onMarkManualApuOff,
}: DesktopAircraftCardProps) {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [correctingSegment, setCorrectingSegment] = useState<ReasonSegment>();
  const currentReason = groundAircraft.reasonChain.currentReason;
  const reasonCaptureHandlers = {
    onSelectReason,
    onChangeReason,
    onKeepCurrentReason,
  };

  return (
    <Card
      aria-label={`${aircraft.tail} aircraft card`}
      className={cn(
        "relative h-[260px] outline-none transition-shadow",
        isFocusHighlighted && "ring-2 ring-virgin-purple ring-offset-2",
        isRecentlyActioned && "z-10 shadow-lg ring-2 ring-virgin-red/60 ring-offset-2",
      )}
      data-focus-highlight={isFocusHighlighted ? "true" : "false"}
      data-layout-key={`card:${aircraft.tail}`}
      data-recently-actioned={isRecentlyActioned ? "true" : "false"}
      id={aircraftCardDomId(aircraft.tail)}
      ref={motionRef}
      role="article"
      tabIndex={-1}
    >
      <div className="flex h-full flex-col gap-2 p-3">
        <AircraftStatusRow aircraft={aircraft} />
        <AircraftMetricGrid aircraft={aircraft} />
        <ContextStack aircraft={aircraft} />
        <ActionRail
          aircraft={aircraft}
          currentReason={currentReason}
          dataQualityFlagControl={
            <DataQualityFlagAction
              onCreateFlag={(input) => onCreateDataQualityFlag(groundAircraft, aircraft, input)}
              tail={aircraft.tail}
            />
          }
          groundAircraft={groundAircraft}
          manualOffControl={
            aircraft.apuState === "on" && groundAircraft.apuEvent ? (
              <ManualApuOffAction
                isPending={aircraft.manualOffPending}
                onMarkOff={() => onMarkManualApuOff(groundAircraft)}
                tail={aircraft.tail}
              />
            ) : null
          }
          onOpenDrawer={() => setIsDrawerOpen(true)}
          reasonCaptureHandlers={reasonCaptureHandlers}
          taxonomy={taxonomy}
        />
      </div>

      <CardReasonDrawer
        correctionControls={
          <ReasonCorrectionControls
            correctingSegment={correctingSegment}
            groundAircraft={groundAircraft}
            onCorrectReason={onCorrectReason}
            onDone={() => setCorrectingSegment(undefined)}
            taxonomy={taxonomy}
          />
        }
        currentReason={currentReason}
        isOpen={isDrawerOpen}
        onAddNote={(note) => {
          if (currentReason) {
            onAddReasonNote(groundAircraft, currentReason, note);
          }
        }}
        onClose={() => {
          setIsDrawerOpen(false);
          setCorrectingSegment(undefined);
        }}
        onCorrectSegment={setCorrectingSegment}
        segments={groundAircraft.reasonChain.segments}
        placement={drawerPlacement}
        tail={aircraft.tail}
      />
    </Card>
  );
}

function AircraftStatusRow({ aircraft }: { aircraft: AircraftCardReadModel }) {
  return (
    <div
      aria-label={`${aircraft.tail} status`}
      className="flex items-start justify-between gap-2"
      role="group"
    >
      <div className="min-w-0">
        <div className="flex min-w-0 items-center gap-1.5">
          <p className="truncate text-lg font-semibold leading-6 tracking-normal text-neutral-950">
            {aircraft.tail}
          </p>
          <SourceQualityCharm sourceCharms={aircraft.sourceCharms} />
        </div>
        <div className="mt-0.5 flex flex-wrap items-center gap-1.5 text-[11px] font-semibold text-neutral-500">
          {aircraft.aircraftType ? <span>{aircraft.aircraftType}</span> : null}
          {aircraft.bay ? <span>{aircraft.bay}</span> : null}
        </div>
      </div>
      <ApuStatusBadge state={apuBadgeState(aircraft)} />
    </div>
  );
}

function AircraftMetricGrid({ aircraft }: { aircraft: AircraftCardReadModel }) {
  return (
    <div aria-label={`${aircraft.tail} metrics`} role="group">
      <dl className="grid grid-cols-3 gap-1.5">
        <AircraftMetric label="APU Runtime" value={formatDuration(aircraft.apuRuntimeMinutes)} />
        <AircraftMetric label="Ground Time" value={formatDuration(aircraft.groundMinutes)} />
        <AircraftMetric label="Est. Fuel Burn" value={`${aircraft.estimatedFuelKg} kg`} />
      </dl>
    </div>
  );
}

function AircraftMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-product bg-neutral-50 p-2">
      <dt className="text-[11px] font-medium leading-4 text-neutral-500">{label}</dt>
      <dd className="mt-0.5 text-base font-semibold leading-5 tabular-nums text-neutral-950">
        {value}
      </dd>
    </div>
  );
}

function ContextStack({ aircraft }: { aircraft: AircraftCardReadModel }) {
  return (
    <div
      aria-label={`${aircraft.tail} context`}
      className="grid min-h-0 flex-1 grid-cols-[minmax(0,1fr)_minmax(5.5rem,auto)] gap-2 border-t border-neutral-200 pt-2"
      role="group"
    >
      <CurrentReasonGroup aircraft={aircraft} />
      <NearbySummary aircraft={aircraft} />
    </div>
  );
}

function CurrentReasonGroup({ aircraft }: { aircraft: AircraftCardReadModel }) {
  return (
    <div aria-label={`Current reason for ${aircraft.tail}`} className="min-w-0" role="group">
      <p className="text-[10px] font-semibold uppercase tracking-normal text-neutral-500">Reason</p>
      <CurrentReasonSummary aircraft={aircraft} />
    </div>
  );
}

function CurrentReasonSummary({ aircraft }: { aircraft: AircraftCardReadModel }) {
  if (!aircraft.currentReason) {
    return (
      <p className="mt-1 text-sm font-semibold text-neutral-600">
        {aircraft.apuState === "off" ? "APU off" : "Reason pending"}
      </p>
    );
  }

  return (
    <div className="mt-1 min-w-0">
      <div className="flex min-w-0 items-center gap-1.5">
        <p className="min-w-0 truncate text-sm font-semibold leading-5 text-neutral-950">
          {aircraft.currentReason.categoryLabel}
        </p>
        <Badge
          className="shrink-0 px-1.5 py-0 text-[11px] leading-4 tabular-nums text-virgin-purple"
          variant="secondary"
        >
          {formatDuration(aircraft.currentReason.elapsedMinutes)}
        </Badge>
      </div>
      <p className="truncate text-xs font-medium text-neutral-500">
        {aircraft.currentReason.detailLabel}
      </p>
    </div>
  );
}

function NearbySummary({ aircraft }: { aircraft: AircraftCardReadModel }) {
  return (
    <div className="min-w-[5.5rem]">
      <ProximityHoverCard proximity={aircraft.proximity} tail={aircraft.tail} />
    </div>
  );
}

type ActionRailProps = {
  aircraft: AircraftCardReadModel;
  groundAircraft: GroundAircraftState;
  currentReason?: ReasonSegment;
  taxonomy: ReasonTaxonomySnapshot;
  reasonCaptureHandlers: ReasonCaptureHandlers;
  manualOffControl: ReactNode;
  dataQualityFlagControl: ReactNode;
  onOpenDrawer: () => void;
};

function ActionRail({
  aircraft,
  groundAircraft,
  currentReason,
  taxonomy,
  reasonCaptureHandlers,
  manualOffControl,
  dataQualityFlagControl,
  onOpenDrawer,
}: ActionRailProps) {
  const canCaptureReason = aircraft.apuState === "on" && Boolean(groundAircraft.apuEvent);

  return (
    <div
      aria-label={`${aircraft.tail} actions`}
      className="flex items-center justify-between gap-2 pt-1"
      role="group"
    >
      <div
        aria-label={`Reason actions for ${aircraft.tail}`}
        className="flex w-[63%] min-w-0 items-center gap-1.5"
        role="group"
      >
        {!aircraft.currentReason && canCaptureReason ? (
          <ReasonPicker
            mode="select"
            onSelect={(selection) => reasonCaptureHandlers.onSelectReason(groundAircraft, selection)}
            taxonomy={taxonomy}
          />
        ) : null}

        {currentReason ? (
          <ReasonPicker
            mode="change"
            onSelect={(selection) =>
              reasonCaptureHandlers.onChangeReason(groundAircraft, currentReason, selection)
            }
            taxonomy={taxonomy}
          />
        ) : null}

        {currentReason && aircraft.reviewState.isReviewDue && !aircraft.manualOffPending ? (
          <Button
            aria-label={`Keep current reason for ${aircraft.tail}`}
            className="size-8 text-neutral-800"
            onClick={() => reasonCaptureHandlers.onKeepCurrentReason(groundAircraft, currentReason)}
            size="icon"
            title="Keep current reason"
            type="button"
            variant="ghost"
          >
            <RefreshCw data-icon="inline-start" />
          </Button>
        ) : null}
      </div>

      <div
        aria-label={`Utility actions for ${aircraft.tail}`}
        className="flex shrink-0 items-center justify-end gap-1"
        role="group"
      >
        {manualOffControl}
        {groundAircraft.reasonChain.segments.length > 0 ? (
          <Button
            aria-label={`Open reason drawer for ${aircraft.tail}`}
            className="size-8 text-neutral-800"
            onClick={onOpenDrawer}
            size="icon"
            title="Reason chain"
            type="button"
            variant="ghost"
          >
            <History data-icon="inline-start" />
          </Button>
        ) : null}
        {dataQualityFlagControl}
      </div>
    </div>
  );
}

type ReasonCorrectionControlsProps = {
  correctingSegment?: ReasonSegment;
  groundAircraft: GroundAircraftState;
  taxonomy: ReasonTaxonomySnapshot;
  onCorrectReason: ReasonWorkflowHandlers["onCorrectReason"];
  onDone: () => void;
};

function ReasonCorrectionControls({
  correctingSegment,
  groundAircraft,
  taxonomy,
  onCorrectReason,
  onDone,
}: ReasonCorrectionControlsProps) {
  if (!correctingSegment) {
    return null;
  }

  return (
    <div
      aria-label={`Correcting ${correctingSegment.categoryLabel}`}
      className="flex flex-wrap items-center gap-2 rounded-product bg-neutral-50 p-3"
    >
      <p className="text-xs font-semibold uppercase tracking-normal text-neutral-500">
        Correct previous reason
      </p>
      <ReasonPicker
        mode="change"
        onSelect={(selection) => {
          onCorrectReason(groundAircraft, correctingSegment, selection);
          onDone();
        }}
        taxonomy={taxonomy}
      />
    </div>
  );
}
