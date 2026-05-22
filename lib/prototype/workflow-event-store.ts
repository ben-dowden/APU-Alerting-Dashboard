import type { DomainEvent } from "@/lib/events";

export const WORKFLOW_EVENT_STORAGE_KEY = "apu-alerting-dashboard.workflow-events";

let memoryEvents: DomainEvent[] = [];

const storage = () => {
  try {
    return globalThis.localStorage;
  } catch {
    return undefined;
  }
};

const parseStoredEvents = (storedEvents: string | null): DomainEvent[] => {
  if (!storedEvents) {
    return [];
  }

  try {
    const parsed = JSON.parse(storedEvents);
    return Array.isArray(parsed) ? (parsed as DomainEvent[]) : [];
  } catch {
    return [];
  }
};

export const readWorkflowEvents = (): DomainEvent[] => {
  const browserStorage = storage();
  if (!browserStorage) {
    return [...memoryEvents];
  }

  return parseStoredEvents(browserStorage.getItem(WORKFLOW_EVENT_STORAGE_KEY));
};

export const appendWorkflowEvent = (event: DomainEvent) => {
  const nextEvents = [...readWorkflowEvents(), event];
  memoryEvents = nextEvents;

  storage()?.setItem(WORKFLOW_EVENT_STORAGE_KEY, JSON.stringify(nextEvents));
};

export const clearWorkflowEvents = () => {
  memoryEvents = [];
  storage()?.removeItem(WORKFLOW_EVENT_STORAGE_KEY);
};
