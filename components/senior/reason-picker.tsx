"use client";

import { useEffect, useMemo, useState } from "react";

import type { ReasonTaxonomySnapshot } from "@/lib/events";
import { cn } from "@/lib/utils/cn";
import { Button } from "@/components/ui/button";

export type ReasonPickerSelection = {
  categoryId: string;
  categoryLabel: string;
  detailId: string;
  detailLabel: string;
};

type ReasonPickerProps = {
  mode: "select" | "change";
  taxonomy: ReasonTaxonomySnapshot;
  onSelect: (selection: ReasonPickerSelection) => void;
};

type ActiveCategory = ReasonTaxonomySnapshot["categories"][number];

const sortedActiveCategories = (taxonomy: ReasonTaxonomySnapshot) =>
  [...taxonomy.categories]
    .filter((category) => category.active)
    .sort((left, right) => left.sortOrder - right.sortOrder);

const sortedActiveDetails = (category: ActiveCategory) =>
  [...category.details]
    .filter((detail) => detail.active)
    .sort((left, right) => left.sortOrder - right.sortOrder)
    .slice(0, 4);

export function ReasonPicker({ mode, taxonomy, onSelect }: ReasonPickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>();
  const categories = useMemo(() => sortedActiveCategories(taxonomy), [taxonomy]);
  const selectedCategory = categories.find((category) => category.id === selectedCategoryId);
  const triggerLabel = mode === "select" ? "Select reason" : "Change reason";

  useEffect(() => {
    if (!isOpen) {
      return undefined;
    }

    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
        setSelectedCategoryId(undefined);
      }
    };

    document.addEventListener("keydown", closeOnEscape);
    return () => document.removeEventListener("keydown", closeOnEscape);
  }, [isOpen]);

  return (
    <div className="relative inline-flex">
      <Button
        aria-expanded={isOpen}
        aria-haspopup="dialog"
        onClick={() => setIsOpen((current) => !current)}
        type="button"
        variant={mode === "select" ? "default" : "outline"}
        size="sm"
        className="whitespace-nowrap px-2"
      >
        {triggerLabel}
      </Button>

      {isOpen ? (
        <div
          aria-label="Reason picker"
          className="absolute left-0 top-full z-20 mt-2 flex overflow-visible rounded-product border border-neutral-200 bg-white shadow-lg"
          role="dialog"
        >
          <div aria-label="Reason categories" className="flex w-64 flex-col gap-1 p-2" role="group">
            {categories.map((category) => (
              <button
                aria-pressed={category.id === selectedCategoryId}
                className={cn(
                  "rounded-product px-3 py-2 text-left text-sm font-semibold text-neutral-700 hover:bg-neutral-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-virgin-purple",
                  category.id === selectedCategoryId && "bg-neutral-100 text-neutral-950",
                )}
                key={category.id}
                onClick={() => setSelectedCategoryId(category.id)}
                type="button"
              >
                {category.label}
              </button>
            ))}
          </div>

          {selectedCategory ? (
            <div
              aria-label={`${selectedCategory.label} details`}
              className="flex w-72 flex-col gap-1 border-l border-neutral-200 p-2"
              role="group"
            >
              {sortedActiveDetails(selectedCategory).map((detail) => (
                <button
                  className="rounded-product px-3 py-2 text-left text-sm font-semibold text-neutral-700 hover:bg-neutral-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-virgin-purple"
                  key={detail.id}
                  onClick={() => {
                    onSelect({
                      categoryId: selectedCategory.id,
                      categoryLabel: selectedCategory.label,
                      detailId: detail.id,
                      detailLabel: detail.label,
                    });
                    setIsOpen(false);
                    setSelectedCategoryId(undefined);
                  }}
                  type="button"
                >
                  {detail.label}
                </button>
              ))}
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
