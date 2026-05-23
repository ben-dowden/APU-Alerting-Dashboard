"use client";

import { useMemo, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import type { FuelBurnAssumptionsSnapshot, FuelPriceSnapshot } from "@/lib/events";
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

const actionTimestamp = "2026-05-23T10:00:00.000Z";

const roundOne = (value: number) => Math.round(value * 10) / 10;

const validateFuelSettings = (
  price: FuelPriceSnapshot,
  burn: FuelBurnAssumptionsSnapshot,
) => {
  const errors: string[] = [];

  if (price.pricePerKg <= 0) {
    errors.push("Fuel price must be greater than zero.");
  }

  if (burn.assumptions.some((assumption) => assumption.kgPerHour <= 0)) {
    errors.push("Fuel burn rates must be greater than zero.");
  }

  return errors;
};

const updateBurnAssumption = (
  snapshot: FuelBurnAssumptionsSnapshot,
  equipmentType: string,
  kgPerHour: number,
): FuelBurnAssumptionsSnapshot => ({
  ...snapshot,
  assumptions: snapshot.assumptions.map((assumption) =>
    assumption.equipmentType === equipmentType ? { ...assumption, kgPerHour } : assumption,
  ),
});

function FuelPreview({ burnSnapshot }: { burnSnapshot: FuelBurnAssumptionsSnapshot }) {
  const cards = useMemo(() => {
    const board = deriveCurrentBoard(
      bneBaselineScenario.events,
      {
        fuelBurnAssumptions: burnSnapshot,
        reasonTaxonomy: reasonTaxonomySettings.payload.snapshot,
        standCoordinates: standCoordinateReferenceEvents,
      },
      "2026-05-22T08:55:00.000Z",
    );

    return deriveAircraftCards(board);
  }, [burnSnapshot]);
  const estimatedKg = roundOne(cards.reduce((total, card) => total + card.estimatedFuelKg, 0));

  return (
    <section aria-label="Estimated fuel preview">
      <Card>
        <CardContent className="p-4">
          <p className="text-sm font-semibold text-neutral-950">Estimated kg preview</p>
          <p className="mt-2 text-2xl font-semibold text-neutral-950">{estimatedKg} kg</p>
          <p className="mt-1 text-xs font-medium text-neutral-500">
            BNE current-board sample using staged burn rates.
          </p>
        </CardContent>
      </Card>
    </section>
  );
}

export function FuelSettingsPage() {
  const [priceDraft, setPriceDraft] = useState<SettingsDraft<"fuel_price">>(() =>
    createSettingsDraft("fuel_price"),
  );
  const [burnDraft, setBurnDraft] = useState<SettingsDraft<"fuel_burn_assumptions">>(() =>
    createSettingsDraft("fuel_burn_assumptions"),
  );
  const validationErrors = validateFuelSettings(
    priceDraft.stagedSnapshot,
    burnDraft.stagedSnapshot,
  );
  const isDirty = priceDraft.isDirty || burnDraft.isDirty;
  const fallbackAssumption = burnDraft.stagedSnapshot.assumptions.find(
    (assumption) => assumption.isFallback,
  );

  const save = () => {
    if (priceDraft.isDirty) {
      setPriceDraft(
        saveSettingsDraft(priceDraft, {
          changedBy: "hq-admin",
          changedAt: actionTimestamp,
          summary: "Updated HQ fuel price assumption.",
        }),
      );
    }

    if (burnDraft.isDirty) {
      setBurnDraft(
        saveSettingsDraft(burnDraft, {
          changedBy: "hq-admin",
          changedAt: actionTimestamp,
          summary: "Updated equipment fuel burn assumptions.",
        }),
      );
    }
  };

  const reset = () => {
    setPriceDraft(
      resetSettingsDraftToDefault(priceDraft, {
        changedBy: "hq-admin",
        changedAt: actionTimestamp,
        summary: "Reset fuel price defaults.",
      }),
    );
    setBurnDraft(
      resetSettingsDraftToDefault(burnDraft, {
        changedBy: "hq-admin",
        changedAt: actionTimestamp,
        summary: "Reset fuel burn assumptions defaults.",
      }),
    );
  };

  return (
    <div className="grid gap-5">
      <AdminActionBar
        hasValidationErrors={validationErrors.length > 0}
        isDirty={isDirty}
        onDiscard={() => {
          setPriceDraft(createSettingsDraft("fuel_price"));
          setBurnDraft(createSettingsDraft("fuel_burn_assumptions"));
        }}
        onReset={reset}
        onSave={save}
      />

      <div className="flex flex-wrap items-center gap-2">
        <Badge variant="neutral">{priceDraft.savedEvent.payload.settingsVersion}</Badge>
        <Badge variant="neutral">{burnDraft.savedEvent.payload.settingsVersion}</Badge>
        <Badge variant="outline">Global defaults editable</Badge>
      </div>

      {validationErrors[0] ? (
        <div className="border border-virgin-red bg-red-50 px-4 py-3 text-sm font-semibold text-virgin-red">
          {validationErrors[0]}
        </div>
      ) : null}

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_minmax(360px,0.45fr)]">
        <div className="grid gap-5">
          <Card>
            <CardContent className="p-4">
              <label className="block text-sm font-semibold text-neutral-950">
                Fuel price per kg
                <input
                  className="mt-2 h-10 w-36 rounded-product border border-neutral-300 px-3 text-sm font-semibold"
                  min={0}
                  onChange={(event) =>
                    setPriceDraft((currentDraft) =>
                      stageSettingsDraft(currentDraft, {
                        ...currentDraft.stagedSnapshot,
                        pricePerKg: Number(event.target.value),
                      }),
                    )
                  }
                  step="0.01"
                  type="number"
                  value={priceDraft.stagedSnapshot.pricePerKg}
                />
              </label>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-0">
              <table className="w-full border-collapse text-left text-sm" aria-label="Fuel burn assumptions">
                <thead className="bg-neutral-50 text-xs font-semibold uppercase tracking-normal text-neutral-500">
                  <tr>
                    <th className="px-4 py-3">Equipment</th>
                    <th className="px-4 py-3">kg/hour</th>
                    <th className="px-4 py-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-200">
                  {burnDraft.stagedSnapshot.assumptions.map((assumption) => (
                    <tr key={assumption.equipmentType}>
                      <td className="px-4 py-3 font-semibold text-neutral-950">
                        {assumption.equipmentType}
                      </td>
                      <td className="px-4 py-3">
                        <input
                          aria-label={`${assumption.equipmentType} kg per hour`}
                          className="h-9 w-28 rounded-product border border-neutral-300 px-2 text-sm font-semibold"
                          min={1}
                          onChange={(event) =>
                            setBurnDraft((currentDraft) =>
                              stageSettingsDraft(
                                currentDraft,
                                updateBurnAssumption(
                                  currentDraft.stagedSnapshot,
                                  assumption.equipmentType,
                                  Number(event.target.value),
                                ),
                              ),
                            )
                          }
                          type="number"
                          value={assumption.kgPerHour}
                        />
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant={assumption.isFallback ? "outline" : "neutral"}>
                          {assumption.isFallback ? "Fallback" : "Configured"}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>

          {fallbackAssumption ? (
            <div className="border border-neutral-300 bg-white px-4 py-3 text-sm font-semibold text-neutral-700">
              Fallback rate applies when equipment is missing or unmatched.
            </div>
          ) : null}
        </div>

        <FuelPreview burnSnapshot={burnDraft.stagedSnapshot} />
      </div>
    </div>
  );
}
