"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";

import type { DomainEvent } from "@/lib/events";
import { readWorkflowEvents, subscribeWorkflowEvents } from "./workflow-event-store";

const useBrowserLayoutEffect = typeof window === "undefined" ? useEffect : useLayoutEffect;

export const workflowTailForEvent = (event: DomainEvent) =>
  event.correlation.tail ??
  ("tail" in event.payload && typeof event.payload.tail === "string"
    ? event.payload.tail
    : undefined);

export function useWorkflowEvents() {
  const [workflowEvents, setWorkflowEvents] = useState<DomainEvent[]>([]);

  useBrowserLayoutEffect(() => {
    const syncWorkflowEvents = () => setWorkflowEvents(readWorkflowEvents());

    syncWorkflowEvents();
    return subscribeWorkflowEvents(syncWorkflowEvents);
  }, []);

  return workflowEvents;
}

export function useRecentlyActionedWorkflowTail(
  workflowEvents: readonly DomainEvent[],
  highlightMs = 1600,
) {
  const latestEventIdRef = useRef(workflowEvents.at(-1)?.eventId);
  const timeoutRef = useRef<number | undefined>(undefined);
  const [tail, setTail] = useState<string>();

  useEffect(() => {
    const latestEvent = workflowEvents.at(-1);
    if (!latestEvent || latestEvent.eventId === latestEventIdRef.current) {
      return undefined;
    }

    latestEventIdRef.current = latestEvent.eventId;
    const latestTail = workflowTailForEvent(latestEvent);
    if (!latestTail) {
      return undefined;
    }

    setTail(latestTail);

    if (timeoutRef.current) {
      window.clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = window.setTimeout(() => {
      setTail((currentTail) => (currentTail === latestTail ? undefined : currentTail));
      timeoutRef.current = undefined;
    }, highlightMs);

    return undefined;
  }, [highlightMs, workflowEvents]);

  useEffect(
    () => () => {
      if (timeoutRef.current) {
        window.clearTimeout(timeoutRef.current);
      }
    },
    [],
  );

  return tail;
}
