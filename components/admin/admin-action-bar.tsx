"use client";

import { RotateCcw, Save, Undo2 } from "lucide-react";

import { Button } from "@/components/ui/button";

type AdminActionBarProps = {
  hasValidationErrors: boolean;
  isDirty: boolean;
  onDiscard: () => void;
  onReset: () => void;
  onSave: () => void;
};

export function AdminActionBar({
  hasValidationErrors,
  isDirty,
  onDiscard,
  onReset,
  onSave,
}: AdminActionBarProps) {
  return (
    <div className="flex flex-wrap items-center justify-end gap-2 border border-neutral-200 bg-white p-3">
      <Button
        disabled={!isDirty}
        onClick={onDiscard}
        type="button"
        variant="outline"
        size="sm"
      >
        <Undo2 data-icon aria-hidden="true" />
        Discard staged settings
      </Button>
      <Button onClick={onReset} type="button" variant="ghost" size="sm">
        <RotateCcw data-icon aria-hidden="true" />
        Reset to defaults
      </Button>
      <Button disabled={!isDirty || hasValidationErrors} onClick={onSave} type="button" size="sm">
        <Save data-icon aria-hidden="true" />
        Save staged settings
      </Button>
    </div>
  );
}
