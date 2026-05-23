"use client";

import { useMemo, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { rankAircraftCards } from "@/lib/domain/urgency-ranking";
import type { UrgencyBucket, UrgencyRankingSnapshot } from "@/lib/events";
import { fuelBurnAssumptionSettings } from "@/lib/fixtures/reference/fuel-assumptions";
import { reasonTaxonomySettings } from "@/lib/fixtures/reference/reason-taxonomy";
import { standCoordinateReferenceEvents } from "@/lib/fixtures/reference/stand-coordinates";
import { bneBaselineScenario } from "@/lib/fixtures/scenarios";
import {
  createSettingsDraft,
  resetSettingsDraftToDefault,
  saveSettingsDraft,
  stageSettingsDraft,
  type SettingsDraft,
} from "@/lib/prototype/admin-settings-actions";
import { deriveAircraftCards, deriveCurrentBoard } from "@/lib/read-models";

import { AdminActionBar } from "./admin-action-bar";

const actionTimestamp = "2026-05-23T11:00:00.000Z";

const bucketLabels: Record<UrgencyBucket, string> = {
  missing_reason: "Missing reason",
  review_overdue: "Review overdue",
  active_valid_reason: "Active valid reason",
  manual_off_pending: "Manual off pending",
  apu_off: "APU off",
};

const weightFields = [
  { key: "runtimeMinutes", label: "Runtime minutes weight" },
  { key: "overdueMinutes", label: "Overdue minutes weight" },
  { key: "proximityCount", label: "Proximity count weight" },
  { key: "sourceStalenessMinutes", label: "Source staleness minutes weight" },
] as const;

const validateUrgencySettings = (snapshot: UrgencyRankingSnapshot) => {
  const weights = Object.values(snapshot.tiebreakerWeights);

  if (weights.some((weight) => weight < 0)) {
    return ["Urgency weights must be non-negative."];
  }

  if (weights.every((weight) => weight === 0)) {
    return ["At least one urgency weight must be greater than zero."];
  }

  return [];
};

function BneBoardOrderPreview({ snapshot }: { snapshot: UrgencyRankingSnapshot }) {
  const rankedCards = useMemo(() => {
    const board = deriveCurrentBoard(
      bneBaselineScenario.events,
      {
        fuelBurnAssumptions: fuelBurnAssumptionSettings,
        reasonTaxonomy: reasonTaxonomySettings.payload.snapshot,
        standCoordinates: standCoordinateReferenceEvents,
      },
      "2026-05-22T08:55:00.000Z",
    );

    return rankAircraftCards(deriveAircraftCards(board), {
      nowIso: board.nowIso,
      bucketOrder: snapshot.bucketOrder,
      tiebreakerWeights: snapshot.tiebreakerWeights,
    });
  }, [snapshot]);

  return (
    <Card>
      <CardContent className="p-0">
        <table className="w-full border-collapse text-left text-sm" aria-label="BNE board order preview">
          <thead className="bg-neutral-50 text-xs font-semibold uppercase tracking-normal text-neutral-500">
            <tr>
              <th className="px-4 py-3">Rank</th>
              <th className="px-4 py-3">Tail</th>
              <th className="px-4 py-3">Bucket</th>
              <th className="px-4 py-3">Score</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-200">
            {rankedCards.map((card) => (
              <tr key={card.tail}>
                <td className="px-4 py-3 font-semibold text-neutral-950">{card.urgencyRank}</td>
                <td className="px-4 py-3 font-semibold text-neutral-950">{card.tail}</td>
                <td className="px-4 py-3 text-neutral-600">{bucketLabels[card.urgencyBucket]}</td>
                <td className="px-4 py-3 text-neutral-600">{card.urgencyScore}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </CardContent>
    </Card>
  );
}

export function UrgencySettingsPage() {
  const [draft, setDraft] = useState<SettingsDraft<"urgency_ranking">>(() =>
    createSettingsDraft("urgency_ranking"),
  );
  const validationErrors = validateUrgencySettings(draft.stagedSnapshot);

  const updateWeight = (
    key: keyof UrgencyRankingSnapshot["tiebreakerWeights"],
    value: number,
  ) => {
    setDraft((currentDraft) =>
      stageSettingsDraft(currentDraft, {
        ...currentDraft.stagedSnapshot,
        tiebreakerWeights: {
          ...currentDraft.stagedSnapshot.tiebreakerWeights,
          [key]: value,
        },
      }),
    );
  };

  return (
    <div className="grid gap-5">
      <AdminActionBar
        hasValidationErrors={validationErrors.length > 0}
        isDirty={draft.isDirty}
        onDiscard={() => setDraft(createSettingsDraft("urgency_ranking"))}
        onReset={() =>
          setDraft(
            resetSettingsDraftToDefault(draft, {
              changedBy: "hq-admin",
              changedAt: actionTimestamp,
              summary: "Reset urgency ranking defaults.",
            }),
          )
        }
        onSave={() =>
          setDraft(
            saveSettingsDraft(draft, {
              changedBy: "hq-admin",
              changedAt: actionTimestamp,
              summary: "Updated urgency tiebreaker weights.",
            }),
          )
        }
      />

      <div className="flex flex-wrap items-center gap-2">
        <Badge variant="neutral">{draft.savedEvent.payload.settingsVersion}</Badge>
        <Badge variant="outline">Global defaults only</Badge>
        <Badge variant="outline">BNE override shape reserved</Badge>
      </div>

      {validationErrors[0] ? (
        <div className="border border-virgin-red bg-red-50 px-4 py-3 text-sm font-semibold text-virgin-red">
          {validationErrors[0]}
        </div>
      ) : null}

      <div className="grid gap-5 xl:grid-cols-[360px_minmax(0,1fr)]">
        <div className="grid gap-5">
          <Card>
            <CardContent className="p-4">
              <p className="text-sm font-semibold text-neutral-950">Fixed bucket order</p>
              <ol aria-label="Fixed urgency bucket order" className="mt-3 grid gap-2">
                {draft.stagedSnapshot.bucketOrder.map((bucket, index) => (
                  <li className="flex items-center justify-between border border-neutral-200 p-3" key={bucket}>
                    <span className="text-sm font-semibold text-neutral-950">
                      {bucketLabels[bucket]}
                    </span>
                    <Badge variant="neutral">{index + 1}</Badge>
                  </li>
                ))}
              </ol>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="grid gap-3 p-4">
              <p className="text-sm font-semibold text-neutral-950">Editable tiebreaker weights</p>
              {weightFields.map((field) => (
                <label className="text-sm font-semibold text-neutral-950" key={field.key}>
                  {field.label}
                  <input
                    className="mt-1 h-10 w-full rounded-product border border-neutral-300 px-3 text-sm font-semibold"
                    min={0}
                    onChange={(event) => updateWeight(field.key, Number(event.target.value))}
                    step="0.01"
                    type="number"
                    value={draft.stagedSnapshot.tiebreakerWeights[field.key]}
                  />
                </label>
              ))}
            </CardContent>
          </Card>
        </div>

        <BneBoardOrderPreview snapshot={draft.stagedSnapshot} />
      </div>
    </div>
  );
}
