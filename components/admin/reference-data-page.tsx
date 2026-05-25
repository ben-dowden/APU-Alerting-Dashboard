"use client";

import { useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  createSettingsDraft,
  resetSettingsDraftToDefault,
  type SettingsDraft,
} from "@/lib/prototype/admin-settings-actions";

import { AdminActionBar } from "./admin-action-bar";

const actionTimestamp = "2026-05-23T12:00:00.000Z";

export function ReferenceDataPage() {
  const [tailDraft, setTailDraft] = useState<SettingsDraft<"tail_equipment_reference">>(() =>
    createSettingsDraft("tail_equipment_reference"),
  );
  const [standDraft, setStandDraft] = useState<SettingsDraft<"stand_coordinates">>(() =>
    createSettingsDraft("stand_coordinates"),
  );

  return (
    <div className="grid gap-5">
      <AdminActionBar
        hasValidationErrors={false}
        isDirty={false}
        onDiscard={() => {
          setTailDraft(createSettingsDraft("tail_equipment_reference"));
          setStandDraft(createSettingsDraft("stand_coordinates"));
        }}
        onReset={() => {
          setTailDraft(
            resetSettingsDraftToDefault(tailDraft, {
              changedBy: "hq-admin",
              changedAt: actionTimestamp,
              summary: "Reset tail equipment reference defaults.",
            }),
          );
          setStandDraft(
            resetSettingsDraftToDefault(standDraft, {
              changedBy: "hq-admin",
              changedAt: actionTimestamp,
              summary: "Reset stand coordinates defaults.",
            }),
          );
        }}
        onSave={() => undefined}
      />

      <div className="flex flex-wrap items-center gap-2">
        <Badge variant="neutral">{tailDraft.savedEvent.payload.settingsVersion}</Badge>
        <Badge variant="neutral">{standDraft.savedEvent.payload.settingsVersion}</Badge>
        <Badge variant="outline">Reference snapshot contract</Badge>
      </div>

      <div className="grid gap-5 xl:grid-cols-2">
        <Card>
          <CardContent className="p-0">
            <table className="w-full border-collapse text-left text-sm" aria-label="Tail equipment reference">
              <thead className="bg-neutral-50 text-xs font-semibold uppercase tracking-normal text-neutral-500">
                <tr>
                  <th className="px-4 py-3">Tail</th>
                  <th className="px-4 py-3">Equipment</th>
                  <th className="px-4 py-3">Effective from</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200">
                {tailDraft.stagedSnapshot.tails.map((tail) => (
                  <tr key={tail.tail}>
                    <td className="px-4 py-3 font-semibold text-neutral-950">{tail.tail}</td>
                    <td className="px-4 py-3 text-neutral-700">{tail.equipmentType}</td>
                    <td className="px-4 py-3 text-neutral-600">{tail.effectiveFrom}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-0">
            <table className="w-full border-collapse text-left text-sm" aria-label="Stand coordinates reference">
              <thead className="bg-neutral-50 text-xs font-semibold uppercase tracking-normal text-neutral-500">
                <tr>
                  <th className="px-4 py-3">Stand</th>
                  <th className="px-4 py-3">Bay</th>
                  <th className="px-4 py-3">Latitude</th>
                  <th className="px-4 py-3">Longitude</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200">
                {standDraft.stagedSnapshot.stands.map((stand) => (
                  <tr key={stand.stand}>
                    <td className="px-4 py-3 font-semibold text-neutral-950">{stand.stand}</td>
                    <td className="px-4 py-3 text-neutral-700">{stand.bay}</td>
                    <td className="px-4 py-3 text-neutral-600">{stand.latitude}</td>
                    <td className="px-4 py-3 text-neutral-600">{stand.longitude}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
