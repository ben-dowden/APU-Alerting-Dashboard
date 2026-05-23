"use client";

import { ChevronDown, ChevronUp, Plus } from "lucide-react";
import { useMemo, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { ReasonCategorySetting, ReasonTaxonomySnapshot } from "@/lib/events";
import {
  createSettingsDraft,
  discardSettingsDraft,
  resetSettingsDraftToDefault,
  saveSettingsDraft,
  stageSettingsDraft,
  type SettingsDraft,
} from "@/lib/prototype/admin-settings-actions";
import { defaultSettingsEvents } from "@/lib/prototype/settings-event-store";

import { AdminActionBar } from "./admin-action-bar";

type ReasonSettingsModel = {
  globalDefaults: ReasonTaxonomySnapshot;
  portOverrides: {
    BNE: {
      categories: ReasonCategorySetting[];
    };
  };
};

const actionTimestamp = "2026-05-23T09:00:00.000Z";

export const createReasonSettingsModel = (
  snapshot = defaultSettingsEvents.reason_taxonomy.payload.snapshot,
): ReasonSettingsModel => ({
  globalDefaults: snapshot,
  portOverrides: {
    BNE: {
      categories: [],
    },
  },
});

const activeDetailCount = (category: ReasonCategorySetting) =>
  category.details.filter((detail) => detail.active).length;

const categoryWithSortedDetails = (category: ReasonCategorySetting) => ({
  ...category,
  details: [...category.details].sort((left, right) => left.sortOrder - right.sortOrder),
});

const sortedCategories = (snapshot: ReasonTaxonomySnapshot) =>
  [...snapshot.categories]
    .sort((left, right) => left.sortOrder - right.sortOrder)
    .map(categoryWithSortedDetails);

const validateReasonSettings = (snapshot: ReasonTaxonomySnapshot) =>
  sortedCategories(snapshot)
    .filter((category) => activeDetailCount(category) > 4)
    .map(() => "Maximum four active details per category.");

const withUpdatedCategory = (
  snapshot: ReasonTaxonomySnapshot,
  categoryId: string,
  updateCategory: (category: ReasonCategorySetting) => ReasonCategorySetting,
): ReasonTaxonomySnapshot => ({
  ...snapshot,
  categories: snapshot.categories.map((category) =>
    category.id === categoryId ? updateCategory(categoryWithSortedDetails(category)) : category,
  ),
});

const moveCategory = (
  snapshot: ReasonTaxonomySnapshot,
  categoryId: string,
  direction: -1 | 1,
): ReasonTaxonomySnapshot => {
  const categories = sortedCategories(snapshot);
  const currentIndex = categories.findIndex((category) => category.id === categoryId);
  const nextIndex = currentIndex + direction;

  if (currentIndex < 0 || nextIndex < 0 || nextIndex >= categories.length) {
    return snapshot;
  }

  const nextCategories = [...categories];
  [nextCategories[currentIndex], nextCategories[nextIndex]] = [
    nextCategories[nextIndex],
    nextCategories[currentIndex],
  ];

  return {
    ...snapshot,
    categories: nextCategories.map((category, index) => ({
      ...category,
      sortOrder: (index + 1) * 10,
    })),
  };
};

function CategoryTable({
  onChange,
  selectedCategoryId,
  snapshot,
}: {
  onChange: (snapshot: ReasonTaxonomySnapshot) => void;
  selectedCategoryId: string;
  snapshot: ReasonTaxonomySnapshot;
}) {
  const categories = sortedCategories(snapshot);

  return (
    <Card>
      <CardContent className="p-0">
        <table className="w-full border-collapse text-left text-sm" aria-label="Reason categories">
          <thead className="bg-neutral-50 text-xs font-semibold uppercase tracking-normal text-neutral-500">
            <tr>
              <th className="px-4 py-3">Category</th>
              <th className="px-4 py-3">Active details</th>
              <th className="px-4 py-3">Active</th>
              <th className="px-4 py-3">Order</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-200">
            {categories.map((category, index) => (
              <tr
                className={category.id === selectedCategoryId ? "bg-purple-50" : "bg-white"}
                key={category.id}
              >
                <td className="px-4 py-3 font-semibold text-neutral-950">{category.label}</td>
                <td className="px-4 py-3 text-neutral-600">{activeDetailCount(category)} active</td>
                <td className="px-4 py-3">
                  <input
                    aria-label={`${category.label} category active`}
                    checked={category.active}
                    className="size-4 accent-virgin-purple"
                    onChange={(event) =>
                      onChange(
                        withUpdatedCategory(snapshot, category.id, (currentCategory) => ({
                          ...currentCategory,
                          active: event.target.checked,
                        })),
                      )
                    }
                    type="checkbox"
                  />
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-1">
                    <Button
                      aria-label={`Move ${category.label} up`}
                      disabled={index === 0}
                      onClick={() => onChange(moveCategory(snapshot, category.id, -1))}
                      size="icon"
                      type="button"
                      variant="ghost"
                    >
                      <ChevronUp data-icon aria-hidden="true" />
                    </Button>
                    <Button
                      aria-label={`Move ${category.label} down`}
                      disabled={index === categories.length - 1}
                      onClick={() => onChange(moveCategory(snapshot, category.id, 1))}
                      size="icon"
                      type="button"
                      variant="ghost"
                    >
                      <ChevronDown data-icon aria-hidden="true" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </CardContent>
    </Card>
  );
}

function DetailEditor({
  category,
  onAddDetail,
  onChange,
  snapshot,
}: {
  category: ReasonCategorySetting;
  onAddDetail: () => void;
  onChange: (snapshot: ReasonTaxonomySnapshot) => void;
  snapshot: ReasonTaxonomySnapshot;
}) {
  return (
    <section aria-label="Reason detail editor">
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-normal text-virgin-purple">
                Detail editor
              </p>
              <h2 className="mt-1 text-base font-semibold text-neutral-950">{category.label}</h2>
            </div>
            <Button onClick={onAddDetail} size="sm" type="button" variant="outline">
              <Plus data-icon aria-hidden="true" />
              Add active detail
            </Button>
          </div>

          <label className="mt-4 block text-sm font-semibold text-neutral-950">
            Default review interval
            <input
              className="mt-2 h-10 w-28 rounded-product border border-neutral-300 px-3 text-sm font-semibold"
              min={5}
              onChange={(event) =>
                onChange({
                  ...snapshot,
                  defaultReviewIntervalMinutes: Number(event.target.value),
                })
              }
              type="number"
              value={snapshot.defaultReviewIntervalMinutes}
            />
          </label>

          <div className="mt-4 grid gap-2">
            {category.details.map((detail) => (
              <div
                className="grid gap-3 border border-neutral-200 p-3 md:grid-cols-[1fr_130px_80px]"
                key={detail.id}
              >
                <p className="self-center text-sm font-semibold text-neutral-950">{detail.label}</p>
                <label className="text-xs font-semibold uppercase tracking-normal text-neutral-500">
                  Review min
                  <input
                    className="mt-1 h-9 w-full rounded-product border border-neutral-300 px-2 text-sm font-semibold text-neutral-950"
                    min={5}
                    onChange={(event) =>
                      onChange(
                        withUpdatedCategory(snapshot, category.id, (currentCategory) => ({
                          ...currentCategory,
                          details: currentCategory.details.map((currentDetail) =>
                            currentDetail.id === detail.id
                              ? {
                                  ...currentDetail,
                                  reviewIntervalMinutes: Number(event.target.value),
                                }
                              : currentDetail,
                          ),
                        })),
                      )
                    }
                    type="number"
                    value={detail.reviewIntervalMinutes}
                  />
                </label>
                <label className="flex items-center gap-2 self-center text-xs font-semibold text-neutral-600">
                  <input
                    aria-label={`${detail.label} detail active`}
                    checked={detail.active}
                    className="size-4 accent-virgin-purple"
                    onChange={(event) =>
                      onChange(
                        withUpdatedCategory(snapshot, category.id, (currentCategory) => ({
                          ...currentCategory,
                          details: currentCategory.details.map((currentDetail) =>
                            currentDetail.id === detail.id
                              ? { ...currentDetail, active: event.target.checked }
                              : currentDetail,
                          ),
                        })),
                      )
                    }
                    type="checkbox"
                  />
                  Active
                </label>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </section>
  );
}

function FastCapturePreview({ category }: { category: ReasonCategorySetting }) {
  return (
    <section aria-label="Fast capture preview">
      <Card>
        <CardContent className="p-4">
          <p className="text-sm font-semibold text-neutral-950">Fast capture preview</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {category.details
              .filter((detail) => detail.active)
              .slice(0, 4)
              .map((detail) => (
                <Badge key={detail.id} variant="neutral">
                  {detail.label}
                </Badge>
              ))}
          </div>
        </CardContent>
      </Card>
    </section>
  );
}

export function ReasonSettingsPage() {
  const [draft, setDraft] = useState<SettingsDraft<"reason_taxonomy">>(() =>
    createSettingsDraft("reason_taxonomy"),
  );
  const [selectedCategoryId, setSelectedCategoryId] = useState(
    draft.stagedSnapshot.categories[0]?.id ?? "",
  );
  const categories = useMemo(() => sortedCategories(draft.stagedSnapshot), [draft.stagedSnapshot]);
  const selectedCategory = categories.find((category) => category.id === selectedCategoryId) ?? categories[0];
  const validationErrors = validateReasonSettings(draft.stagedSnapshot);

  const stageSnapshot = (snapshot: ReasonTaxonomySnapshot) => {
    setDraft((currentDraft) => stageSettingsDraft(currentDraft, snapshot));
  };

  const addActiveDetail = () => {
    if (!selectedCategory) {
      return;
    }

    stageSnapshot(
      withUpdatedCategory(draft.stagedSnapshot, selectedCategory.id, (category) => ({
        ...category,
        details: [
          ...category.details,
          {
            id: `${category.id}-extra-${category.details.length + 1}`,
            label: "New active detail",
            active: true,
            reviewIntervalMinutes: draft.stagedSnapshot.defaultReviewIntervalMinutes,
            sortOrder: (category.details.length + 1) * 10,
          },
        ],
      })),
    );
  };

  return (
    <div className="grid gap-5">
      <AdminActionBar
        hasValidationErrors={validationErrors.length > 0}
        isDirty={draft.isDirty}
        onDiscard={() => setDraft(discardSettingsDraft(draft))}
        onReset={() =>
          setDraft(
            resetSettingsDraftToDefault(draft, {
              changedBy: "hq-admin",
              changedAt: actionTimestamp,
              summary: "Reset reason taxonomy defaults.",
            }),
          )
        }
        onSave={() =>
          setDraft(
            saveSettingsDraft(draft, {
              changedBy: "hq-admin",
              changedAt: actionTimestamp,
              summary: "Updated global reason taxonomy defaults.",
            }),
          )
        }
      />

      <div className="flex flex-wrap items-center gap-2">
        <Badge variant="neutral">{draft.savedEvent.payload.settingsVersion}</Badge>
        <Badge variant="outline">Global defaults editable</Badge>
        <Badge variant="outline">BNE override model ready</Badge>
      </div>

      {validationErrors.length > 0 ? (
        <div className="border border-virgin-red bg-red-50 px-4 py-3 text-sm font-semibold text-virgin-red">
          {validationErrors[0]}
        </div>
      ) : null}

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_minmax(420px,0.65fr)]">
        <div onClick={(event) => {
          const row = (event.target as HTMLElement).closest("tr");
          const label = row?.querySelector("td")?.textContent;
          const category = categories.find((candidate) => candidate.label === label);
          if (category) {
            setSelectedCategoryId(category.id);
          }
        }}>
          <CategoryTable
            onChange={stageSnapshot}
            selectedCategoryId={selectedCategory?.id ?? ""}
            snapshot={draft.stagedSnapshot}
          />
        </div>
        {selectedCategory ? (
          <div className="grid gap-5">
            <DetailEditor
              category={selectedCategory}
              onAddDetail={addActiveDetail}
              onChange={stageSnapshot}
              snapshot={draft.stagedSnapshot}
            />
            <FastCapturePreview category={selectedCategory} />
          </div>
        ) : null}
      </div>
    </div>
  );
}
