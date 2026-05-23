import type { SettingsFamily } from "@/lib/events";

import {
  appendSettingsEvent,
  buildSettingsChangedEvent,
  currentSettingsEventFor,
  defaultSettingsEvents,
  type SettingsEventByFamily,
  type SettingsSnapshotByFamily,
} from "./settings-event-store";

export type SettingsDraft<TFamily extends SettingsFamily> = {
  family: TFamily;
  defaultEvent: SettingsEventByFamily<TFamily>;
  savedEvent: SettingsEventByFamily<TFamily>;
  stagedSnapshot: SettingsSnapshotByFamily[TFamily];
  isDirty: boolean;
};

export type SettingsActionMetadata = {
  changedBy: string;
  changedAt: string;
  summary: string;
};

const snapshotsEqual = (left: unknown, right: unknown) =>
  JSON.stringify(left) === JSON.stringify(right);

const draftFromSavedEvent = <TFamily extends SettingsFamily>(
  family: TFamily,
  defaultEvent: SettingsEventByFamily<TFamily>,
  savedEvent: SettingsEventByFamily<TFamily>,
): SettingsDraft<TFamily> => ({
  family,
  defaultEvent,
  savedEvent,
  stagedSnapshot: savedEvent.payload.snapshot,
  isDirty: false,
});

export const createSettingsDraft = <TFamily extends SettingsFamily>(
  family: TFamily,
  defaultEvent?: SettingsEventByFamily<TFamily>,
): SettingsDraft<TFamily> => {
  const resolvedDefaultEvent =
    defaultEvent ?? (defaultSettingsEvents[family] as SettingsEventByFamily<TFamily>);

  return draftFromSavedEvent(family, resolvedDefaultEvent, currentSettingsEventFor(family));
};

export const stageSettingsDraft = <TFamily extends SettingsFamily>(
  draft: SettingsDraft<TFamily>,
  stagedSnapshot: SettingsSnapshotByFamily[TFamily],
): SettingsDraft<TFamily> => ({
  ...draft,
  stagedSnapshot,
  isDirty: !snapshotsEqual(stagedSnapshot, draft.savedEvent.payload.snapshot),
});

export const discardSettingsDraft = <TFamily extends SettingsFamily>(
  draft: SettingsDraft<TFamily>,
): SettingsDraft<TFamily> => ({
  ...draft,
  stagedSnapshot: draft.savedEvent.payload.snapshot,
  isDirty: false,
});

export const saveSettingsDraft = <TFamily extends SettingsFamily>(
  draft: SettingsDraft<TFamily>,
  metadata: SettingsActionMetadata,
): SettingsDraft<TFamily> => {
  const event = buildSettingsChangedEvent({
    family: draft.family,
    previousEvent: draft.savedEvent,
    snapshot: draft.stagedSnapshot,
    changedBy: metadata.changedBy,
    changedAt: metadata.changedAt,
    summary: metadata.summary,
  });

  appendSettingsEvent(event);

  return draftFromSavedEvent(draft.family, draft.defaultEvent, event);
};

export const resetSettingsDraftToDefault = <TFamily extends SettingsFamily>(
  draft: SettingsDraft<TFamily>,
  metadata: SettingsActionMetadata,
): SettingsDraft<TFamily> => {
  const event = buildSettingsChangedEvent({
    family: draft.family,
    previousEvent: draft.savedEvent,
    snapshot: draft.defaultEvent.payload.snapshot,
    changedBy: metadata.changedBy,
    changedAt: metadata.changedAt,
    summary: metadata.summary,
  });

  appendSettingsEvent(event);

  return draftFromSavedEvent(draft.family, draft.defaultEvent, event);
};
