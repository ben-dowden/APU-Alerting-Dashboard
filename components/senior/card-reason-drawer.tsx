"use client";

import { type FormEvent, type ReactNode, useEffect, useRef, useState } from "react";

import type { ReasonSegment } from "@/lib/domain/reason-chain-reducer";
import { Button } from "@/components/ui/button";

import { ReasonTimelineStrip } from "./reason-timeline-strip";

type CardReasonDrawerProps = {
  isOpen: boolean;
  tail: string;
  currentReason?: ReasonSegment;
  segments: ReasonSegment[];
  onClose: () => void;
  onAddNote: (note: string) => void;
  onCorrectSegment?: (segment: ReasonSegment) => void;
  correctionControls?: ReactNode;
};

export function CardReasonDrawer({
  isOpen,
  tail,
  currentReason,
  segments,
  onClose,
  onAddNote,
  onCorrectSegment,
  correctionControls,
}: CardReasonDrawerProps) {
  const drawerRef = useDismissableDrawer(isOpen, onClose);
  const [note, setNote] = useState("");

  const handleNoteSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmedNote = note.trim();
    if (!trimmedNote) {
      return;
    }

    onAddNote(trimmedNote);
    setNote("");
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div
      aria-label={`Reason chain for ${tail}`}
      className="absolute left-0 top-full z-30 mt-2 flex w-full flex-col gap-4 rounded-product border border-neutral-200 bg-white p-4 shadow-lg"
      ref={drawerRef}
      role="dialog"
    >
      <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_minmax(280px,360px)]">
        <div className="flex flex-col gap-3">
          <CurrentReasonPanel currentReason={currentReason} />
          <ReasonTimelineStrip onCorrectSegment={onCorrectSegment} segments={segments} />
          {correctionControls}
        </div>

        <ReasonNoteForm
          note={note}
          onChange={setNote}
          onSubmit={handleNoteSubmit}
          tail={tail}
        />
      </div>
    </div>
  );
}

function useDismissableDrawer(isOpen: boolean, onClose: () => void) {
  const drawerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) {
      return undefined;
    }

    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    const closeOnOutsideClick = (event: MouseEvent) => {
      const target = event.target;
      if (target instanceof Node && !drawerRef.current?.contains(target)) {
        onClose();
      }
    };

    document.addEventListener("keydown", closeOnEscape);
    document.addEventListener("mousedown", closeOnOutsideClick);

    return () => {
      document.removeEventListener("keydown", closeOnEscape);
      document.removeEventListener("mousedown", closeOnOutsideClick);
    };
  }, [drawerRef, isOpen, onClose]);

  return drawerRef;
}

function CurrentReasonPanel({ currentReason }: { currentReason?: ReasonSegment }) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-normal text-neutral-500">
        Current reason
      </p>
      {currentReason ? (
        <div className="mt-1">
          <p className="text-sm font-semibold text-neutral-950">
            {currentReason.categoryLabel}
          </p>
          <p className="text-xs font-medium text-neutral-600">
            {currentReason.detailLabel}
          </p>
        </div>
      ) : (
        <p className="mt-1 text-sm font-semibold text-neutral-600">Reason pending</p>
      )}
    </div>
  );
}

type ReasonNoteFormProps = {
  tail: string;
  note: string;
  onChange: (note: string) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
};

function ReasonNoteForm({ tail, note, onChange, onSubmit }: ReasonNoteFormProps) {
  return (
    <form className="flex flex-col gap-2" onSubmit={onSubmit}>
      <label
        className="text-xs font-semibold uppercase tracking-normal text-neutral-500"
        htmlFor={`${tail}-reason-note`}
      >
        Note
      </label>
      <textarea
        aria-label="Reason note"
        className="min-h-24 rounded-product border border-neutral-300 bg-white p-3 text-sm font-medium text-neutral-950 outline-none focus-visible:ring-2 focus-visible:ring-virgin-purple"
        id={`${tail}-reason-note`}
        onChange={(event) => onChange(event.target.value)}
        value={note}
      />
      <div className="flex justify-end">
        <Button disabled={!note.trim()} size="sm" type="submit" variant="secondary">
          Add note
        </Button>
      </div>
    </form>
  );
}
