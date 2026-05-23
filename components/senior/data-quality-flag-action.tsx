"use client";

import { Flag } from "lucide-react";
import { useState } from "react";

import type { DataQualityFlagCreatedPayload } from "@/lib/events";
import { Button } from "@/components/ui/button";

export type DataQualityFlagActionInput = {
  issueType: DataQualityFlagCreatedPayload["category"];
  note?: string;
};

type DataQualityFlagActionProps = {
  tail: string;
  onCreateFlag: (input: DataQualityFlagActionInput) => void;
};

const issueOptions: Array<{ value: DataQualityFlagActionInput["issueType"]; label: string }> = [
  { value: "manual_user_flag", label: "Manual flag" },
  { value: "source_stale", label: "Source stale" },
  { value: "state_conflict", label: "State conflict" },
  { value: "equipment_mismatch", label: "Equipment mismatch" },
  { value: "missing_reference_data", label: "Missing reference" },
];

export function DataQualityFlagAction({ tail, onCreateFlag }: DataQualityFlagActionProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [issueType, setIssueType] =
    useState<DataQualityFlagActionInput["issueType"]>("manual_user_flag");
  const [note, setNote] = useState("");

  return (
    <div className="relative">
      <Button
        aria-label={`Flag data quality for ${tail}`}
        onClick={() => setIsOpen((current) => !current)}
        size="icon"
        title="Flag data quality"
        type="button"
        variant="ghost"
      >
        <Flag data-icon="inline-start" />
      </Button>

      {isOpen ? (
        <form
          aria-label={`Data quality flag for ${tail}`}
          className="absolute right-0 top-full z-30 mt-2 grid w-72 gap-2 rounded-product border border-neutral-200 bg-white p-3 text-xs shadow-lg"
          onSubmit={(event) => {
            event.preventDefault();
            onCreateFlag({
              issueType,
              note: note.trim() || undefined,
            });
            setNote("");
            setIssueType("manual_user_flag");
            setIsOpen(false);
          }}
        >
          <label className="grid gap-1 font-semibold text-neutral-700">
            Data quality issue type
            <select
              aria-label="Data quality issue type"
              className="h-9 rounded-product border border-neutral-300 bg-white px-2 text-sm text-neutral-950"
              onChange={(event) =>
                setIssueType(event.target.value as DataQualityFlagActionInput["issueType"])
              }
              value={issueType}
            >
              {issueOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>

          <label className="grid gap-1 font-semibold text-neutral-700">
            Data quality note
            <input
              aria-label="Data quality note"
              className="h-9 rounded-product border border-neutral-300 px-2 text-sm text-neutral-950"
              onChange={(event) => setNote(event.target.value)}
              placeholder="Optional note"
              value={note}
            />
          </label>

          <Button size="sm" type="submit" variant="outline">
            Create data quality flag
          </Button>
        </form>
      ) : null}
    </div>
  );
}
