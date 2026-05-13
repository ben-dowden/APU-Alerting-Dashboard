import { afterEach, describe, expect, it, vi } from "vitest";
import { clearStoredReasons, readReason, writeReason } from "./reasonStore";

function createMemoryStorage() {
  const store = new Map<string, string>();
  return {
    getItem: (key: string) => store.get(key) ?? null,
    setItem: (key: string, value: string) => {
      store.set(key, value);
    },
    removeItem: (key: string) => {
      store.delete(key);
    },
  };
}

describe("reasonStore", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("isolates captured reasons by scenario", () => {
    vi.stubGlobal("window", { localStorage: createMemoryStorage() });

    writeReason("VH-8IA", "crew-request", "Baseline note", { scenarioId: "baseline-night" });
    writeReason("VH-8IA", "maintenance", "BNE note", { scenarioId: "bne-high-burn" });

    expect(readReason("VH-8IA", { scenarioId: "baseline-night" })).toMatchObject({
      code: "crew-request",
      note: "Baseline note",
    });
    expect(readReason("VH-8IA", { scenarioId: "bne-high-burn" })).toMatchObject({
      code: "maintenance",
      note: "BNE note",
    });
  });

  it("clears stored reasons", () => {
    vi.stubGlobal("window", { localStorage: createMemoryStorage() });
    writeReason("VH-8IA", "crew-request", "Baseline note", { scenarioId: "baseline-night" });

    clearStoredReasons();

    expect(readReason("VH-8IA", { scenarioId: "baseline-night" }).code).toBe("none");
  });
});
