"use client";

import { Check, History } from "lucide-react";
import { useState } from "react";

import type { ReasonSegment } from "@/lib/domain/reason-chain-reducer";
import type { ReasonTaxonomySnapshot } from "@/lib/events";
import type { AircraftCardReadModel, GroundAircraftState } from "@/lib/read-models";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

import { CardReasonDrawer } from "./card-reason-drawer";
import { ReasonPicker, type ReasonPickerSelection } from "./reason-picker";

type DesktopAircraftCardProps = {
  aircraft: AircraftCardReadModel;
  groundAircraft: GroundAircraftState;
  taxonomy: ReasonTaxonomySnapshot;
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
};

const formatDuration = (minutes: number) => {
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  return `${String(hours).padStart(2, "0")}:${String(remainingMinutes).padStart(2, "0")}`;
};

const apuStateLabel = (state: AircraftCardReadModel["apuState"]) =>
  state === "on" ? "APU On" : "APU Off";

const reviewLabel = (aircraft: AircraftCardReadModel) => {
  if (aircraft.reviewState.isReviewDue) {
    return "Review due";
  }

  return aircraft.reviewState.reviewDueAt ? "Review set" : "No review due";
};

export function DesktopAircraftCard({
  aircraft,
  groundAircraft,
  taxonomy,
  onSelectReason,
  onChangeReason,
  onKeepCurrentReason,
  onAddReasonNote,
  onCorrectReason,
}: DesktopAircraftCardProps) {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [correctingSegment, setCorrectingSegment] = useState<ReasonSegment>();
  const currentReason = groundAircraft.reasonChain.currentReason;
  const canCaptureReason = aircraft.apuState === "on" && Boolean(groundAircraft.apuEvent);

  return (
    <Card
      aria-label={`${aircraft.tail} aircraft card`}
      className="relative min-h-[260px]"
      role="article"
    >
      <div className="flex h-full flex-col gap-4 p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-2xl font-semibold tracking-normal text-neutral-950">{aircraft.tail}</p>
            <div className="mt-1 flex flex-wrap items-center gap-2 text-xs font-semibold text-neutral-500">
              {aircraft.aircraftType ? <span>{aircraft.aircraftType}</span> : null}
              {aircraft.bay ? <span>{aircraft.bay}</span> : null}
            </div>
          </div>
          <Badge
            variant={aircraft.apuState === "on" ? "red" : "outline"}
            className={aircraft.apuState === "off" ? "border-green-200 bg-green-50 text-green-700" : undefined}
          >
            {apuStateLabel(aircraft.apuState)}
          </Badge>
        </div>

        <dl className="grid grid-cols-3 gap-2">
          <div className="rounded-product bg-neutral-50 p-3">
            <dt className="text-xs font-medium text-neutral-500">APU runtime</dt>
            <dd className="mt-1 text-lg font-semibold text-neutral-950">
              {formatDuration(aircraft.apuRuntimeMinutes)}
            </dd>
          </div>
          <div className="rounded-product bg-neutral-50 p-3">
            <dt className="text-xs font-medium text-neutral-500">Ground time</dt>
            <dd className="mt-1 text-lg font-semibold text-neutral-950">
              {formatDuration(aircraft.groundMinutes)}
            </dd>
          </div>
          <div className="rounded-product bg-neutral-50 p-3">
            <dt className="text-xs font-medium text-neutral-500">Fuel</dt>
            <dd className="mt-1 text-lg font-semibold text-neutral-950">{aircraft.estimatedFuelKg} kg</dd>
          </div>
        </dl>

        <div className="grid gap-3 border-t border-neutral-200 pt-3 sm:grid-cols-3">
          <div aria-label={`Current reason for ${aircraft.tail}`} role="group">
            <p className="text-xs font-semibold uppercase tracking-normal text-neutral-500">Current reason</p>
            {aircraft.currentReason ? (
              <div className="mt-1">
                <p className="text-sm font-semibold text-neutral-950">
                  {aircraft.currentReason.categoryLabel}
                </p>
                <p className="text-xs font-medium text-neutral-500">
                  {aircraft.currentReason.detailLabel}
                </p>
                <p className="mt-1 text-xs font-semibold text-virgin-purple">
                  {formatDuration(aircraft.currentReason.elapsedMinutes)}
                </p>
              </div>
            ) : (
              <p className="mt-1 text-sm font-semibold text-neutral-600">Reason pending</p>
            )}

            <div className="mt-3 flex flex-wrap items-center gap-2">
              {!aircraft.currentReason && canCaptureReason ? (
                <ReasonPicker
                  mode="select"
                  onSelect={(selection) => onSelectReason(groundAircraft, selection)}
                  taxonomy={taxonomy}
                />
              ) : null}

              {currentReason ? (
                <ReasonPicker
                  mode="change"
                  onSelect={(selection) => onChangeReason(groundAircraft, currentReason, selection)}
                  taxonomy={taxonomy}
                />
              ) : null}

              {currentReason && aircraft.reviewState.isReviewDue ? (
                <Button
                  aria-label={`Keep current reason for ${aircraft.tail}`}
                  onClick={() => onKeepCurrentReason(groundAircraft, currentReason)}
                  size="icon"
                  title="Keep current reason"
                  type="button"
                  variant="outline"
                >
                  <Check data-icon="inline-start" />
                </Button>
              ) : null}

              {groundAircraft.reasonChain.segments.length > 0 ? (
                <Button
                  aria-label={`Open reason drawer for ${aircraft.tail}`}
                  onClick={() => setIsDrawerOpen(true)}
                  size="icon"
                  title="Reason chain"
                  type="button"
                  variant="ghost"
                >
                  <History data-icon="inline-start" />
                </Button>
              ) : null}
            </div>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-normal text-neutral-500">Review</p>
            <p className="mt-1 text-sm font-semibold text-neutral-950">{reviewLabel(aircraft)}</p>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-normal text-neutral-500">Nearby</p>
            <p className="mt-1 text-sm font-semibold text-neutral-600">Closest tail pending</p>
          </div>
        </div>
      </div>

      <CardReasonDrawer
        correctionControls={
          correctingSegment ? (
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
                  setCorrectingSegment(undefined);
                }}
                taxonomy={taxonomy}
              />
            </div>
          ) : null
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
        tail={aircraft.tail}
      />
    </Card>
  );
}
