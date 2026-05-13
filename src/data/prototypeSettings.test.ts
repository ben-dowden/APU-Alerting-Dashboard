import { describe, expect, it } from "vitest";
import {
  DEFAULT_PROTOTYPE_SETTINGS,
  readPrototypeSettings,
  resetPrototypeSettings,
  writePrototypeSettings,
} from "./prototypeSettings";

function createMemoryStorage() {
  const store = new Map<string, string>();
  return {
    getItem: (key: string) => store.get(key) ?? null,
    setItem: (key: string, value: string) => store.set(key, value),
    removeItem: (key: string) => store.delete(key),
  };
}

describe("prototype settings", () => {
  it("persists selected scenario and playback speed", () => {
    const storage = createMemoryStorage();

    writePrototypeSettings(
      {
        scenarioId: "bne-high-burn",
        speedMultiplier: 4,
        isPaused: true,
      },
      storage,
    );

    expect(readPrototypeSettings(storage)).toEqual({
      scenarioId: "bne-high-burn",
      speedMultiplier: 4,
      isPaused: true,
    });
  });

  it("falls back to defaults for invalid stored settings", () => {
    const storage = createMemoryStorage();
    storage.setItem("apu-alerting-dashboard:prototype-settings", JSON.stringify({ scenarioId: "bad", speedMultiplier: 3 }));

    expect(readPrototypeSettings(storage)).toEqual(DEFAULT_PROTOTYPE_SETTINGS);
  });

  it("resets settings", () => {
    const storage = createMemoryStorage();
    writePrototypeSettings({ scenarioId: "quiet-night", speedMultiplier: 2, isPaused: true }, storage);

    expect(resetPrototypeSettings(storage)).toEqual(DEFAULT_PROTOTYPE_SETTINGS);
    expect(readPrototypeSettings(storage)).toEqual(DEFAULT_PROTOTYPE_SETTINGS);
  });
});
