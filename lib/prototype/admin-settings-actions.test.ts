import { beforeEach, describe, expect, it } from "vitest";

import { reasonTaxonomySettings } from "@/lib/fixtures/reference/reason-taxonomy";

import {
  clearSettingsEvents,
  latestSettingsEventFor,
  readSettingsEvents,
} from "./settings-event-store";
import {
  createSettingsDraft,
  discardSettingsDraft,
  resetSettingsDraftToDefault,
  saveSettingsDraft,
  stageSettingsDraft,
} from "./admin-settings-actions";

describe("admin-settings-actions", () => {
  beforeEach(() => {
    clearSettingsEvents();
    localStorage.clear();
  });

  it("saves a staged settings change as a versioned settings_changed event", () => {
    const draft = createSettingsDraft("reason_taxonomy", reasonTaxonomySettings);
    const staged = stageSettingsDraft(draft, {
      ...draft.stagedSnapshot,
      defaultReviewIntervalMinutes: 45,
    });

    const saved = saveSettingsDraft(staged, {
      changedBy: "hq-admin",
      changedAt: "2026-05-23T07:00:00.000Z",
      summary: "Updated default review interval.",
    });

    expect(saved.isDirty).toBe(false);
    expect(saved.savedEvent.payload.settingsVersion).toBe("reason-taxonomy-v2");
    expect(saved.savedEvent.payload.snapshot.defaultReviewIntervalMinutes).toBe(45);
    expect(readSettingsEvents()).toHaveLength(1);
    expect(latestSettingsEventFor("reason_taxonomy")?.payload.settingsVersion).toBe(
      "reason-taxonomy-v2",
    );
  });

  it("discards staged changes back to the saved state", () => {
    const draft = createSettingsDraft("reason_taxonomy", reasonTaxonomySettings);
    const staged = stageSettingsDraft(draft, {
      ...draft.stagedSnapshot,
      defaultReviewIntervalMinutes: 60,
    });

    const discarded = discardSettingsDraft(staged);

    expect(discarded.isDirty).toBe(false);
    expect(discarded.stagedSnapshot.defaultReviewIntervalMinutes).toBe(30);
  });

  it("resets to defaults by creating a snapshot event", () => {
    const draft = createSettingsDraft("reason_taxonomy", reasonTaxonomySettings);
    const staged = stageSettingsDraft(draft, {
      ...draft.stagedSnapshot,
      defaultReviewIntervalMinutes: 60,
    });

    const reset = resetSettingsDraftToDefault(staged, {
      changedBy: "hq-admin",
      changedAt: "2026-05-23T08:00:00.000Z",
      summary: "Reset reason taxonomy defaults.",
    });

    expect(reset.stagedSnapshot.defaultReviewIntervalMinutes).toBe(30);
    expect(reset.savedEvent.payload.settingsVersion).toBe("reason-taxonomy-v2");
    expect(readSettingsEvents()[0].payload.summary).toBe("Reset reason taxonomy defaults.");
  });
});
