import type { DomainEvent } from "@/lib/events";
import { isDomainEvent } from "@/lib/events";

export const WORKFLOW_EVENT_STORAGE_KEY = "apu-alerting-dashboard.workflow-events";

let memoryEvents: DomainEvent[] = [];
const workflowEventsChangedEvent = "apu-alerting-dashboard.workflow-events.changed";
const memoryListeners = new Set<() => void>();

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
    return Array.isArray(parsed) ? parsed.filter(isDomainEvent) : [];
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

const notifyWorkflowEventsChanged = () => {
  const browserWindow = typeof window === "undefined" ? undefined : window;

  if (browserWindow) {
    browserWindow.dispatchEvent(new CustomEvent(workflowEventsChangedEvent));
    return;
  }

  memoryListeners.forEach((listener) => listener());
};

export const appendWorkflowEvent = (event: DomainEvent) => {
  const nextEvents = [...readWorkflowEvents(), event];
  memoryEvents = nextEvents;

  storage()?.setItem(WORKFLOW_EVENT_STORAGE_KEY, JSON.stringify(nextEvents));
  notifyWorkflowEventsChanged();
};

export const clearWorkflowEvents = () => {
  memoryEvents = [];
  storage()?.removeItem(WORKFLOW_EVENT_STORAGE_KEY);
  notifyWorkflowEventsChanged();
};

export const subscribeWorkflowEvents = (listener: () => void) => {
  const browserWindow = typeof window === "undefined" ? undefined : window;

  if (!browserWindow) {
    memoryListeners.add(listener);
    return () => memoryListeners.delete(listener);
  }

  const onLocalChange = () => listener();
  const onStorageChange = (event: StorageEvent) => {
    if (event.key === WORKFLOW_EVENT_STORAGE_KEY) {
      listener();
    }
  };

  browserWindow.addEventListener(workflowEventsChangedEvent, onLocalChange);
  browserWindow.addEventListener("storage", onStorageChange);

  return () => {
    browserWindow.removeEventListener(workflowEventsChangedEvent, onLocalChange);
    browserWindow.removeEventListener("storage", onStorageChange);
  };
};
